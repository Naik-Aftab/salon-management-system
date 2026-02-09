import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { login, register, logout, getCurrentUser, clearError } from '../features/auth/authSlice';
import type { LoginCredentials, RegisterData } from '../types/auth';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  return {
    // State
    user: auth.user,
    token: auth.token,
    isLoading: auth.isLoading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,

    // Actions
    login: (credentials: LoginCredentials) => dispatch(login(credentials)),
    register: (data: RegisterData) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    getCurrentUser: () => dispatch(getCurrentUser()),
    clearError: () => dispatch(clearError()),
  };
};
