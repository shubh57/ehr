// src-tauri/src/vision.rs

use std::cell::Ref;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::State;

// Dependencies
use crate::db::DatabaseState;

// Sturct to store input for get apis
#[derive(Serialize, Deserialize)]
pub struct VisionQuery {
    patient_id: i32,
    side: String,
    value_type: String
}

// Struct to store result of get_vision_data
#[derive(Serialize, Deserialize, Clone)]
pub struct VisionData {
    pub vision_id: i32,
    pub patient_id: Option<i32>,
    pub near_vision: Option<String>,
    pub distant_vision: Option<String>,
    pub side: String,
    pub value_type: String,
    pub created_at: Option<DateTime<Utc>>,
    pub created_by: Option<i32>,
    pub updated_at: Option<DateTime<Utc>>,
    pub updated_by: Option<i32>
}

// Struct to store patient refraction data
#[derive(Serialize, Deserialize, Clone)]
pub struct RefractionData {
    pub refraction_id: i32,
    pub patient_id: Option<i32>,
    pub spherical: Option<String>,
    pub cylindrical: Option<String>,
    pub axis: Option<String>,
    pub side: String,
    pub value_type: String,
    pub created_at: Option<DateTime<Utc>>,
    pub created_by: Option<i32>,
    pub updated_at: Option<DateTime<Utc>>,
    pub updated_by: Option<i32>
}

// Struct to store patient eye measurements
#[derive(Serialize, Deserialize, Clone)]
pub struct EyeMeasurementData {
    measurement_id: i32,
    patient_id: Option<i32>,
    iop_at: Option<String>,
    iop_nct: Option<String>,
    cct: Option<String>,
    tond: Option<String>,
    side: String,
    created_at: Option<DateTime<Utc>>,
    created_by: Option<i32>,
    updated_at: Option<DateTime<Utc>>,
    updated_by: Option<i32>
}

// Endpoint to get uncorrected vision values for a patient
#[tauri::command]
pub async fn get_vision_data(state: tauri::State<'_, DatabaseState>, query: VisionQuery) -> Result<Option<VisionData>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(err) => {
            return Err("Encryption key not provided.".to_string());
        }
    };

    if query.side != "LEFT" && query.side != "RIGHT" {
        return Err(format!("Invalid side input"));
    }

    if query.value_type != "UC" && query.value_type != "BCVA" && query.value_type != "PH" {
        return  Err(format!("Invalid vision type"));
    }

    match sqlx::query_as!(
        VisionData,
        r#"
        SELECT
            vision_id,
            patient_id,
            pgp_sym_decrypt(near_vision::bytea, $1) as near_vision,
            pgp_sym_decrypt(distant_vision::bytea, $1) as distant_vision,
            side,
            value_type,
            created_at,
            created_by,
            updated_at,
            updated_by
        FROM
            vision
        WHERE
            patient_id = $2
        AND
            side = $3
        AND
            value_type = $4
        "#,
        &encryption_key,
        &query.patient_id,
        &query.side,
        &query.value_type
    )
    .fetch_all(&*pool)
    .await {
        Ok(vision_data) => {
            if vision_data.len() == 1 {
                Ok(Some(vision_data[0].clone()))
            } else {
                Ok(None)
            }
        },
        Err(err) => Err(format!("Error while fetching uncorrected vision values: {}", err))
    }
}

