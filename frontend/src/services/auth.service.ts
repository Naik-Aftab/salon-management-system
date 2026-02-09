import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },
  
  refreshToken: () =>
    api.post('/auth/refresh'),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
};
