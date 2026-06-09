// src/features/potholes/prioritization.service.js
// Smart Prioritization Engine — Cluster detection + severity scoring

import Pothole from './pothole.model.js';

/**
 * SEVERITY SCORING FORMULA
 *
 * finalScore = (baseSeverity * 10) + (clusterCount * 5) + statusBonus
 *
 * - baseSeverity: Reporter's rating (1=minor, 2=moderate, 3=severe) → ×10
 * - clusterCount: Number of reports within 50m radius → ×5 per report
 * - Status stays at 'Reported' unless updated by admin
 *
 * Score ranges:
 * - 10–20: Low priority (isolated minor)
 * - 21–40: Medium priority (moderate or small cluster)
 * - 41–100: High priority (severe or dense cluster)
 */

const CLUSTER_RADIUS_METERS = 50;
const CLUSTER_SCORE_BONUS_PER_REPORT = 5;

/**
 * Detects nearby pothole reports within 50 meters using MongoDB's $near operator.
 * Returns the count of existing reports in the cluster.
 *
 * @param {number} longitude
 * @param {number} latitude
 * @param {string|null} excludeId - Pothole ID to exclude from count (for updates)
 * @returns {Promise<number>} Number of reports in the cluster
 */
export const detectCluster = async (longitude, latitude, excludeId = null) => {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: CLUSTER_RADIUS_METERS,
      },
    },
    status: { $ne: 'Resolved' }, // Only count active reports
    isFlagged: false,            // Exclude flagged/spam
  };

  // Exclude the current report itself (useful for recalculation)
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const clusterCount = await Pothole.countDocuments(query);
  return clusterCount;
};

/**
 * Calculates the final severity score based on:
 * - Reporter's base severity rating
 * - Number of nearby cluster reports
 *
 * @param {number} reportedSeverity - 1, 2, or 3
 * @param {number} clusterCount - Reports within 50m radius
 * @returns {number} Final severity score (1–100)
 */
export const calculateSeverityScore = (reportedSeverity, clusterCount) => {
  const baseScore = reportedSeverity * 10;
  const clusterBonus = clusterCount * CLUSTER_SCORE_BONUS_PER_REPORT;
  const total = baseScore + clusterBonus;

  // Cap at 100
  return Math.min(total, 100);
};

/**
 * Full prioritization pipeline:
 * 1. Detect cluster around the given coordinates
 * 2. Calculate final severity score
 * 3. Return scoring data to be saved with the report
 *
 * @param {number} longitude
 * @param {number} latitude
 * @param {number} reportedSeverity
 * @param {string|null} excludeId
 * @returns {Promise<{ clusterCount: number, severityScore: number, isCluster: boolean }>}
 */
export const runPrioritizationEngine = async (
  longitude,
  latitude,
  reportedSeverity,
  excludeId = null
) => {
  const clusterCount = await detectCluster(longitude, latitude, excludeId);
  const severityScore = calculateSeverityScore(reportedSeverity, clusterCount);
  const isCluster = clusterCount > 0;

  console.log(
    `🔥 Prioritization Engine: coords=[${longitude},${latitude}], ` +
    `cluster=${clusterCount}, severity=${reportedSeverity}, score=${severityScore}`
  );

  return {
    clusterCount,
    severityScore,
    isCluster,
  };
};
