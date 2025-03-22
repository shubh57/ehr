// src/redux/auth/interfaces.ts

export interface UserInterface {
    user_id: number;
    role: string;
    first_name: string;
    last_name: string;
    created_at: string;
}

export interface AuthState {
    token: string | null;
    user: UserInterface | null;
}
