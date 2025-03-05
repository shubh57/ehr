// src/redux/auth/authSlice.ts

// Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOKEN_KEY, USER_KEY } from '../../utils/utils';
import { AuthState, UserInterface } from './interfaces';

const initialState: AuthState = {
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY) as string) : null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string; user: UserInterface }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            localStorage.setItem(TOKEN_KEY, action.payload.token);
            localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
        },
        clearCredentials: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        },
    },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
