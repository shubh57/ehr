// src-tauri/src/patients.rs

// Dependencies
use tauri::State;
use crate::db::DatabaseState;
use sqlx::{Row, Column};
use chrono;

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