// Endpoint to get refraction data for a paritcular patient
#[tauri::command]
pub async fn get_refraction_data(state: tauri::State<'_, DatabaseState>, query: VisionQuery) -> Result<Option<RefractionData>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(err) => {
            return Err("Encryption key not provided.".to_string());
        }
    };

    if query.side != "LEFT" && query.side != "RIGHT" {
        return Err(format!("Invalid side input"));
    }

    if query.value_type != "DL" && query.value_type != "UD" {
        return  Err(format!("Invalid refraction type"));
    }

    match sqlx::query_as!(
        RefractionData, 
        r#"
        SELECT 
            refraction_id,
            patient_id,
            pgp_sym_decrypt(spherical::bytea, $1) as spherical,
            pgp_sym_decrypt(cylindrical::bytea, $1) as cylindrical,
            pgp_sym_decrypt(axis::bytea, $1) as axis,
            side,
            value_type,
            created_at,
            created_by,
            updated_at,
            updated_by
        FROM
            refraction
        WHERE
            patient_id = $2
        AND
            side = $3
        AND
            value_type = $4
        "#,
        &encryption_key,
        &query.patient_id,
        &query.side,
        &query.value_type
    )
    .fetch_all(&*pool)
    .await {
        Ok(refraction_data) => {
            if refraction_data.len() == 1 {
                Ok(Some(refraction_data[0].clone()))
            } else {
                Ok(None)
            }
        }, 
        Err(err) => Err(format!("Error while fetching refraction data: {}", err))
    }
}

// Endpoint to update vision data for a patient
#[tauri::command]
pub async fn update_vision_data(state: tauri::State<'_, DatabaseState>, patient_id: i32, near_vision: String, distant_vision: String, side: String, value_type: String, updated_by: i32) -> Result<String, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(err) => {
            return Err("Encryption key not provided.".to_string());
        }
    };

    match sqlx::query_as!(
        VisionData,
        r#"
        INSERT INTO vision (
            patient_id,
            near_vision,
            distant_vision,
            side,
            value_type,
            created_by,
            updated_at,
            updated_by
        ) 
        VALUES (
            $1,
            pgp_sym_encrypt($2, $3),
            pgp_sym_encrypt($4, $3),
            $5,
            $6,
            $7,
            NULL,
            NULL
        )
        ON CONFLICT (patient_id, side, value_type)
        DO UPDATE SET
            near_vision = EXCLUDED.near_vision,
            distant_vision = EXCLUDED.distant_vision,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = EXCLUDED.created_by
        RETURNING
            vision_id,
            patient_id,
            pgp_sym_decrypt(near_vision::bytea, $3) as near_vision,
            pgp_sym_decrypt(distant_vision::bytea, $3) as distant_vision,
            side,
            value_type,
            created_at,
            created_by,
            updated_at,
            updated_by
        "#,
        &patient_id,
        &near_vision,
        &encryption_key,
        &distant_vision,
        &side,
        &value_type,
        &updated_by
    )
    .fetch_one(&*pool)
    .await {
        Ok(record) => Ok(format!("Successfully updated vision data")),
        Err(err) => Err(format!("Error while updating vision data: {}", err))
    }
}

// Endpoint to update refraction data for a patient
#[tauri::command]
pub async fn update_refraction_data(state: tauri::State<'_, DatabaseState>, patient_id: i32, spherical: String, cylindrical: String, axis: String, side: String, value_type: String, updated_by: i32) -> Result<String, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(err) => {
            return Err("Encryption key not provided.".to_string());
        }
    };

    match sqlx::query_as!(
        RefractionData,
        r#"
        INSERT INTO refraction (
            patient_id,
            spherical,
            cylindrical,
            axis,
            side,
            value_type,
            created_by,
            updated_at,
            updated_by
        ) 
        VALUES (
            $1,
            pgp_sym_encrypt($2, $3),
            pgp_sym_encrypt($4, $3),
            pgp_sym_encrypt($5, $3),
            $6,
            $7,
            $8,
            NULL,
            NULL
        )
        ON CONFLICT (patient_id, side, value_type)
        DO UPDATE SET
            spherical = EXCLUDED.spherical,
            cylindrical = EXCLUDED.cylindrical,
            axis = EXCLUDED.axis,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = EXCLUDED.created_by
        RETURNING 
            refraction_id, 
            patient_id, 
            pgp_sym_decrypt(spherical::bytea, $3) as spherical,
            pgp_sym_decrypt(cylindrical::bytea, $3) as cylindrical,
            pgp_sym_decrypt(axis::bytea, $3) as axis,
            side, 
            value_type, 
            created_at, 
            created_by, 
            updated_at, 
            updated_by
        "#,
        &patient_id,
        &spherical,
        &encryption_key,
        &cylindrical,
        &axis,
        &side,
        &value_type,
        &updated_by
    )
    .fetch_one(&*pool)
    .await {
        Ok(record) => Ok(format!("Successfully updated refraction data")),
        Err(err) => Err(format!("Error while updating refraction data: {}", err))
    }
}

