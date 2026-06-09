// src/features/admin/admin.controller.js
// Admin-only endpoints: auth, pothole management, heatmap, stats

import jwt from 'jsonwebtoken';
import User from './admin.model.js';
import Pothole from '../potholes/pothole.model.js';
import { runPrioritizationEngine } from '../potholes/prioritization.service.js';

// ─── Helper: Generate JWT ─────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ─── Auth Controllers ─────────────────────────────────────────────────

/**
 * POST /api/admin/login
 * Authenticate admin and return JWT token
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: req.t('VALIDATION_ERROR'),
      });
    }

    // Find admin and explicitly include password
    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: req.t('LOGIN_FAILED'),
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: req.t('LOGIN_FAILED'),
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: req.t('LOGIN_SUCCESS'),
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/me
 * Get current logged-in admin profile
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

// ─── Pothole Management Controllers ───────────────────────────────────

/**
 * GET /api/admin/potholes
 * Fetch ALL potholes (including flagged) with full admin filters
 */
export const getAllPotholes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      isFlagged,
      sortBy = 'severityScore',
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (isFlagged !== undefined) filter.isFlagged = isFlagged === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [potholes, total] = await Promise.all([
      Pothole.find(filter)
        .sort({ [sortBy]: -1 })
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
 * PATCH /api/admin/potholes/:id/status
 * Update pothole status (Reported → In Progress → Resolved)
 */
export const updatePotholeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Reported', 'In Progress', 'Resolved', 'Flagged'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: req.t('VALIDATION_ERROR'),
      });
    }

    const update = { status };
    if (status === 'Resolved') update.resolvedAt = new Date();

    const pothole = await Pothole.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!pothole) {
      return res.status(404).json({
        success: false,
        message: req.t('POTHOLE_NOT_FOUND'),
      });
    }

    return res.status(200).json({
      success: true,
      message: req.t('POTHOLE_UPDATED'),
      data: pothole,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/potholes/:id/flag
 * Flag a pothole report as duplicate or spam
 */
export const flagPothole = async (req, res, next) => {
  try {
    const { reason = 'Duplicate or spam submission' } = req.body;

    const pothole = await Pothole.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true, flagReason: reason, status: 'Flagged' },
      { new: true }
    );

    if (!pothole) {
      return res.status(404).json({
        success: false,
        message: req.t('POTHOLE_NOT_FOUND'),
      });
    }

    return res.status(200).json({
      success: true,
      message: req.t('POTHOLE_FLAGGED'),
      data: pothole,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/potholes/:id
 * Permanently delete a pothole report
 */
export const deletePothole = async (req, res, next) => {
  try {
    const pothole = await Pothole.findByIdAndDelete(req.params.id);

    if (!pothole) {
      return res.status(404).json({
        success: false,
        message: req.t('POTHOLE_NOT_FOUND'),
      });
    }

    return res.status(200).json({
      success: true,
      message: req.t('POTHOLE_DELETED'),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Geospatial / Heatmap Controllers ─────────────────────────────────

/**
 * GET /api/admin/heatmap
 * Returns lightweight geospatial data for frontend heatmap rendering
 * Returns: array of { lat, lng, intensity } objects
 */
export const getHeatmapData = async (req, res, next) => {
  try {
    // Only fetch location + severity fields for performance
    const potholes = await Pothole.find(
      { isFlagged: false },
      { location: 1, severityScore: 1, status: 1, _id: 1 }
    ).lean();

    // Transform to heatmap-friendly format
    const heatmapPoints = potholes.map((p) => ({
      id: p._id,
      lat: p.location.coordinates[1], // GeoJSON: [lng, lat]
      lng: p.location.coordinates[0],
      intensity: p.severityScore,
      status: p.status,
    }));

    return res.status(200).json({
      success: true,
      message: req.t('HEATMAP_FOUND'),
      data: heatmapPoints,
      count: heatmapPoints.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Aggregated statistics for the admin dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCount,
      statusBreakdown,
      avgSeverity,
      recentReports,
      topSeverityAreas,
    ] = await Promise.all([
      // Total potholes
      Pothole.countDocuments(),

      // Count by status
      Pothole.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),

      // Average severity score
      Pothole.aggregate([
        { $match: { isFlagged: false } },
        { $group: { _id: null, avg: { $avg: '$severityScore' } } },
      ]),

      // Last 5 reports
      Pothole.find({ isFlagged: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Top 5 highest severity active potholes
      Pothole.find({ isFlagged: false, status: { $ne: 'Resolved' } })
        .sort({ severityScore: -1 })
        .limit(5)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: req.t('STATS_FOUND'),
      data: {
        totalCount,
        statusBreakdown,
        averageSeverityScore: avgSeverity[0]?.avg?.toFixed(1) || 0,
        recentReports,
        topSeverityAreas,
      },
    });
  } catch (error) {
    next(error);
  }
};
