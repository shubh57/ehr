// src-tauri/src/common_tables.rs

// Dependancies
use sqlx::Executor;

// Function to create users table
pub async fn setup_users_table(pool: &sqlx::Pool<sqlx::Postgres>, dummy_data: bool) -> sqlx::Result<()> {
    // Importing dependancy for encryption
    let encryption_query = r#"CREATE EXTENSION IF NOT EXISTS pgcrypto;"#;
    pool.execute(encryption_query).await?;

    // Creating users table
    let users_query = r#"
        DROP TABLE IF EXISTS users;
        CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            role VARCHAR(20) CHECK (role IN ('DOCTOR', 'NURSE', 'ADMIN')) NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;
    pool.execute(users_query).await?;

    if dummy_data {
        let users_fill_query = r#"
            INSERT INTO users ( role, first_name, last_name, email, password )
            VALUES 
                ( 'DOCTOR', 'ALICE', 'JOHNSON', 'alice.j@saco.in', 'something'),
                ( 'NURSE', 'SYDNEY', 'SWEENEY', 'sdy@saco.in', 'something-2');
        "#;

        pool.execute(users_fill_query).await?;
    }

    Ok(())
}

// Function to setup all common tables
pub async fn setup_all_tables(pool: &sqlx::Pool<sqlx::Postgres>, dummy_data: bool) -> sqlx::Result<()> {
    delete_common_tables(pool).await?;
    setup_users_table(pool, dummy_data).await?;

    Ok(())
}

// Function to drop all common tables
pub async fn delete_common_tables(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let drop_query = r#"
        DROP TABLE IF EXISTS users;
    "#;

    pool.execute(drop_query).await?;
    Ok(())
}