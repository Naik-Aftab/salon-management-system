export type UserRole = 'owner' | 'manager' | 'employee';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

interface LoginPayload {
  role: UserRole;
  name?: string;
}

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('sms_auth_user');

const initialState: AuthState = {
  isAuthenticated: Boolean(storedUser),
  user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      const { role, name } = action.payload;
      const user: AuthUser = {
        id: crypto.randomUUID(),
        role,
        name: name?.trim() ? name.trim() : role[0].toUpperCase() + role.slice(1),
      };

      state.isAuthenticated = true;
      state.user = user;

      localStorage.setItem('sms_auth_user', JSON.stringify(user));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('sms_auth_user');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
