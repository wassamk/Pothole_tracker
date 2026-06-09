// src/utils/api.ts
// Typed Axios instance with auth + i18n interceptors

import axios, { type AxiosResponse } from 'axios';
import type {
  Pothole,
  HeatmapPoint,
  DashboardStats,
  AdminUser,
  LoginCredentials,
  ApiResponse,
  PaginatedResponse,
  CreatePotholeResponse,
  PotholeStatus,
} from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const lang = localStorage.getItem('fk_language') ?? 'en';
  config.headers['Accept-Language'] = lang;

  return config;
});

// ─── Response interceptor ─────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('fk_token');
      localStorage.removeItem('fk_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  },
);

// ─── Query param types ────────────────────────────────────────────
export interface PotholeListParams {
  page?: number;
  limit?: number;
  status?: PotholeStatus | '';
  minSeverity?: number;
  sortBy?: string;
}

// ─── Pothole API ─────────────────────────────────────────────────
export const potholeApi = {
  create: (formData: FormData): Promise<AxiosResponse<CreatePotholeResponse>> =>
    api.post('/potholes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAll: (params?: PotholeListParams): Promise<AxiosResponse<PaginatedResponse<Pothole>>> =>
    api.get('/potholes', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<Pothole>>> =>
    api.get(`/potholes/${id}`),

  getNearby: (
    lat: number,
    lng: number,
    radius?: number,
  ): Promise<AxiosResponse<ApiResponse<Pothole[]>>> =>
    api.get('/potholes/nearby', { params: { lat, lng, radius } }),
};

// ─── Admin API ───────────────────────────────────────────────────
export const adminApi = {
  // Auth
  login: (
    credentials: LoginCredentials,
  ): Promise<AxiosResponse<ApiResponse<{ token: string; user: AdminUser }>>> =>
    api.post('/admin/login', credentials),

  getMe: (): Promise<AxiosResponse<ApiResponse<AdminUser>>> => api.get('/admin/me'),

  // Dashboard
  getStats: (): Promise<AxiosResponse<ApiResponse<DashboardStats>>> =>
    api.get('/admin/stats'),

  getHeatmap: (): Promise<AxiosResponse<ApiResponse<HeatmapPoint[]>>> =>
    api.get('/admin/heatmap'),

  // Pothole management
  getAllPotholes: (params?: PotholeListParams): Promise<AxiosResponse<PaginatedResponse<Pothole>>> =>
    api.get('/admin/potholes', { params }),

  updateStatus: (
    id: string,
    status: PotholeStatus,
  ): Promise<AxiosResponse<ApiResponse<Pothole>>> =>
    api.patch(`/admin/potholes/${id}/status`, { status }),

  flagPothole: (
    id: string,
    reason: string,
  ): Promise<AxiosResponse<ApiResponse<Pothole>>> =>
    api.patch(`/admin/potholes/${id}/flag`, { reason }),

  deletePothole: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/admin/potholes/${id}`),
};

export default api;
