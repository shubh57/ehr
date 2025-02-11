// src-tauri/src/patients.rs

// Dependencies
use tauri::State;
use std::fmt::format;
use crate::db::DatabaseState;
use sqlx::{pool, postgres::PgRow, Column};
use chrono;
use serde::Serialize;
use chrono::{Utc, NaiveDate, DateTime};

// Struct to store result of get_patient_data
#[derive(Serialize, Clone)]
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

// Struct to store result of get_patient_activity_data
#[derive(Serialize, Clone)]
pub struct PatientActivityData {
    activity_id: i32,
    activity: Option<String>,
    activity_time: Option<DateTime<Utc>>,
    status: Option<String>
}

// Struct to store result of get_patient_history_data
#[derive(Serialize, Clone)]
pub struct PatientHistoryData {
    history_id: i32,
    patient_id: Option<i32>,
    medical_conditions: Option<String>,
    medications: Option<String>,
    allergies: Option<String>,
    last_visit: Option<DateTime<Utc>>,
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
    patient_photo: Option<String>,
    created_at: Option<DateTime<Utc>>,
    activity_id: Option<i32>,
    status: Option<String>,
    activity: Option<String>,
    doctors_note: Option<String>,
    patient_complaint: Option<String>,
    activity_time: Option<DateTime<Utc>>,
    activity_created_at: Option<DateTime<Utc>>
}

// Struct to store result of get_patient_doctor_data
#[derive(Serialize)]
pub struct PatientDoctorData {
    doctors_note: Option<String>,
    patient_complaint: Option<String>,
    activity_time: Option<DateTime<Utc>>
}

// Struct to store result of get_all_procedures
#[derive(Serialize)]
pub struct Procedure {
    procedure_id: i32,
    procedure_name: Option<String>,
    description: Option<String>,
    created_at: Option<DateTime<Utc>>
}

// Struct to store result of get_patient_procedures
#[derive(Serialize)]
pub struct PatientProcedureData {
    activity_id: i32,
    status: String,
    procedure_name: Option<String>,
    procedure_description: Option<String>,
    doctors_note: Option<String>,
    patient_complaint: Option<String>,
    comments: Option<String>,
    activity_time: Option<DateTime<Utc>>
}

// Endpoint to get data of specific patient
#[tauri::command]
pub async fn get_patient_data(state: tauri::State<'_, DatabaseState>, patient_id: i32) -> Result<PatientData, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(err) => {
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
        WHERE patient_id = $2
        "#,
        &encryption_key, patient_id
    )
    .fetch_all(&*pool)
    .await {
        Ok(patients) => {
            if patients.len() != 1 {
                Err(format!("Patient does not exists").as_str().to_string())
            } else {
                Ok(patients[0].clone())
            }
        },
        Err(err) => Err(format!("Failed to fetch patient data: {}", err).as_str().to_string())
    }
}

// Endpoint to get all patients data
    #[tauri::command]
pub async fn get_patients_data(state: State<'_, DatabaseState>) -> Result<Vec<PatientData>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(err) => {
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

// Endpoint to get all activity for a particular patient
#[tauri::command]
pub async fn get_patient_activity_data(state: tauri::State<'_, DatabaseState>, patient_id: i32) -> Result<Vec<PatientActivityData>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => {key},
        Err(err) => {"".to_string()},
    };

    match sqlx::query_as!(
        PatientActivityData,
        r#"
        SELECT 
            pa.activity_id,
            pgp_sym_decrypt(p.procedure_name::bytea, $1) as activity,
            pa.activity_time,
            pa.status
        FROM
            patient_activity pa
        LEFT JOIN
            procedures p
        ON
            pa.procedure_id = p.procedure_id
        WHERE
            patient_id = $2
        ORDER BY
            activity_time DESC
        "#,
        &encryption_key, 
        &patient_id
    )
    .fetch_all(&*pool)
    .await {
        Ok(patient_activity_data) => Ok(patient_activity_data),
        Err(err) => Err(format!("Error while fetching patient activity data: {}", err)) 
    }
}

