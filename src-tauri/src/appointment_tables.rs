// src-tauri/src/appointment_tables.rs

// Dependencies
use sqlx::Executor;

pub async fn setup_appointment_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let appointment_query = r#"
        DROP TABLE IF EXISTS appointments;
        CREATE TABLE IF NOT EXISTS appointments (
            appointment_id SERIAL PRIMARY KEY,
            description TEXT NOT NULL,
            appointment_time TIMESTAMPTZ NOT NULL,
            appointment_duration INTERVAL NOT NULL,
            created_by INT REFERENCES users(user_id) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;

    pool.execute(appointment_query).await?;
    Ok(())
}

pub async fn setup_appointment_users_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let appointment_users_query = r#"
        DROP TABLE IF EXISTS appointment_users;
        CREATE TABLE IF NOT EXISTS appointment_users (  
            appointment_id INT REFERENCES appointments(appointment_id),
            user_id INT REFERENCES users(user_id),
            PRIMARY KEY (appointment_id, user_id)
        );
    "#;
    pool.execute(appointment_users_query).await?;

    Ok(())
}

pub async fn drop_appointment_tables(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let drop_query = r#"
        DROP TABLE IF EXISTS appointment_users;
        DROP TABLE IF EXISTS appointments;
    "#;
    pool.execute(drop_query).await?;

    Ok(())
}

pub async fn setup_all_appointment_tables(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    drop_appointment_tables(pool).await?;

    setup_appointment_table(pool).await?;
    setup_appointment_users_table(pool).await?;

    Ok(())
}