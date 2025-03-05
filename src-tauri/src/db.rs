// src-tauri/src/db.rs

// Dependancies
use sqlx::postgres::PgPool;
use sqlx::postgres::PgPoolOptions;
use std::{env, sync::Arc};
use tokio::sync::Mutex;

// Struct for storing pool globally in the state
pub struct DatabaseState {
    pub pool: Arc<Mutex<PgPool>>,
}

// Function to connect to postgresql db
pub async fn connect_to_database() -> sqlx::Result<sqlx::Pool<sqlx::Postgres>> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL is required");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .test_before_acquire(true)
        .connect(&database_url)
        .await?;

    Ok(pool)
}