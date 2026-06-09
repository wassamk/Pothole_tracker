// src/features/admin/admin.routes.js
// Protected admin API routes (JWT + role-based authorization)

import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  login,
  getMe,
  getAllPotholes,
  updatePotholeStatus,
  flagPothole,
  deletePothole,
  getHeatmapData,
  getDashboardStats,
} from './admin.controller.js';

const router = express.Router();

// ─── Public Auth Routes ───────────────────────────────────────────────
// POST /api/admin/login
router.post('/login', login);

// ─── Protected Routes — requires valid JWT ────────────────────────────
// All routes below require authentication
router.use(protect);

// GET /api/admin/me — Current admin profile
router.get('/me', getMe);

// ─── Admin-only routes ─────────────────────────────────────────────────
router.use(authorize('admin', 'superadmin'));

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', getDashboardStats);

// GET /api/admin/heatmap — Geospatial heatmap data
router.get('/heatmap', getHeatmapData);

// GET /api/admin/potholes — All potholes with admin filters
router.get('/potholes', getAllPotholes);

// PATCH /api/admin/potholes/:id/status — Update status
router.patch('/potholes/:id/status', updatePotholeStatus);

// PATCH /api/admin/potholes/:id/flag — Flag as spam/duplicate
router.patch('/potholes/:id/flag', flagPothole);

// DELETE /api/admin/potholes/:id — Delete report
router.delete('/potholes/:id', authorize('superadmin'), deletePothole);

export default router;
