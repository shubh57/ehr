// src-tauri/src/alert.rs

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::db::DatabaseState;
use crate::auth::get_user_from_token;

#[derive(Serialize, Deserialize)]
pub struct Alert {
    alert_id: i32,
    priority_level: Option<String>,
    title: Option<String>,
    message: Option<String>,
    issued_for: Option<i32>,
    issued_for_name: Option<String>,
    issued_by: Option<i32>,
    issued_by_name: Option<String>,
    status: Option<String>,
    created_at: Option<DateTime<Utc>>
}

// Endpoint to get all alerts for a user
#[tauri::command]
pub async fn get_alerts(
    state: tauri::State<'_, DatabaseState>, 
    token: String
) -> Result<Vec<Alert>, String> {
    let pool = state.pool.lock().await;
    let user = get_user_from_token(token)?;

    sqlx::query_as!(
        Alert,
        r#"
        SELECT
            a.alert_id, a.priority_level, a.title, a.message, a.issued_for,
            COALESCE(uf.first_name || ' ' || uf.last_name, NULL) AS issued_for_name,
            a.issued_by,
            COALESCE(ub.first_name || ' ' || ub.last_name, NULL) AS issued_by_name,
            a.status, a.created_at
        FROM 
            alerts a
        LEFT JOIN users uf ON a.issued_for = uf.user_id
        LEFT JOIN users ub ON a.issued_by = ub.user_id
        WHERE
            a.issued_for = $1
        OR
            a.issued_by = $1
        "#,
        &user.user_id
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Error while fetching alerts for user: {}", e))
}

// Endpoint to create a new alert
#[tauri::command]
pub async fn create_alert(
    state: tauri::State<'_, DatabaseState>,
    token: String,
    priority_level: String,
    title: String,
    message: String,
    issued_for: i32
) -> Result<Alert, String> {
    let pool = state.pool.lock().await;
    let user = get_user_from_token(token)?;

    sqlx::query_as!(
        Alert,
        r#"
        INSERT INTO 
            alerts (priority_level, title, message, issued_for, issued_by)
        VALUES
            ($1, $2, $3, $4, $5)
        RETURNING
            alert_id, priority_level, title, message, issued_for, NULL as issued_for_name,
            issued_by, NULL as issued_by_name, status, created_at
        "#,
        &priority_level,
        &title,
        &message,
        &issued_for,
        &user.user_id
    )
    .fetch_one(&*pool)
    .await
    .map_err(|e| format!("Error while creating new alert: {}", e))
}
