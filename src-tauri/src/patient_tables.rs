// src-tauri/src/patient_tables.rs

// Dependancies
use sqlx::Executor;

// Function to create patients table
pub async fn setup_patients_table(pool: &sqlx::Pool<sqlx::Postgres>, dummy_data: bool) -> sqlx::Result<()> {
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
            patient_photo BYTEA, -- Encrypted field for photos
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;
    pool.execute(patients_query).await?;

    if dummy_data {
        // Query to fill patients data with dummy values
        let patients_fill_query = r#"
            INSERT INTO patients (
                mr_number, first_name, last_name, date_of_birth, gender
            )
            VALUES
            (
                'MR001',
                'Alice',
                'Smith',
                '1990-02-15',
                'FEMALE'
            ),
            (
                'MR002',
                'Bob',
                'Johnson',
                '1985-07-10',
                'MALE'
            );
        "#;
        pool.execute(patients_fill_query).await?;
    }

    Ok(())
}

// Function to create patient_activity table
pub async fn setup_patient_activity_table(pool: &sqlx::Pool<sqlx::Postgres>, dummy_data: bool) -> sqlx::Result<()> {
    // Importing dependancy for encryption
    let encryption_query = r#"CREATE EXTENSION IF NOT EXISTS pgcrypto;"#;
    pool.execute(encryption_query).await?;

    // Creating patient_activity table
    let patient_activity_query = r#"
        DROP TABLE IF EXISTS patient_activity;
        CREATE TABLE IF NOT EXISTS patient_activity (
            activity_id SERIAL PRIMARY KEY,
            patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
            status VARCHAR(20) CHECK (status IN ('COMPLETED', 'INCOMPLETE', 'TO_BE_REVIEWED')) NOT NULL,
            procedure_id INT REFERENCES procedures(procedure_id) ON DELETE CASCADE,
            doctor_id INT REFERENCES users(user_id) ON DELETE CASCADE,
            doctors_note BYTEA, -- Encrypted field for doctor's note
            patient_complaint BYTEA NOT NULL, -- Encrypted feild for patient's complaint
            comments BYTEA,
            activity_time TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;
    pool.execute(patient_activity_query).await?;

    if dummy_data {
        let encryption_key = match std::env::var("ENCRYPTION_KEY") {
            Ok(key) => key,
            Err(_err) => "".to_string(),
        };

        if encryption_key.len() == 0 {
            return Err(sqlx::Error::Configuration("A configuration error occurred".into()));
        }
        // Query to fill patient_activity table with dummy values
        let patient_activity_fill_query = format!(
            r#"
            INSERT INTO patient_activity (
                patient_id, status, procedure_id, doctor_id, doctors_note, activity_time, patient_complaint
            )
            VALUES
            (
                1,
                'COMPLETED',
                1,
                1,
                pgp_sym_encrypt('Patient is advised to monitor blood pressure daily.', '{}'),
                '2025-01-20 11:45:00+00',
                pgp_sym_encrypt('Patient is suffering from hypertension.', '{}')
            ),
            (
                2,
                'TO_BE_REVIEWED',
                2,
                1,
                pgp_sym_encrypt('Follow-up required for potential anemia.', '{}'),
                '2025-01-20 12:00:00+00',
                pgp_sym_encrypt('Patient does not stop bleeding when cut.', '{}')
            ),
            (
                2,
                'INCOMPLETE',
                3,
                1,
                pgp_sym_encrypt('Patient needs chest X-Ray to rule out pneumonia.', '{}'),
                '2025-01-21 11:45:00+00',
                pgp_sym_encrypt('Patient complains of persistent cough and chest pain.', '{}')
            );
        "#,
            encryption_key,
            encryption_key,
            encryption_key,
            encryption_key,
            encryption_key,
            encryption_key
        );
        pool.execute(&*patient_activity_fill_query).await?;
    }

    Ok(())
}

// Function to create patient_history table
pub async fn setup_patient_history_table(pool: &sqlx::Pool<sqlx::Postgres>, dummy_data: bool) -> sqlx::Result<()> {
    // Importing dependancy for encryption
    let encryption_query = r#"CREATE EXTENSION IF NOT EXISTS pgcrypto;"#;
    pool.execute(encryption_query).await?;

    // Creating patient_history table
    let patient_history_query = r#"
        DROP TABLE IF EXISTS patient_history;
        CREATE TABLE IF NOT EXISTS patient_history (
            history_id SERIAL PRIMARY KEY,
            patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE UNIQUE,
            medical_conditions BYTEA NOT NULL, -- Encrypted field for medical conditions list
            medications BYTEA NOT NULL, -- Encrypted field for medications list
            allergies BYTEA NOT NULL, -- Encrypted field for allergies list
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;
    pool.execute(patient_history_query).await?;

    if dummy_data {
        let encryption_key = match std::env::var("ENCRYPTION_KEY") {
            Ok(key) => key,
            Err(_err) => "".to_string(),
        };

        if encryption_key.len() == 0 {
            return Err(sqlx::Error::Configuration("A configuration error occurred".into()));
        }
        // Query to fill patient_history table with dummy values
        let patient_history_fill_query = format!(
            r#"
            INSERT INTO patient_history (
                patient_id, medical_conditions, medications, allergies
            )
            VALUES
            (
                1,
                pgp_sym_encrypt('["Hypertension", "Type 2 Diabetes", "Obesity"]', '{}'),
                pgp_sym_encrypt('["Metformin 500mg", "Lisinopril 10mg", "Aspirin 81mg"]', '{}'),
                pgp_sym_encrypt('["Penicillin", "Sulfa drugs"]', '{}')
            ),
            (
                2,
                pgp_sym_encrypt('["Hemophilia A", "Iron deficiency anemia"]', '{}'),
                pgp_sym_encrypt('["Factor VIII", "Iron supplements", "Folic acid"]', '{}'),
                pgp_sym_encrypt('[]', '{}')
            );
        "#,
            encryption_key,
            encryption_key,
            encryption_key,
            encryption_key,
            encryption_key,
            encryption_key
        );
        pool.execute(&*patient_history_fill_query).await?;
    }

    Ok(())
}

// Function to create procedures table
pub async fn setup_procedures_table(pool: &sqlx::Pool<sqlx::Postgres>, dummy_data: bool) -> sqlx::Result<()> {
    // Importing dependancy for encryption
    let encryption_query = r#"CREATE EXTENSION IF NOT EXISTS pgcrypto;"#;
    pool.execute(encryption_query).await?;

    // Creating procedures table
    let procedures_query = r#"
        DROP TABLE IF EXISTS procedures;
        CREATE TABLE IF NOT EXISTS procedures (
            procedure_id SERIAL PRIMARY KEY,
            procedure_name BYTEA NOT NULL,
            description BYTEA,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;
    pool.execute(procedures_query).await?;

    if dummy_data {
        let encryption_key = match std::env::var("ENCRYPTION_KEY") {
            Ok(key) => key,
            Err(_err) => "".to_string(),
        };

        if encryption_key.len() == 0 {
            return Err(sqlx::Error::Configuration("A configuration error occurred".into()));
        }
        // Query to fill procedures table with dummy values
        let procedures_fill_query = format!(
            r#"
            INSERT INTO procedures (
                procedure_name, description
            )
            VALUES
            (
                pgp_sym_encrypt('General Check-up', '{}'),
                pgp_sym_encrypt('Routine physical examination and health assessment', '{}')
            ),
            (
                pgp_sym_encrypt('Blood Test', '{}'),
                pgp_sym_encrypt('Complete blood count and basic metabolic panel', '{}')
            ),
            (
                pgp_sym_encrypt('X-Ray', '{}'),
                pgp_sym_encrypt('Diagnostic imaging of specified body part', '{}')
            );
        "#,
            encryption_key,
            encryption_key,
            encryption_key,
            encryption_key,
            encryption_key,
            encryption_key
        );
        pool.execute(&*procedures_fill_query).await?;
    }

    Ok(())
}

pub async fn setup_all_patient_tables(pool: &sqlx::Pool<sqlx::Postgres>, dummy_data: bool) -> sqlx::Result<()> {
    delete_patient_tables(pool).await?;
    setup_patients_table(pool, dummy_data).await?;
    setup_procedures_table(pool, dummy_data).await?;
    setup_patient_activity_table(pool, dummy_data).await?;
    setup_patient_history_table(pool, dummy_data).await?;

    Ok(())
}

pub async fn delete_patient_tables(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let drop_query = r#"
        DROP TABLE IF EXISTS patient_history;
        DROP TABLE IF EXISTS patient_activity;
        DROP TABLE IF EXISTS procedures;
        DROP TABLE IF EXISTS patients;
    "#;
    pool.execute(drop_query).await?;

    Ok(())
}