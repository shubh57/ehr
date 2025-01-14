// src-tauri/src/db.rs

// Dependancies
use sqlx::{postgres::PgPoolOptions, Executor};
use std::env;


// Function to connect to postgresql db
pub async fn connect_to_database() -> sqlx::Result<sqlx::Pool<sqlx::Postgres>> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL is required");
    println!("database_url: {}", database_url);
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .test_before_acquire(true)
        .connect(&database_url)
        .await?;
    
    println!("{:?}", pool);
    Ok(pool)
}

// Function to setup tables in postgresql db
pub async fn setup_tables(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    // Importing dependancy for encryption
    let encryption_query = r#"CREATE EXTENSION IF NOT EXISTS pgcrypto;"#;
    pool.execute(encryption_query).await?;
    
    // Creating patients table
    let patients_query = r#"
        DROP TABLE IF EXISTS patients;
        CREATE TABLE IF NOT EXISTS patients (
            patient_id SERIAL PRIMARY KEY,
            mr_number VARCHAR(100) NOT NULL UNIQUE,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            date_of_birth DATE NOT NULL,
            gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'OTHERS')) NOT NULL,
            appointment_time TIMESTAMPTZ NOT NULL,
            patient_photo BYTEA, -- Encrypted field for photos
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;
    pool.execute(patients_query).await?;
    
    // Creating patient_activity table
    let patient_activity_query = r#"
        DROP TABLE IF EXISTS patient_activity;
        CREATE TABLE IF NOT EXISTS patient_activity (
            activity_id SERIAL PRIMARY KEY,
            patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
            status VARCHAR(20) CHECK (status IN ('COMPLETED', 'INCOMPLETE', 'TO_BE_REVIEWED')) NOT NULL,
            activity BYTEA NOT NULL, -- Encrypted field for activity
            doctors_note BYTEA, -- Encrypted field for doctor's note
            activity_time TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;
    pool.execute(patient_activity_query).await?;
    
    // Creating users table
    let users_query = r#"
        DROP TABLE IF EXISTS users;
        CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            role VARCHAR(20) CHECK (role IN ('DOCTOR', 'NURSE', 'ADMIN')) NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;
    pool.execute(users_query).await?;

    Ok(())
} 

// Function to fill dummy data
pub async fn fill_dummy_data(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    // Getting encryption key needed to encrypt patient's data
    let encryption_key = env::var("ENCRYPTION_KEY").expect("ENCRYPTION_KEY is required.");
    
    // Query to fill patients data with dummy values
    let patients_fill_query = r#"
        INSERT INTO patients (
            mr_number, first_name, last_name, date_of_birth, gender, appointment_time
        )
        VALUES
        (
            'MR001',
            'Alice',
            'Smith',
            '1990-02-15',
            'FEMALE',
            '2025-01-14 10:00:00+00'
        ),
        (
            'MR002',
            'Bob',
            'Johnson',
            '1985-07-10',
            'MALE',
            '2025-01-14 11:30:00+00'
        );
    "#;
    eprintln!("{:?}", patients_fill_query);
    pool.execute(patients_fill_query).await?;
    
    // Query to fill patient_activity table with dummy values
    let patient_activity_fill_query = format!(r#"
        INSERT INTO patient_activity (
            patient_id, status, activity, doctors_note, activity_time
        )
        VALUES
        (
            1,
            'COMPLETED',
            pgp_sym_encrypt('Initial check-up completed.', '{}'),
            pgp_sym_encrypt('Patient is advised to monitor blood pressure daily.', '{}'),
            '2025-01-14 11:45:00+00'
        ),
        (
            2,
            'TO_BE_REVIEWED',
            pgp_sym_encrypt('Blood test results pending.', '{}'),
            pgp_sym_encrypt('Follow-up required for potential anemia.', '{}'),
            '2025-01-14 12:00:00+00'
        );
    "#, 
    encryption_key, encryption_key, encryption_key, encryption_key);
    eprintln!("{:?}", patient_activity_fill_query);
    pool.execute(&*patient_activity_fill_query).await?;
    
    // Query to fill users table with dummy data
    let user_fill_query = r#"
        INSERT INTO users (role, first_name, last_name)
        VALUES
        ('DOCTOR', 'Eve', 'Taylor'),
        ('NURSE', 'Charlie', 'Brown'),
        ('ADMIN', 'Dana', 'White');
    "#;
    pool.execute(user_fill_query).await?;
    
    Ok(())
}