// Endpoint to get today's appointment data
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
            pgp_sym_decrypt(p.patient_photo::bytea, $1) as patient_photo,
            p.created_at,
            pa.activity_id,
            pa.status,
            pgp_sym_decrypt(pr.procedure_name::bytea, $1) as activity,
            pgp_sym_decrypt(pa.doctors_note::bytea, $1) as doctors_note,
            pgp_sym_decrypt(pa.patient_complaint::bytea, $1) as patient_complaint,
            pa.activity_time,
            pa.created_at as activity_created_at
        FROM patient_activity pa
        LEFT JOIN patients p ON p.patient_id = pa.patient_id
        LEFT JOIN procedures pr ON pr.procedure_id = pa.procedure_id
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

// Endpoint to get patient summary data
#[tauri::command]
pub async fn get_patient_summary_data(state: State<'_, DatabaseState>, patient_id: i32) -> Result<Vec<String>, String> {
    Ok(vec![
        "Parvon experienced red and watery eyes.".to_string(),
        "He mentioned that he had been playing in a pool the day before the symptoms started.".to_string(),
        "Scans were performed to assess the condition of his eyes.".to_string(),
        "The results revealed findings that require surgical intervention.".to_string(),
        "A follow-up visit was scheduled to discuss the surgery and next steps.".to_string(),
    ])
}

// Endpoint to get patient history data
#[tauri::command]
pub async fn get_patient_history_data(state: State<'_, DatabaseState>, patient_id: i32) -> Result<PatientHistoryData, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => {key},
        Err(err) => {"".to_string()},
    };

    match sqlx::query_as!(
        PatientHistoryData,
        r#"
        SELECT 
            history_id,
            patient_id,
            pgp_sym_decrypt(medical_conditions::bytea, $1) as medical_conditions,
            pgp_sym_decrypt(medications::bytea, $1) as medications,
            pgp_sym_decrypt(allergies::bytea, $1) as allergies,
            (
                SELECT MAX(activity_time)
                FROM patient_activity
                WHERE patient_id = $2
            ) as last_visit
        FROM
            patient_history
        WHERE
            patient_id = $2
        "#,
        &encryption_key,
        &patient_id
    )
    .fetch_all(&*pool)
    .await {
        Ok(patient_history_data) => {
            if patient_history_data.len() == 0 {
                Err(format!("Error while fetching patient history data: No data found."))
            } else {
                Ok(patient_history_data[0].clone())
            }
        }, 
        Err(err) => Err(format!("Error while fetching patient history data: {}", err))
    }
}

// Endpoint to get previous doctors notes and patient complaints for a patient
#[tauri::command]
pub async fn get_patient_doctor_data(state: State<'_, DatabaseState>, patient_id: i32) -> Result<Vec<PatientDoctorData>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => {key},
        Err(err) => {"".to_string()},
    };

    match sqlx::query_as!(
        PatientDoctorData,
        r#"
        SELECT 
            pgp_sym_decrypt(doctors_note::bytea, $1) as doctors_note,
            pgp_sym_decrypt(patient_complaint::bytea, $1) as patient_complaint,
            activity_time
        FROM
            patient_activity
        WHERE
            patient_id = $2
        "#,
        &encryption_key,
        &patient_id
    )
    .fetch_all(&*pool)
    .await {
        Ok(patient_doctor_data) => Ok(patient_doctor_data),
        Err(err) => Err(format!("Error while getting patient doctor data: {}", err))
    }
}

// Endpoint to get all procedures
#[tauri::command]
pub async fn get_all_procedures(state: State<'_, DatabaseState>) -> Result<Vec<Procedure>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => {key},
        Err(err) => {"".to_string()},
    };

    match sqlx::query_as!(
        Procedure,
        r#"
        SELECT
            procedure_id,
            pgp_sym_decrypt(procedure_name::bytea, $1) as procedure_name,
            pgp_sym_decrypt(description::bytea, $1) as description,
            created_at
        FROM
            procedures
        "#,
        &encryption_key
    )
    .fetch_all(&*pool)
    .await {
        Ok(procedures) => Ok(procedures),
        Err(err) => Err(format!("Error while fetching procedures: {}", err))
    }
}

