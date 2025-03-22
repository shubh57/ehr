// src-tauri/src/messaging.rs

// Dependencies
use std::time::Duration;
use chrono::{DateTime, Utc};
use sqlx::{Postgres, Pool};
use serde::{Deserialize, Serialize};
use crate::db::DatabaseState;
use crate::auth::get_user_from_token;

#[derive(Serialize, Deserialize)]
pub struct MessageData {
    message_id: Option<i32>,
    conversation_id: Option<i32>,
    sender_id: Option<i32>,
    recipient_id: Option<i32>,
    content: Option<String>,
    status: Option<String>,
    created_at: Option<DateTime<Utc>>
}

#[derive(Serialize, Deserialize)]
pub struct Conversation {
    conversation_id: i32,
    user1: Option<i32>,
    user2: Option<i32>,
    last_message: Option<i32>,
    created_at: Option<DateTime<Utc>>,
    last_message_sender_id: Option<i32>,
    last_message_content: Option<String>,
    last_message_created_at: Option<DateTime<Utc>>
}

#[derive(Serialize, Deserialize)]
pub struct Message {
    message_id: i32,
    conversation_id: Option<i32>, 
    sender_id: Option<i32>,
    content: Option<String>,
    created_at: Option<DateTime<Utc>>
}

// Get unread messages for currently logged in user
async fn get_unread_messages(pool: tokio::sync::MutexGuard<'_, Pool<Postgres>>, token: String) -> Result<Vec<MessageData>, String> {
    let user = match get_user_from_token(token) {
        Ok(user) => user,
        Err(err) => return Err(format!("Forbidden."))
    };

    match sqlx::query_as!(
        MessageData,
        r#"
        SELECT
            m.message_id,
            m.conversation_id,
            m.sender_id,
            ms.recipient_id,
            m.content,
            ms.status,
            m.created_at
        FROM
            message_status ms
        LEFT JOIN
            messages m
        ON
            ms.message_id = m.message_id
        WHERE
            ms.status = 'delivered'
        "#
    )
    .fetch_all(&*pool)
    .await {
        Ok(unread_messages) => Ok(unread_messages),
        Err(err) => Err(format!("Error while fetching unread messages: {}", err))
    }
}

// Send message
#[tauri::command]
pub async fn send_message(
    state: tauri::State<'_, DatabaseState>, 
    token: String, 
    conversation_id: i32, 
    content: String
) -> Result<Message, String> {
    let user = match get_user_from_token(token) {
        Ok(user) => user,
        Err(err) => return Err(format!("Forbidden."))
    };

    let pool = state.pool.lock().await;

    eprintln!("Test.");

    let message: Message = sqlx::query_as!(
        Message,
        r#"
        INSERT INTO
            messages (conversation_id, sender_id, content)
        VALUES 
            ($1, $2, $3)
        RETURNING
            *
        "#,
        conversation_id,
        user.user_id,
        content
    )
    .fetch_one(&*pool)
    .await
    .map_err(|e| format!("Error while sending messages: {}", e)).unwrap();

    eprintln!("message: ");

    match sqlx::query!(
        r#"
        UPDATE
            conversations
        SET 
            last_message = $1
        WHERE
            conversation_id = $2
        RETURNING
            *
        "#,
        &message.message_id,
        &conversation_id
    )
    .fetch_one(&*pool)
    .await
    .map_err(|e| format!("Error while updating conversation history: {}", e)) {
        Ok(_) => {},
        Err(err) => {
            return Err(err);
        }
    };

    eprintln!("Second query done.");

    sqlx::query!(
        r#"
        INSERT INTO 
            message_status (message_id, recipient_id, status)
        VALUES
            ($1, (SELECT user2 
        FROM 
            conversations 
        WHERE
            conversation_id = $2 AND user1 = $3
        UNION
        SELECT 
            user1 
        FROM 
            conversations 
        WHERE 
            conversation_id = $2 AND user2 = $3), 'delivered')
        "#,
        message.message_id,
        conversation_id,
        user.user_id
    )
    .fetch_one(&*pool)
    .await
    .map_err(|e| format!(""));

    eprintln!("Third query done.");

    Ok(message)
}

