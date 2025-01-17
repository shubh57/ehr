// src-tauri/src/patients.rs

// Dependencies
use tauri::State;
use crate::db::DatabaseState;
use sqlx::{postgres::PgRow, Column, Row};
use chrono;
use serde::Serialize;
use chrono::{Utc, NaiveDate, DateTime};


// Struct to store result of get_appointment_data
#[derive(Serialize)]
pub struct AppointmentData {
    patient_id: i32,
    mr_number: String,
    first_name: String,
    last_name: String,
    date_of_birth: NaiveDate,
    gender: String,
    appointment_time: Option<DateTime<Utc>>,
    patient_photo: Option<Vec<u8>>,
    created_at: Option<DateTime<Utc>>,
    activity_id: Option<i32>,
    status: Option<String>,
    activity: Option<String>,
    doctors_note: Option<String>,
    activity_time: Option<DateTime<Utc>>,
    activity_created_at: Option<DateTime<Utc>>
}

// Endpoint to get all patients data
#[tauri::command]
pub async fn get_patients_data(state: State<'_, DatabaseState>) -> Result<Vec<Vec<String>>, String> {
    let pool = state.pool.lock().await;
    
    match sqlx::query("SELECT * FROM patients")
        .fetch_all(&*pool)
        .await 
    {
        Ok(rows) => {
            let mut result = Vec::new();
            
            for row in rows {
                let mut raw_data = Vec::new();
                let num_cols = row.len();
                for column in row.columns() {
                    let value = match column.type_info().to_string().as_str() {
                        "INT4" => row.try_get::<Option<i32>, _>(column.ordinal())
                            .unwrap_or(None)
                            .map_or("NULL".to_string(), |v| v.to_string()),
                        "VARCHAR" => row.try_get::<Option<String>, _>(column.ordinal())
                            .unwrap_or(None)
                            .map_or("NULL".to_string(), |v| v),
                        "DATE" => row.try_get::<Option<chrono::NaiveDate>, _>(column.ordinal())
                            .unwrap_or(None)
                            .map_or("NULL".to_string(), |v| v.to_string()),
                        "TIMESTAMPTZ" => row.try_get::<Option<chrono::DateTime<chrono::Utc>>, _>(column.ordinal())
                            .unwrap_or(None)
                            .map_or("NULL".to_string(), |v| v.to_string()),
                        _ => "NULL".to_string()
                    };

                    raw_data.push(value);
                }
                
                result.push(raw_data);
            }
            Ok(result)
        }
        Err(err) => Err(format!("Failed to fetch patients data: {}", err))
    }
}

// Endpoint to get appointment data
#[tauri::command]
pub async fn get_appointment_data(state: State<'_, DatabaseState>) -> Result<Vec<AppointmentData>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => {key},
        Err(err) => {"".to_string()},
    };

    match sqlx::query_as!(
        AppointmentData,
        r#"
        SELECT 
            p.patient_id,
            p.mr_number,
            p.first_name,
            p.last_name,
            p.date_of_birth,
            p.gender,
            p.appointment_time,
            p.patient_photo,
            p.created_at,
            pa.activity_id,
            pa.status,
            pgp_sym_decrypt(pa.activity::bytea, $1) as activity,
            pgp_sym_decrypt(pa.doctors_note::bytea, $1) as doctors_note,
            pa.activity_time,
            pa.created_at as activity_created_at
        FROM patients p
        LEFT JOIN patient_activity pa ON p.patient_id = pa.patient_id
        ORDER BY p.patient_id, pa.activity_time DESC
        "#,
        &encryption_key
    )
    .fetch_all(&*pool)
    .await {
        Ok(patients) => Ok(patients),
        Err(err) => Err(format!("Failed to fetch appointment data: {}", err))
    }
}