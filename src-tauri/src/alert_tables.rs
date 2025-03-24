// src-tauri/src/alert_tables.rs

// Dependencies
use sqlx::Executor;

pub async fn create_alerts_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let alert_query = r#"
        DROP TABLE IF EXISTS alerts;
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id SERIAL PRIMARY KEY,
            priority_level VARCHAR(20) CHECK (priority_level in ('EMERGENCY', 'NORMAL')) NOT NULL,
            title TEXT NOT NULL,
            message TEXT,
            issued_for INT REFERENCES users(user_id) ON DELETE CASCADE,
            issued_by INT REFERENCES users(user_id) ON DELETE CASCADE,
            status VARCHAR(20) CHECK (status IN ('delivered', 'read')) DEFAULT 'delivered',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    "#;
    pool.execute(alert_query).await?;

    Ok(())
}