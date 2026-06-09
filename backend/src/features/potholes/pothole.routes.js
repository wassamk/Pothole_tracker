// src/features/potholes/pothole.routes.js
// Public pothole reporting API routes

import express from 'express';
import upload from '../../config/multer.js';
import {
  createPothole,
  getPotholes,
  getPotholeById,
  getNearbyPotholes,
} from './pothole.controller.js';

const router = express.Router();

/**
 * Public Routes (no authentication required)
 */

// GET  /api/potholes/nearby?lat=&lng=&radius=
// Must be before /:id to avoid "nearby" being treated as an ObjectId
router.get('/nearby', getNearbyPotholes);

// GET  /api/potholes?page=&limit=&status=&minSeverity=&sortBy=
router.get('/', getPotholes);

// GET  /api/potholes/:id
router.get('/:id', getPotholeById);

// POST /api/potholes
// Accepts multipart/form-data with up to 5 images
router.post('/', upload.array('images', 5), createPothole);

export default router;
