// src-tauri/src/lib.rs

// Dependancies
use std::env;
pub mod db;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let pool = match db::connect_to_database().await {
                    Ok(pool) => pool,
                    Err(err) => {
                        eprintln!("Failed to connect to database: {}", err);
                        std::process::exit(1);
                    }
                };
                
                if let Err(err) = db::setup_tables(&pool).await {
                    eprintln!("Failed to setup tables: {}", err);
                    std::process::exit(1);
                }
                
                if let Err(err) = db::fill_dummy_data(&pool).await {
                    eprintln!("Failed to fill dummy data: {}", err);
                    std::process::exit(1);
                }
                
                println!("Database connected and tables setup succesfully.");
            });
            
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}