// Endpoint to get procedures data for a patient
#[tauri::command]
pub async fn get_patient_procedures(state: State<'_, DatabaseState>, patient_id: i32) -> Result<Vec<PatientProcedureData>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => {key},
        Err(err) => {"".to_string()},
    };

    match sqlx::query_as!(
        PatientProcedureData,
        r#"
        SELECT
            pa.activity_id,
            pa.status,
            pgp_sym_decrypt(pr.procedure_name::bytea, $1) as procedure_name,
            pgp_sym_decrypt(pr.description::bytea, $1) as procedure_description,
            pgp_sym_decrypt(pa.doctors_note::bytea, $1) as doctors_note,
            pgp_sym_decrypt(pa.patient_complaint::bytea, $1) as patient_complaint,
            pgp_sym_decrypt(pa.comments::bytea, $1) as comments,
            pa.activity_time
        FROM
            patient_activity pa
        LEFT JOIN
            procedures pr
        ON
            pa.procedure_id = pr.procedure_id
        WHERE
            pa.patient_id = $2
        ORDER BY
            pa.activity_time DESC
        "#,
        &encryption_key,
        &patient_id
    )
    .fetch_all(&*pool)
    .await {
        Ok(patient_procedure_data) => Ok(patient_procedure_data),
        Err(err) => Err(format!("Error while fetching patient procedure data: {}", err))
    }
}

// Endpoint to add comments to a particular activity
#[tauri::command]
pub async fn add_comment_to_procedure(state: State<'_, DatabaseState>, activity_id: i32, comment: String) -> Result<String, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => {key},
        Err(err) => {"".to_string()},
    };

    // Encrypt the new comment
    let encrypted_comment = format!("pgp_sym_encrypt('{}', '{}')", comment, encryption_key);

    // Update the comments field by decrypting, appending, and re-encrypting
    match sqlx::query!(
        r#"
        UPDATE patient_activity
        SET comments = pgp_sym_encrypt(
            COALESCE(pgp_sym_decrypt(comments::bytea, $1), '') || '\n' || $2,
            $1
        )
        WHERE activity_id = $3
        RETURNING *;
        "#,
        &encryption_key, 
        comment,        
        activity_id     
    )
    .fetch_one(&*pool)
    .await {
        Ok(_) => Ok(format!("Successfully added comment to activity")),
        Err(err) => Err(format!("Error while adding comment to procedure: {}", err))
    }
}

// Endpoint to create new patient activity
#[tauri::command]
pub async fn create_patient_activity(state: State<'_, DatabaseState>, patient_id: i32, procedure_id: i32, status: String, doctors_note: String, patient_complaint: String, activity_time: String) -> Result<String, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => {key},
        Err(err) => {"".to_string()},
    };

    // Convert activity_time from String to DateTime<Utc>
    let activity_time = match activity_time.parse::<DateTime<Utc>>() {
        Ok(dt) => dt,
        Err(_) => return Err("Invalid datetime format".to_string()),
    };

    match sqlx::query!(
        r#"
        INSERT INTO patient_activity (
            patient_id, 
            procedure_id, 
            status, 
            doctors_note, 
            patient_complaint, 
            activity_time, 
            created_at
        ) VALUES (
            $1, 
            $2, 
            $3, 
            pgp_sym_encrypt($4, $7), 
            pgp_sym_encrypt($5, $7), 
            $6, 
            NOW()
        ) 
        RETURNING activity_id
        "#,
        patient_id,
        procedure_id,
        status,
        doctors_note,
        patient_complaint,
        activity_time,
        encryption_key
    )
    .fetch_one(&*pool)
    .await {
        Ok(record) => Ok(format!("Successfully created patient activity: {}", record.activity_id)),
        Err(err) => Err(format!("Error while creating patient activity: {}", err))
    }
}

// Endpoint to fetch all complaints for a patient
#[tauri::command]
pub async fn get_patient_complaints(state: State<'_, DatabaseState>, patient_id: i32) -> Result<Vec<String>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => {key},
        Err(err) => {"".to_string()},
    };

    match sqlx::query!(
        r#"
        SELECT
            pgp_sym_decrypt(patient_complaint::bytea, $1) as patient_complaint
        FROM
            patient_activity
        WHERE 
            patient_id = $2
        "#,
        &encryption_key,
        &patient_id
    )
    .fetch_all(&*pool)
    .await {
        Ok(data) => {
            let mut res = vec![];
            for entry in data.iter() {
                if let Some(val) = entry.patient_complaint.clone() {
                    res.push(val);
                }
            }

            Ok(res)
        },
        Err(err) => Err(format!("Error while fetching patient complaints: {}", err))
    }
}