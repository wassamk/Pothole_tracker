// src/locales/en/messages.js
// English API response messages

const en = {
  // General
  SERVER_ERROR: 'An internal server error occurred. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  INVALID_ID: 'The provided ID is invalid.',

  // Auth
  LOGIN_SUCCESS: 'Login successful.',
  LOGIN_FAILED: 'Invalid email or password.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  TOKEN_INVALID: 'Authentication token is invalid or expired.',
  TOKEN_REQUIRED: 'Authentication token is required.',

  // Potholes
  POTHOLE_CREATED: 'Pothole report submitted successfully. Thank you for helping fix Karachi!',
  POTHOLE_FOUND: 'Pothole report retrieved successfully.',
  POTHOLES_FOUND: 'Pothole reports retrieved successfully.',
  POTHOLE_NOT_FOUND: 'Pothole report not found.',
  POTHOLE_UPDATED: 'Pothole status updated successfully.',
  POTHOLE_DELETED: 'Pothole report deleted successfully.',
  POTHOLE_FLAGGED: 'Pothole report flagged as duplicate/spam.',
  POTHOLE_CLUSTER_NOTE: 'A cluster of reports detected nearby. Severity score has been increased.',

  // Location
  LOCATION_REQUIRED: 'Location data (latitude and longitude) is required.',
  IMAGE_REQUIRED: 'At least one image of the pothole is required.',

  // Admin
  STATS_FOUND: 'Statistics retrieved successfully.',
  HEATMAP_FOUND: 'Heatmap data retrieved successfully.',
};

export default en;
