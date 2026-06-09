// src/features/potholes/pothole.controller.js
// Handles all pothole reporting logic — creation, retrieval, and nearby queries

import Pothole from './pothole.model.js';
import { runPrioritizationEngine } from './prioritization.service.js';

/**
 * POST /api/potholes
 * Submit a new pothole report with images and geolocation
 * Requires: multipart/form-data
 */
export const createPothole = async (req, res, next) => {
  try {
    const { latitude, longitude, description, reporterName, reporterContact, address, reportedSeverity } = req.body;

    // Validate location fields
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: req.t('LOCATION_REQUIRED'),
      });
    }

    // Validate images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: req.t('IMAGE_REQUIRED'),
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const severity = parseInt(reportedSeverity) || 1;

    // Build image paths array from uploaded files
    const images = req.files.map((file) => `/uploads/${file.filename}`);

    // Run smart prioritization engine (cluster detection + scoring)
    const { clusterCount, severityScore, isCluster } =
      await runPrioritizationEngine(lng, lat, severity);

    // Create the pothole document
    const pothole = await Pothole.create({
      reporterName: reporterName || 'Anonymous',
      reporterContact,
      description,
      address,
      location: {
        type: 'Point',
        coordinates: [lng, lat], // MongoDB GeoJSON: [longitude, latitude]
      },
      images,
      reportedSeverity: severity,
      severityScore,
      clusterCount,
    });

    // Build response message — include cluster note if applicable
    let message = req.t('POTHOLE_CREATED');
    if (isCluster) {
      message += ` ${req.t('POTHOLE_CLUSTER_NOTE')}`;
    }

    return res.status(201).json({
      success: true,
      message,
      data: pothole,
      meta: {
        clusterCount,
        severityScore,
        isCluster,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/potholes
 * Fetch all pothole reports with pagination, filtering, and sorting
 * Query params: page, limit, status, minSeverity, sortBy
 */
export const getPotholes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      minSeverity,
      sortBy = 'severityScore',
    } = req.query;

    // Build filter object
    const filter = { isFlagged: false };
    if (status) filter.status = status;
    if (minSeverity) filter.severityScore = { $gte: parseInt(minSeverity) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = { [sortBy]: -1 }; // Descending by default

    const [potholes, total] = await Promise.all([
      Pothole.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Pothole.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: req.t('POTHOLES_FOUND'),
      data: potholes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/potholes/:id
 * Fetch a single pothole report by MongoDB ObjectId
 */
export const getPotholeById = async (req, res, next) => {
  try {
    const pothole = await Pothole.findById(req.params.id);

    if (!pothole) {
      return res.status(404).json({
        success: false,
        message: req.t('POTHOLE_NOT_FOUND'),
      });
    }

    return res.status(200).json({
      success: true,
      message: req.t('POTHOLE_FOUND'),
      data: pothole,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/potholes/nearby
 * Find potholes within a given radius using $geoWithin/$near
 * Query params: lat, lng, radius (meters, default 500)
 */
export const getNearbyPotholes = async (req, res, next) => {
  try {
    const { lat, lng, radius = 500 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: req.t('LOCATION_REQUIRED'),
      });
    }

    const potholes = await Pothole.find({
      isFlagged: false,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    }).lean();

    return res.status(200).json({
      success: true,
      message: req.t('POTHOLES_FOUND'),
      data: potholes,
      count: potholes.length,
    });
  } catch (error) {
    next(error);
  }
};
