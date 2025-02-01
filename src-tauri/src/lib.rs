// src-tauri/src/lib.rs

// Dependancies
use std::{env, sync::Arc};
use tokio::sync::Mutex;
use sqlx::postgres::PgPool;
use tauri::{Listener, Manager, State};
use db::DatabaseState;
use dotenv::dotenv;
use tauri::utils::config;
use tokio::fs;

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
                    Ok(pool) => {
                        eprintln!("Database connected successfully.");

                        // match db::setup_tables(&pool).await {
                        //     Ok(_) => eprintln!("Tables setup successfully."),
                        //     Err(err) => {
                        //         eprintln!("Error while setting up tables: {}", err);
                        //         std::process::exit(1);
                        //     }
                        // }

                        // match db::fill_dummy_data(&pool).await {
                        //     Ok(_) => eprintln!("Filled dummy data"),
                        //     Err(err) => {
                        //         eprintln!("Error while filling dummy data: {}", err);
                        //         std::process::exit(1);
                        //     }
                        // }

                        // match db::setup_complete_database(&pool, true).await {
                        //     Ok(_) => eprintln!("Setup database successfully."),
                        //     Err(err) => {
                        //         eprintln!("Error while setting up database: {}", err);
                        //         std::process::exit(1);
                        //     }
                        // }

                        pool
                    },
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
        .invoke_handler(tauri::generate_handler![
            greet, 
            patients::get_patient_data, 
            patients::get_patient_activity_data, 
            patients::get_patients_data, 
            patients::get_appointment_data, 
            patients::get_patient_summary_data, 
            patients::get_patient_history_data, 
            patients::get_patient_doctor_data,
            patients::get_patient_procedures,
            patients::add_comment_to_procedure,
            patients::get_all_procedures,
            patients::create_patient_activity])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}
