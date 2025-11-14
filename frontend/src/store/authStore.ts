import { create } from 'zustand';
import { User, AuthResponse } from '../types';
import { authApi, usersApi } from '../services/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('access_token'),

  login: async (email, password) => {
    try {
      set({ isLoading: true });
      const response = await authApi.login({ email, password });
      const data: AuthResponse = response.data;

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      set({ user: data.user, isAuthenticated: true });
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true });
      const response = await authApi.register(data);
      const authData: AuthResponse = response.data;

      localStorage.setItem('access_token', authData.access_token);
      localStorage.setItem('refresh_token', authData.refresh_token);

      set({ user: authData.user, isAuthenticated: true });
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  loadUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      set({ isLoading: true });
      const response = await usersApi.getProfile();
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
