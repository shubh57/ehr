// src-tauri/src/db_vision.rs

use sqlx::Executor;
use std::env;

// Function to create vision table
pub async fn create_vision_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    // Importing dependancy for encryption
    let encryption_query = r#"CREATE EXTENSION IF NOT EXISTS pgcrypto;"#;
    pool.execute(encryption_query).await?;

    let vision_query = r#"
        DROP TABLE IF EXISTS vision;
        CREATE TABLE IF NOT EXISTS vision (
            vision_id SERIAL PRIMARY KEY,
            patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
            near_vision BYTEA,
            distant_vision BYTEA,
            side VARCHAR(10) CHECK (side IN ('LEFT', 'RIGHT')) NOT NULL,
            value_type VARCHAR(10) CHECK (value_type IN ('UC', 'BCVA', 'PH')) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            created_by INT REFERENCES users(user_id) ON DELETE CASCADE, 
            updated_at TIMESTAMPTZ DEFAULT NULL,
            updated_by INT REFERENCES users(user_id) ON DELETE CASCADE DEFAULT NULL,
            CONSTRAINT unique_patient_vision UNIQUE (patient_id, side, value_type)
        );
    "#;
    pool.execute(vision_query).await?;

    Ok(())
}

// Function to create refraction table
pub async fn create_refraction_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    // Importing dependancy for encryption
    let encryption_query = r#"CREATE EXTENSION IF NOT EXISTS pgcrypto;"#;
    pool.execute(encryption_query).await?;

    let refraction_query = r#"
        DROP TABLE IF EXISTS refraction;
        CREATE TABLE IF NOT EXISTS refraction (
            refraction_id SERIAL PRIMARY KEY,
            patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
            spherical BYTEA,
            cylindrical BYTEA,
            axis BYTEA,
            side VARCHAR(10) CHECK (side IN ('LEFT', 'RIGHT')) NOT NULL,
            value_type VARCHAR(10) CHECK (value_type IN ('DL', 'UD')) NOT NULL,
            vision_type VARCHAR(10) CHECK (vision_type IN ('DV', 'NV')) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            created_by INT REFERENCES users(user_id) ON DELETE CASCADE, 
            updated_at TIMESTAMPTZ DEFAULT NULL,
            updated_by INT REFERENCES users(user_id) ON DELETE CASCADE DEFAULT NULL,
            CONSTRAINT unique_patient_refraction UNIQUE (patient_id, side, value_type, vision_type)
        );
    "#;
    pool.execute(refraction_query).await?;

    Ok(())
}

// Function to create eye_measurements table
pub async fn create_eye_measurement_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    // Importing dependancy for encryption
    let encryption_query = r#"CREATE EXTENSION IF NOT EXISTS pgcrypto;"#;
    pool.execute(encryption_query).await?;

    let refraction_query = r#"
        DROP TABLE IF EXISTS eye_measurement;
        CREATE TABLE IF NOT EXISTS eye_measurement (
            measurement_id SERIAL PRIMARY KEY,
            patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
            iop_at BYTEA,
            iop_nct BYTEA,
            cct BYTEA,
            tond BYTEA,
            side VARCHAR(10) CHECK (side IN ('LEFT', 'RIGHT')) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            created_by INT REFERENCES users(user_id) ON DELETE CASCADE, 
            updated_at TIMESTAMPTZ DEFAULT NULL,
            updated_by INT REFERENCES users(user_id) ON DELETE CASCADE DEFAULT NULL,
            CONSTRAINT unique_patient_eye_measurement UNIQUE (patient_id, side)
        );
    "#;
    pool.execute(refraction_query).await?;

    Ok(())
}

// Function to fill dummy data in vision table
pub async fn fill_vision_dummy_data(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let encryption_key = env::var("ENCRYPTION_KEY").expect("ENCRYPTION_KEY is required.");

    let vision_fill_query = format!(
        r#"
        INSERT INTO vision (patient_id, near_vision, distant_vision, side, value_type, created_by)
        VALUES
        (1, pgp_sym_encrypt('20/20', '{key}'), pgp_sym_encrypt('20/40', '{key}'), 'LEFT', 'UC', 2),
        (1, pgp_sym_encrypt('20/25', '{key}'), pgp_sym_encrypt('20/30', '{key}'), 'RIGHT', 'UC', 2),
        (1, pgp_sym_encrypt('20/15', '{key}'), pgp_sym_encrypt('20/20', '{key}'), 'LEFT', 'BCVA', 2),
        (1, pgp_sym_encrypt('20/25', '{key}'), pgp_sym_encrypt('20/25', '{key}'), 'RIGHT', 'BCVA', 2),
        (1, pgp_sym_encrypt('20/30', '{key}'), pgp_sym_encrypt('20/35', '{key}'), 'LEFT', 'PH', 2),
        (1, pgp_sym_encrypt('20/25', '{key}'), pgp_sym_encrypt('20/30', '{key}'), 'RIGHT', 'PH', 2),

        (2, pgp_sym_encrypt('20/50', '{key}'), pgp_sym_encrypt('20/70', '{key}'), 'LEFT', 'UC', 2),
        (2, pgp_sym_encrypt('20/40', '{key}'), pgp_sym_encrypt('20/60', '{key}'), 'RIGHT', 'UC', 2),
        (2, pgp_sym_encrypt('20/25', '{key}'), pgp_sym_encrypt('20/30', '{key}'), 'LEFT', 'BCVA', 2),
        (2, pgp_sym_encrypt('20/30', '{key}'), pgp_sym_encrypt('20/40', '{key}'), 'RIGHT', 'BCVA', 2),
        (2, pgp_sym_encrypt('20/35', '{key}'), pgp_sym_encrypt('20/50', '{key}'), 'LEFT', 'PH', 2),
        (2, pgp_sym_encrypt('20/40', '{key}'), pgp_sym_encrypt('20/45', '{key}'), 'RIGHT', 'PH', 2);
    "#,
        key = encryption_key
    );

    pool.execute(&*vision_fill_query).await?;
    Ok(())
}

