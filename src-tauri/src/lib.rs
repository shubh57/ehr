// src-tauri/src/lib.rs

// Dependancies
use std::{env, sync::Arc};
use tokio::sync::Mutex;
use sqlx::postgres::PgPool;
use tauri::{Listener, Manager, State};
use db::DatabaseState;

// Modules
pub mod db;
pub mod patients;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let pool = tauri::async_runtime::block_on(async {
                match db::connect_to_database().await {
                    Ok(pool) => pool,
                    Err(err) => {
                        eprintln!("Failed to connect to database: {}", err);
                        std::process::exit(1);
                    }
                }
            });
            
            let pool = Arc::new(Mutex::new(pool));
            app.manage(DatabaseState { pool: pool.clone() });
            
            // Cleanup when app exits
            app.listen("tauri://clone-requested", move |event| {
               let pool = pool.clone();
               tauri::async_runtime::spawn(async move {
                   drop(pool.lock().await);
                   eprintln!("Database pool closed.");
               });
            });
            
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, patients::get_patients_data])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}
