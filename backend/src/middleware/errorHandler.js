// src/middleware/errorHandler.js
// Centralized Express error handling middleware (must have 4 params)

/**
 * Global Error Handler
 *
 * Catches errors from all routes and returns structured JSON responses.
 * Respects the current locale via req.t() if available.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error(`❌ Error [${req.method} ${req.url}]:`, err.message);

  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || (req.t ? req.t('SERVER_ERROR') : 'Internal Server Error');

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = req.t ? req.t('INVALID_ID') : 'Invalid ID format';
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for field: ${field}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = req.t ? req.t('TOKEN_INVALID') : 'Invalid token';
  }

  // Handle Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds the 5MB limit.';
  }

  return res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
