// src/types/index.ts
// Centralised TypeScript interfaces for the Fix Karachi app

// ─── GeoJSON ────────────────────────────────────────────────────
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// ─── Pothole ─────────────────────────────────────────────────────
export type PotholeStatus = 'Reported' | 'In Progress' | 'Resolved' | 'Flagged';
export type ReportedSeverity = 1 | 2 | 3;

export interface Pothole {
  _id: string;
  reporterName: string;
  reporterContact?: string;
  description?: string;
  address?: string;
  location: GeoPoint;
  images: string[];
  reportedSeverity: ReportedSeverity;
  severityScore: number;
  clusterCount: number;
  status: PotholeStatus;
  isFlagged: boolean;
  flagReason?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Heatmap ──────────────────────────────────────────────────────
export interface HeatmapPoint {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  status: PotholeStatus;
}

// ─── Admin User ───────────────────────────────────────────────────
export type AdminRole = 'admin' | 'superadmin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

// ─── Auth ─────────────────────────────────────────────────────────
export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ─── API Response Wrappers ─────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ─── Dashboard Stats ───────────────────────────────────────────────
export interface StatusBreakdown {
  status: PotholeStatus;
  count: number;
}

export interface DashboardStats {
  totalCount: number;
  statusBreakdown: StatusBreakdown[];
  averageSeverityScore: string;
  recentReports: Pothole[];
  topSeverityAreas: Pothole[];
}

// ─── Report Form ───────────────────────────────────────────────────
export interface ReportFormValues {
  reporterName: string;
  reporterContact: string;
  description: string;
  address: string;
  reportedSeverity: ReportedSeverity;
}

// ─── Geolocation ──────────────────────────────────────────────────
export interface GeolocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
}

// ─── Prioritization Meta ──────────────────────────────────────────
export interface PrioritizationMeta {
  clusterCount: number;
  severityScore: number;
  isCluster: boolean;
}

// ─── Create Pothole API Response ──────────────────────────────────
export interface CreatePotholeResponse {
  success: boolean;
  message: string;
  data: Pothole;
  meta: PrioritizationMeta;
}
