// src-tauri/src/file.rs

// Dependencies
use std::{fs::File, io::Write, path::Path};
use base64::engine::general_purpose::STANDARD;
use base64::Engine as _;  // Required for engine methods

#[tauri::command]
pub async fn save_pdf_file(file_name: String, base_64_data: String, download_path: String) -> Result<(), String> {
    let file_bytes = STANDARD.decode(&base_64_data).map_err(|e| format!("Base64 decode error: {}", e))?;

    let dest_path = Path::new(&download_path).join(&file_name);

    let mut file = File::create(&dest_path).map_err(|e| format!("File creation error: {}", e))?;
    file.write_all(&file_bytes).map_err(|e| format!("File write error: {}", e));

    Ok(())
}