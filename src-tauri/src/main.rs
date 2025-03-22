// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;

mod db;
mod patients;

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
            std::env::set_var("DATABASE_URL", "postgresql://shubh:DBKyQI4S6MTIwqXdg7dKGb0pkWH2gbpD@dpg-cvej4hrtq21c73eelr3g-a.singapore-postgres.render.com/ehrportal");
            std::env::set_var("ENCRYPTION_KEY", "qDFwNcXiGD3XPjfzFzfpUvh0FW10qHzf");
            eprintln!("Error while loading env: {}", err);
        }
    }

    ehrportal_lib::run()
}
