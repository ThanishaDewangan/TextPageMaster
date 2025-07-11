import { apiRequest } from './queryClient';
import { useAuthStore } from './store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  message: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiRequest('POST', '/api/auth/login', credentials);
    return res.json();
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const res = await apiRequest('POST', '/api/auth/register', data);
    return res.json();
  },

  getMe: async (): Promise<{ id: number; name: string; email: string }> => {
    const res = await apiRequest('GET', '/api/auth/me');
    return res.json();
  },
};

export const useAuth = () => {
  const { token, user, isAuthenticated, login, logout } = useAuthStore();

  const getAuthHeaders = () => ({
    Authorization: token ? `Bearer ${token}` : '',
  });

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    getAuthHeaders,
  };
};
