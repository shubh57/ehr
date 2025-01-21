// src-tauri/src/patients.rs

// Dependencies
use tauri::State;
use crate::db::DatabaseState;
use sqlx::{postgres::PgRow, Column, Row};
use chrono;
use serde::Serialize;
use chrono::{Utc, NaiveDate, DateTime};

// Struct to store result of get_patient_data
#[derive(Serialize)]
pub struct PatientData {
    patient_id: i32, 
    mr_number: String,
    first_name: String,
    last_name: String,
    date_of_birth: NaiveDate,
    gender: String,
    patient_photo: Option<String>,
    created_at: Option<DateTime<Utc>>
}

// Struct to store result of get_appointment_data
#[derive(Serialize)]
pub struct AppointmentData {
    patient_id: i32,
    mr_number: String,
    first_name: String,
    last_name: String,
    date_of_birth: NaiveDate,
    gender: String,
    patient_photo: Option<Vec<u8>>,
    created_at: Option<DateTime<Utc>>,
    activity_id: Option<i32>,
    status: Option<String>,
    activity: Option<String>,
    doctors_note: Option<String>,
    patient_complaint: Option<String>,
    activity_time: Option<DateTime<Utc>>,
    activity_created_at: Option<DateTime<Utc>>
}

// Endpoint to get all patients data
#[tauri::command]
pub async fn get_patients_data(state: State<'_, DatabaseState>) -> Result<Vec<PatientData>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(err) => {
            eprintln!("Encryption key not provided: {}", err);
            return Err("Encryption key not provided.".to_string());
        }
    };

    match sqlx::query_as!(
        PatientData,
        r#"
        SELECT 
            patient_id,
            mr_number,
            first_name,
            last_name,
            date_of_birth,
            gender,
            pgp_sym_decrypt(patient_photo::bytea, $1) as patient_photo,
            created_at
        FROM patients
        "#,
        &encryption_key
    )
    .fetch_all(&*pool)
    .await {
        Ok(patients) => Ok(patients),
        Err(err) => Err(format!("Failed to fetch appointment data: {}", err).as_str().to_string())
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
            p.patient_photo,
            p.created_at,
            pa.activity_id,
            pa.status,
            pgp_sym_decrypt(pa.activity::bytea, $1) as activity,
            pgp_sym_decrypt(pa.doctors_note::bytea, $1) as doctors_note,
            pgp_sym_decrypt(pa.patient_complaint::bytea, $1) as patient_complaint,
            pa.activity_time,
            pa.created_at as activity_created_at
        FROM patient_activity pa
        LEFT JOIN patients p ON p.patient_id = pa.patient_id
        WHERE DATE(pa.activity_time) = CURRENT_DATE
        ORDER BY pa.activity_time ASC
        "#,
        &encryption_key
    )
    .fetch_all(&*pool)
    .await {
        Ok(patients) => Ok(patients),
        Err(err) => Err(format!("Failed to fetch appointment data: {}", err))
    }
}