// For real time notifications
#[tauri::command]
pub async fn poll_messages(
    app: tauri::AppHandle,
    state: tauri::State<'_, DatabaseState>,
    token: String
) -> Result<(), String> {
    let user = get_user_from_token(token.clone())?;
    let app_clone = app.clone();  
    let pool = state.pool.clone();

    tokio::spawn(async move {
        loop {
            let locked_pool = pool.lock().await;
            let messages = match get_unread_messages(locked_pool, token.clone()).await {
                Ok(data) => data,
                Err(err) => {
                    eprintln!("Error while getting unread messages: {}", err);
                    vec![]
                }
            };

            if !messages.is_empty() {
                // app.emit("new-messages", messages).unwrap();
            }
            tokio::time::sleep(Duration::from_secs(2)).await;
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn get_messages_for_conversation(
    state: tauri::State<'_, DatabaseState>,
    token: String,
    conversation_id: i32
) -> Result<Vec<MessageData>, String> {
    let pool = state.pool.lock().await;
    let _user = get_user_from_token(token)?; // Validate token first

    sqlx::query_as!(
        MessageData,
        r#"
        SELECT
            m.message_id,
            m.conversation_id,
            m.sender_id,
            COALESCE(ms.recipient_id, -1) as "recipient_id?",
            m.content,
            COALESCE(ms.status, 'delivered') as "status?",
            m.created_at
        FROM messages m
        LEFT JOIN message_status ms 
            ON m.message_id = ms.message_id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at DESC
        "#,
        conversation_id
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Message fetch error: {}", e))
}

// Get conversation id
#[tauri::command]
pub async fn get_conversation(
    state: tauri::State<'_, DatabaseState>,
    token: String,
    recipient_id: i32
) -> Result<Conversation, String> {
    let pool = state.pool.lock().await;
    let user = get_user_from_token(token)?;

    if user.user_id == recipient_id {
        return Err(format!("Cannot start a conversation with self."));
    }

    let smaller_id = std::cmp::min(user.user_id, recipient_id);
    let larger_id = std::cmp::max(user.user_id, recipient_id);

    sqlx::query_as!(
        Conversation,
        r#"
        WITH inserted_or_updated AS (
            INSERT INTO conversations (user1, user2)
            VALUES ($1, $2)
            ON CONFLICT (user1, user2) 
            DO UPDATE SET user1 = EXCLUDED.user1  -- No-op update
            RETURNING *
        )
        SELECT 
            c.conversation_id, 
            c.user1, 
            c.user2, 
            c.last_message, 
            c.created_at,
            m.sender_id AS "last_message_sender_id?",
            m.content AS "last_message_content?",
            m.created_at AS "last_message_created_at?"
        FROM inserted_or_updated c
        LEFT JOIN messages m ON c.last_message = m.message_id
        "#,
        smaller_id,
        larger_id
    )
    .fetch_one(&*pool)
    .await
    .map_err(|e| format!("Database error: {}", e))
}

// Get all conversations
#[tauri::command]
pub async fn get_all_conversations(
    state: tauri::State<'_, DatabaseState>,
    token: String
) -> Result<Vec<Conversation>, String> {
    let pool = state.pool.lock().await;
    let user = get_user_from_token(token)?;

    sqlx::query_as!(
        Conversation,
        r#"
        SELECT 
            c.conversation_id, 
            c.user1, 
            c.user2, 
            c.last_message, 
            c.created_at,
            m.sender_id AS "last_message_sender_id?",
            m.content AS "last_message_content?",
            m.created_at AS "last_message_created_at?"
        FROM 
            conversations c
        LEFT JOIN 
            messages m 
        ON 
            c.last_message = m.message_id
        WHERE
            c.user1 = $1
        OR
            c.user2 = $1
        ORDER BY
            m.created_at DESC
        "#,
        &user.user_id
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Error while getting conversations: {}", e))
}