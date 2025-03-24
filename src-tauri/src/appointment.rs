// src-tauri/src/appointment.rs

// Dependencies
use crate::{auth::get_user_from_token, DatabaseState};
use chrono::{DateTime, Duration, Utc};
use serde::{Serialize, Deserialize};
use sqlx::postgres::types::PgInterval;

#[derive(Serialize)]
pub struct Appointment {
    appointment_id: i32,
    description: Option<String>,
    appointment_time: Option<DateTime<Utc>>,
    appointment_duration: Option<i64>,
    created_by: Option<i32>,
    created_at: Option<DateTime<Utc>>
}

#[tauri::command]
pub async fn get_appointments(
    state: tauri::State<'_, DatabaseState>,
    token: String,
    user_id: Option<i32>
) -> Result<Vec<Appointment>, String> {
    let pool = state.pool.lock().await;
    let user = get_user_from_token(token)?;

    let user_id = match user_id {
        Some(val) => val,
        None => user.user_id
    };

    sqlx::query_as!(
        Appointment,
        r#"
        SELECT DISTINCT 
            a.appointment_id,
            a.description,
            a.appointment_time,
            (EXTRACT(EPOCH FROM a.appointment_duration) * 1000000)::BIGINT as "appointment_duration?",
            a.created_by,
            a.created_at
        FROM
            appointments a
        JOIN
            appointment_users au 
        ON
            au.appointment_id = a.appointment_id
        WHERE
            au.user_id = $1
        ORDER BY
            a.appointment_time DESC
        "#,
        &user_id
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Error while fetching appointments: {}", e))
}

#[tauri::command]
pub async fn create_appointment(
    state: tauri::State<'_, DatabaseState>,
    token: String,
    description: String,
    appointment_time: String,
    appointment_duration: i64,
    users: Vec<i32>
) -> Result<Appointment, String> {
    let pool = state.pool.lock().await;
    let user = get_user_from_token(token)?;

    let appointment_time = appointment_time.parse::<DateTime<Utc>>().map_err(|e| format!("Invalid appointment time: {}", e))?;
    let appointment_duration = PgInterval {
        months: 0,
        days: 0,
        microseconds: appointment_duration * 1_000_000
    };

    let appointment = sqlx::query_as!(
        Appointment,
        r#"
        INSERT INTO
            appointments (description, appointment_time, appointment_duration, created_by)
        VALUES
            ($1, $2, $3, $4)
        RETURNING
            appointment_id,
            description,
            appointment_time,
            (EXTRACT(EPOCH FROM appointment_duration) * 1000000)::BIGINT as "appointment_duration?",
            created_by,
            created_at
        "#,
        &description,
        &appointment_time,
        &appointment_duration,
        &user.user_id
    )
    .fetch_one(&*pool)
    .await
    .map_err(|e| format!("Error while creating appointment: {}", e))?;

    for user in users.iter() {
        sqlx::query!(
            r#"
            INSERT INTO appointment_users (appointment_id, user_id)
            VALUES ($1, $2)
            RETURNING *
            "#,
            &appointment.appointment_id,
            user
        )
        .fetch_one(&*pool)
        .await
        .map_err(|e| format!("Error while adding user to appointment: {}", e))?;
    }

    Ok(appointment)
}