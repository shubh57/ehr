// src-tauri/src/doctor.rs

// Dependencies
use std::time::Duration;
use chrono::{DateTime, Utc};
use log::info;
use sqlx::{Postgres, Pool};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DatabaseState;
use crate::auth::{get_user_from_token, User};

// Endpoint to get all doctors
#[tauri::command]
pub async fn get_all_doctors(
    state: tauri::State<'_, DatabaseState>, 
    token: String
) -> Result<Vec<User>, String> {
    let _user = get_user_from_token(token)?;
    let pool = state.pool.lock().await;

    sqlx::query_as!(
        User,
        r#"
        SELECT
            *
        FROM
            users 
        WHERE
            role = 'DOCTOR'
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Error while fetching doctors: {}", e))
}