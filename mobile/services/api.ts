import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../types';

/**
 * Base URL for the backend API.
 * - Android emulator  → 10.0.2.2
 * - Physical device   → replace with your machine's local IP
 * - iOS simulator     → localhost
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Clear session on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

// ── Auth API ─────────────────────────────────────────────────
export const authAPI = {
  login:      (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

// ── Task API ─────────────────────────────────────────────────
export const taskAPI = {
  getAll: (params?: { status?: string; priority?: string; search?: string }) =>
    api.get('/tasks', { params }),
  getById:  (id: number)               => api.get(`/tasks/${id}`),
  create:   (data: Partial<Task>)      => api.post('/tasks', data),
  update:   (id: number, data: Partial<Task>) => api.put(`/tasks/${id}`, data),
  delete:   (id: number)               => api.delete(`/tasks/${id}`),
  getStats: ()                         => api.get('/tasks/stats'),
};

// ── User API ─────────────────────────────────────────────────
export const userAPI = {
  getEmployees: ()                              => api.get('/users/employees'),
  getById:      (id: number)                    => api.get(`/users/${id}`),
  update:       (id: number, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
};

export default api;
