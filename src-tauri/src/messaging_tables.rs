// src-tauri/src/messaging_tables.rs

// Dependencies
use sqlx::Executor;

pub async fn setup_conversations_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let conversation_query = r#"
        DROP TABLE IF EXISTS conversations;
        CREATE TABLE IF NOT EXISTS conversations (
            conversation_id SERIAL PRIMARY KEY,
            user1 INT REFERENCES users(user_id) ON DELETE CASCADE,
            user2 INT REFERENCES users(user_id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_conversation UNIQUE (user1, user2)
        );
    "#;

    pool.execute(conversation_query).await?;
    Ok(())
}

pub async fn setup_messages_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let messages_query = r#"
        DROP TABLE IF EXISTS messages;
        CREATE TABLE IF NOT EXISTS messages (
            message_id SERIAL PRIMARY KEY,
            conversation_id INT REFERENCES conversations(conversation_id) ON DELETE CASCADE,
            sender_id INT REFERENCES users(user_id) ON DELETE SET NULL,
            content TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at DESC);
    "#;

    pool.execute(messages_query).await?;
    Ok(())
}

pub async fn setup_message_status_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let message_status_query = r#"
        DROP TABLE IF EXISTS message_status;
        CREATE TABLE IF NOT EXISTS message_status (
            message_status_id SERIAL PRIMARY KEY,
            message_id INT REFERENCES messages(message_id) ON DELETE CASCADE,
            recipient_id INT REFERENCES users(user_id) ON DELETE CASCADE,
            status TEXT CHECK (status IN ('delivered', 'read')) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_message_status_user ON message_status (recipient_id, status);
    "#;

    pool.execute(message_status_query).await?;
    Ok(())
}

pub async fn setup_files_table(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let files_query = r#"
        DROP TABLE IF EXISTS files;
        CREATE TABLE IF NOT EXISTS files (
            file_id SERIAL PRIMARY KEY,
            message_id INT REFERENCES messages(message_id) ON DELETE CASCADE,
            file_url TEXT NOT NULL,
            file_type TEXT NOT NULL, -- e.g., 'image/png', 'application/pdf'
            file_size BIGINT NOT NULL, -- in bytes
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_messages_files ON files (message_id, created_at DESC);
    "#;

    pool.execute(files_query).await?;
    Ok(())
}

pub async fn delete_messaing_tables(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    let drop_query = r#"
        DROP TABLE IF EXISTS files;
        DROP TABLE IF EXISTS message_status;
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS conversations;
    "#;

    pool.execute(drop_query).await?;

    Ok(())
}

pub async fn setup_messaging_tables(pool: &sqlx::Pool<sqlx::Postgres>) -> sqlx::Result<()> {
    delete_messaing_tables(pool).await?;

    setup_conversations_table(pool).await?;
    setup_messages_table(pool).await?;
    setup_message_status_table(pool).await?;
    setup_files_table(pool).await?;
    Ok(())
}
