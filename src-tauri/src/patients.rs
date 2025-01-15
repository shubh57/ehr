// src-tauri/src/patients.rs

// Dependencies
use tauri::State;
use crate::db::DatabaseState;
use sqlx::{Row, Column};

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
                    let value: Option<String> = row.try_get(column.name()).ok();
                    raw_data.push(value.unwrap_or_else(|| "NULL".to_string()));
                }
                
                result.push(raw_data);
            }
            eprintln!("{:#?}", result);
            Ok(result)
        }
        Err(err) => Err(format!("Failed to fetch patients data: {}", err))
    }
}