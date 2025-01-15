// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;

mod patients;
mod db;

fn main() {
    dotenv().ok();
    ehrportal_lib::run()
}
