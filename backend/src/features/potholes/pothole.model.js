// src/features/potholes/pothole.model.js
// Mongoose schema for Pothole reports with geospatial 2dsphere indexing

import mongoose from 'mongoose';

/**
 * Pothole Schema
 *
 * Stores pothole reports with:
 * - GeoJSON Point location (2dsphere indexed for geospatial queries)
 * - Image references (local file paths)
 * - Dynamic severity scoring (auto-incremented by cluster detection)
 * - Status workflow (Reported → In Progress → Resolved)
 */
const potholeSchema = new mongoose.Schema(
  {
    // ─── Reporter Info ────────────────────────────────────────────
    reporterName: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },
    reporterContact: {
      type: String,
      trim: true,
    },

    // ─── Description ─────────────────────────────────────────────
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters.'],
    },

    // ─── GeoJSON Location (2dsphere indexed) ─────────────────────
    // MongoDB requires GeoJSON format: { type: "Point", coordinates: [lng, lat] }
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — NOTE: MongoDB is [lng, lat]
        required: [true, 'Coordinates are required.'],
        validate: {
          validator: function (v) {
            return (
              v.length === 2 &&
              v[0] >= -180 && v[0] <= 180 && // longitude
              v[1] >= -90 && v[1] <= 90       // latitude
            );
          },
          message: 'Coordinates must be valid [longitude, latitude] values.',
        },
      },
    },

    // Human-readable address (optional, can be reverse-geocoded on frontend)
    address: {
      type: String,
      trim: true,
    },

    // ─── Images ──────────────────────────────────────────────────
    // Array of local file paths (e.g., "/uploads/pothole-123456.jpg")
    images: {
      type: [String],
      validate: {
        validator: (v) => v.length >= 1,
        message: 'At least one image is required.',
      },
    },

    // ─── Severity Scoring ─────────────────────────────────────────
    // Base score from reporter (1=minor, 2=moderate, 3=severe)
    reportedSeverity: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    // Computed score (base + cluster bonus + admin adjustments)
    severityScore: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    // Number of reports within 50m radius (updated by engine)
    clusterCount: {
      type: Number,
      default: 0,
    },

    // ─── Status Workflow ──────────────────────────────────────────
    status: {
      type: String,
      enum: ['Reported', 'In Progress', 'Resolved', 'Flagged'],
      default: 'Reported',
    },

    // ─── Admin Flags ─────────────────────────────────────────────
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt automatically
  }
);

// ─── Geospatial Index ─────────────────────────────────────────────────
// CRITICAL: 2dsphere index enables MongoDB geospatial operators ($near, $geoWithin)
potholeSchema.index({ location: '2dsphere' });

// ─── Compound Index for efficient status + severity queries ───────────
potholeSchema.index({ status: 1, severityScore: -1 });

// ─── Virtual: formatted coordinate string ─────────────────────────────
potholeSchema.virtual('coordinateString').get(function () {
  const [lng, lat] = this.location.coordinates;
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
});

const Pothole = mongoose.model('Pothole', potholeSchema);
export default Pothole;