// Function to fill dummy data in refraction table
pub async fn fill_refraction_dummy_data(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let encryption_key = env::var("ENCRYPTION_KEY").expect("ENCRYPTION_KEY is required.");

    let refraction_fill_query = format!(
        r#"
        INSERT INTO refraction (patient_id, spherical, cylindrical, axis, side, value_type, vision_type, created_by)
        VALUES
        (1, pgp_sym_encrypt('-1.00', '{key}'), pgp_sym_encrypt('-0.50', '{key}'), pgp_sym_encrypt('180', '{key}'), 'LEFT', 'DL', 'DV', 2),
        (1, pgp_sym_encrypt('-1.00', '{key}'), pgp_sym_encrypt('-0.50', '{key}'), pgp_sym_encrypt('180', '{key}'), 'LEFT', 'DL', 'NV', 2),

        (1, pgp_sym_encrypt('-1.25', '{key}'), pgp_sym_encrypt('-0.75', '{key}'), pgp_sym_encrypt('170', '{key}'), 'RIGHT', 'DL', 'DV', 2),
        (1, pgp_sym_encrypt('-1.25', '{key}'), pgp_sym_encrypt('-0.75', '{key}'), pgp_sym_encrypt('170', '{key}'), 'RIGHT', 'DL', 'NV', 2),

        (1, pgp_sym_encrypt('-0.75', '{key}'), pgp_sym_encrypt('-0.50', '{key}'), pgp_sym_encrypt('160', '{key}'), 'LEFT', 'UD', 'DV', 2),
        (1, pgp_sym_encrypt('-0.75', '{key}'), pgp_sym_encrypt('-0.50', '{key}'), pgp_sym_encrypt('160', '{key}'), 'LEFT', 'UD', 'NV', 2),

        (1, pgp_sym_encrypt('-1.00', '{key}'), pgp_sym_encrypt('-0.25', '{key}'), pgp_sym_encrypt('150', '{key}'), 'RIGHT', 'UD', 'DV', 2),
        (1, pgp_sym_encrypt('-1.00', '{key}'), pgp_sym_encrypt('-0.25', '{key}'), pgp_sym_encrypt('150', '{key}'), 'RIGHT', 'UD', 'NV', 2);
    "#,
        key = encryption_key
    );
    pool.execute(&*refraction_fill_query).await?;
    Ok(())
}

// Function to fill dummy data in eye_measurement table
pub async fn fill_eye_measurement_dummy_data(
    pool: &sqlx::Pool<sqlx::Postgres>,
) -> sqlx::Result<()> {
    let encryption_key = env::var("ENCRYPTION_KEY").expect("ENCRYPTION_KEY is required.");

    let eye_measurement_fill_query = format!(
        r#"
        INSERT INTO eye_measurement (patient_id, iop_at, iop_nct, cct, tond, side, created_by)
        VALUES
        (1, pgp_sym_encrypt('14', '{key}'), pgp_sym_encrypt('16', '{key}'), pgp_sym_encrypt('520', '{key}'), pgp_sym_encrypt('0.3', '{key}'), 'LEFT', 2),
        (1, pgp_sym_encrypt('15', '{key}'), pgp_sym_encrypt('17', '{key}'), pgp_sym_encrypt('530', '{key}'), pgp_sym_encrypt('0.2', '{key}'), 'RIGHT', 2),
        
        (2, pgp_sym_encrypt('13', '{key}'), pgp_sym_encrypt('18', '{key}'), pgp_sym_encrypt('510', '{key}'), pgp_sym_encrypt('0.4', '{key}'), 'LEFT', 2),
        (2, pgp_sym_encrypt('14.5', '{key}'), pgp_sym_encrypt('19', '{key}'), pgp_sym_encrypt('525', '{key}'), pgp_sym_encrypt('0.35', '{key}'), 'RIGHT', 2);
    "#,
        key = encryption_key
    );

    pool.execute(&*eye_measurement_fill_query).await?;
    Ok(())
}

// Function to setup all vision related tables
pub async fn setup_vision_tables(
    pool: &sqlx::Pool<sqlx::Postgres>,
    dummy_data: bool,
) -> sqlx::Result<()> {
    create_vision_table(pool).await?;
    create_refraction_table(pool).await?;
    create_eye_measurement_table(pool).await?;

    if dummy_data {
        fill_vision_dummy_data(pool).await?;
        fill_refraction_dummy_data(pool).await?;
        fill_eye_measurement_dummy_data(pool).await?;
    }

    Ok(())
}
