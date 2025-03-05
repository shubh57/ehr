// src-tauri/src/lib.rs

// Dependancies
use db::DatabaseState;
use std::{env, sync::Arc};
use tauri::{Listener, Manager};
use tokio::sync::Mutex;

// Modules
pub mod db;
pub mod patients;
pub mod vision;
pub mod file;
pub mod common_tables;
pub mod patient_tables;
pub mod vision_tables;
pub mod auth;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let pool = tauri::async_runtime::block_on(async {
                match db::connect_to_database().await {
                    Ok(pool) => {
                        eprintln!("Database connected successfully.");

                        // match vision_tables::delete_vision_tables(&pool).await {
                        //     Ok(_) => eprintln!("Deleted vision table"),
                        //     Err(err) => {
                        //         eprintln!("Error while deleting vision table: {}", err);
                        //         std::process::exit(1);
                        //     }
                        // }

                        // match patient_tables::delete_patient_tables(&pool).await {
                        //     Ok(_) => eprintln!("Deleted patient table"),
                        //     Err(err) => {
                        //         eprintln!("Error while deleting vision table: {}", err);
                        //         std::process::exit(1);
                        //     }
                        // }

                        // match common_tables::delete_common_tables(&pool).await {
                        //     Ok(_) => eprintln!("Deleted common table"),
                        //     Err(err) => {
                        //         eprintln!("Error while deleting vision table: {}", err);
                        //         std::process::exit(1);
                        //     }
                        // }

                        // match common_tables::setup_all_tables(&pool, true).await {
                        //     Ok(_) => eprintln!("Setup common tables"),
                        //     Err(err) => {
                        //         eprintln!("Error while setting up common tables: {}", err)
                        //     }
                        // }

                        // match patient_tables::setup_all_patient_tables(&pool, true).await {
                        //     Ok(_) => eprintln!("Setup patient tables"),
                        //     Err(err) => {
                        //         eprintln!("Error while setting up patient tables: {}", err)
                        //     }
                        // }

                        // match vision_tables::setup_vision_tables(&pool, true).await {
                        //     Ok(_) => eprintln!("Setup vision tables"),
                        //     Err(err) => {
                        //         eprintln!("Error while setting up vision table: {}", err)
                        //     }
                        // }

                        pool
                    }
                    Err(err) => {
                        eprintln!("Failed to connect to database: {}", err);
                        std::process::exit(1);
                    }
                }
            });

            let pool = Arc::new(Mutex::new(pool));
            app.manage(DatabaseState { pool: pool.clone() });

            // Cleanup when app exits
            app.listen("tauri://clone-requested", move |_event| {
                let pool = pool.clone();
                tauri::async_runtime::spawn(async move {
                    drop(pool.lock().await);
                    eprintln!("Database pool closed.");
                });
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            file::save_pdf_file,
            auth::login,
            auth::signup,
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
            patients::create_patient_activity,
            patients::get_patient_complaints,
            vision::get_vision_data,
            vision::get_refraction_data,
            vision::update_vision_data,
            vision::update_refraction_data,
            vision::get_patient_eye_measurement_data,
            vision::update_patient_eye_measurement_data
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}
