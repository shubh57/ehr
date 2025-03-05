// src-tauri/src/auth.rs

use chrono::{DateTime, Duration, Utc};
// Dependencies
use serde::{Deserialize, Serialize};
use tauri::State;
use bcrypt::{hash, verify, DEFAULT_COST};
use crate::db::DatabaseState;
use jsonwebtoken::{encode, Header, EncodingKey};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    user_id: i32,
    role: String,
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    created_at: Option<DateTime<Utc>>
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    user: User,
    exp: usize // Expiry
}

#[derive(Serialize, Deserialize)]
pub struct SignupQuery {
    first_name: String,
    last_name: String,
    role: String,
    email: String,
    password: String
}

#[derive(Clone, Serialize, Deserialize)]
pub struct LoginResponse {
    user: User,
    token: String
}

fn create_jwt(user: &User, secret: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_sub_signed(Duration::hours(24))
        .expect("Valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        user: (*user).clone(),
        exp: expiration
    };

    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))
}

#[tauri::command]
pub async fn login(state: State<'_, DatabaseState>, email: String, password: String) -> Result<LoginResponse, String> {
    let pool = state.pool.lock().await;
    let encryption_key = match std::env::var("ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(_err) => "".to_string()
    };

    if encryption_key.len() == 0 {
        return Err(format!("Forbidden."));
    }

    match sqlx::query_as!(
        User,
        r#"
            SELECT 
                user_id,
                role,
                first_name,
                last_name,
                email,
                password,
                created_at
            FROM users
            WHERE email = $1
        "#,
        &email
    )
    .fetch_all(&*pool)
    .await {
        Ok(records) => {
            if records.len() == 1 {
                if verify(password, &records[0].password).map_err(|e| e.to_string())? {
                    let token = match create_jwt(&records[0], encryption_key.as_bytes()) {
                        Ok(token) => token,
                        Err(err) => return Err(format!("Error while creating jwt token: {}", err))
                    };
                    Ok(LoginResponse { user: records[0].clone(), token })
                } else {
                    Err(format!("Invalid password."))
                }
            } else {
                Err(format!("User not found."))
            }
        },
        Err(err) => Err(format!("Error while finding user: {}", err))
    }
}

#[tauri::command]
pub async fn signup(state: State<'_, DatabaseState>, signup_query: SignupQuery) -> Result<String, String> {
    let hashed_password = hash(signup_query.password, DEFAULT_COST).map_err(|e| e.to_string())?;
    let pool = state.pool.lock().await;

    match sqlx::query_as!(
        User,
        r#"
            INSERT INTO users ( role, first_name, last_name, email, password )
            VALUES ( $1, $2, $3, $4, $5 )
            RETURNING *
        "#,
        &signup_query.role,
        &signup_query.first_name,
        &signup_query.last_name,
        &signup_query.email,
        &hashed_password
    )
    .fetch_one(&*pool)
    .await {
        Ok(_record) => Ok(format!("Successfully created user")),
        Err(err) => Err(format!("Error while creating user: {}", err))
    }
}