// Endpoint to get eye measurement data for a patient
#[tauri::command]
pub async fn get_patient_eye_measurement_data(state: tauri::State<'_, DatabaseState>, patient_id: i32, side: String) -> Result<Option<EyeMeasurementData>, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(err) => {
            return Err("Encryption key not provided.".to_string());
        }
    };

    match sqlx::query_as!(
        EyeMeasurementData,
        r#"
        SELECT 
            measurement_id,
            patient_id,
            pgp_sym_decrypt(iop_at::bytea, $1) as iop_at,
            pgp_sym_decrypt(iop_nct::bytea, $1) as iop_nct,
            pgp_sym_decrypt(cct::bytea, $1) as cct,
            pgp_sym_decrypt(tond::bytea, $1) as tond,
            side,
            created_at,
            created_by,
            updated_at,
            updated_by
        FROM
            eye_measurement
        WHERE
            patient_id = $2
        AND
            side = $3
        "#,
        &encryption_key,
        &patient_id,
        &side
    )
    .fetch_all(&*pool)
    .await {
        Ok(data) => {
            if data.len() != 1 {
                Ok(None)
            } else {
                Ok(Some(data[0].clone()))
            }
        },
        Err(err) => Err(format!("Error while fetching patient eye measurement data: {}", err))
    }
}

// Endpoint to update patient eye measurement data
#[tauri::command]
pub async fn update_patient_eye_measurement_data(state: tauri::State<'_, DatabaseState>, patient_id: i32, iop_at: String, iop_nct: String, cct: String, tond: String, side: String, updated_by: i32) -> Result<EyeMeasurementData, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(err) => {
            return Err("Encryption key not provided.".to_string());
        }
    };

    match sqlx::query_as!(
        EyeMeasurementData,
        r#"
        INSERT INTO eye_measurement (
            patient_id,
            iop_at,
            iop_nct,
            cct,
            tond,
            side,
            created_by,
            updated_at,
            updated_by
        ) 
        VALUES (
            $1,
            pgp_sym_encrypt($2, $3),
            pgp_sym_encrypt($4, $3),
            pgp_sym_encrypt($5, $3),
            pgp_sym_encrypt($6, $3),
            $7,
            $8,
            NULL,
            NULL
        )
        ON CONFLICT (patient_id, side)
        DO UPDATE SET
            iop_at = EXCLUDED.iop_at,
            iop_nct = EXCLUDED.iop_nct,
            cct = EXCLUDED.cct,
            tond = EXCLUDED.tond,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = EXCLUDED.created_by
        RETURNING 
            measurement_id, 
            patient_id, 
            pgp_sym_decrypt(iop_at::bytea, $3) as iop_at,
            pgp_sym_decrypt(iop_nct::bytea, $3) as iop_nct,
            pgp_sym_decrypt(cct::bytea, $3) as cct,
            pgp_sym_decrypt(tond::bytea, $3) as tond,
            side,
            created_at, 
            created_by, 
            updated_at, 
            updated_by
        "#,
        &patient_id,
        &iop_at,
        &encryption_key,
        &iop_nct,
        &cct,
        &tond,
        &side,
        &updated_by
    )
    .fetch_all(&*pool)
    .await {
        Ok(data) => {
            if data.len() == 0 {
                Err(format!("Error while updating records"))
            } else {
                Ok(data[0].clone())
            }
        }, 
        Err(err) => Err(format!("Error while updating patient eye measurement data: {}", err))
    }
}