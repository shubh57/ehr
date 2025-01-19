// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;

mod patients;
mod db;

fn main() {
    // Initialize panic handler for better error reporting
    std::panic::set_hook(Box::new(|panic_info| {
        eprintln!("Application panic: {:?}", panic_info);
    }));

    if cfg!(debug_assertions) {
        if let Err(err) = dotenv::from_filename(".env.development") {
            eprintln!("Error while loading env: {}", err);
            std::process::exit(1);
        } 
    } else {
        if let Err(err) = dotenv::from_filename(".env.production") {
            std::env::set_var("DATABASE_URL", "postgres://postgres:z0ayBKl4ZOYvhAgzmwyj@ehrportal.clckceueo5iv.ap-south-1.rds.amazonaws.com:5432/ehrportal");
            std::env::set_var("ENCRYPTION_KEY", "qDFwNcXiGD3XPjfzFzfpUvh0FW10qHzf");
            eprintln!("Error while loading env: {}", err);
        } 
    }

    ehrportal_lib::run()
}
