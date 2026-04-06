/**
 * Centralized error handling middleware.
 * Must be registered after all routes.
 */
const errorHandler = (err, _req, res, _next) => {
  console.error('Error:', err.message);

  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details.map((d) => d.message),
    });
  }

  if (err.code === 'auth/id-token-expired') {
    return res.status(401).json({ error: 'Token expired' });
  }

  if (err.code === 'auth/argument-error') {
    return res.status(400).json({ error: 'Invalid authentication token' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';

  res.status(statusCode).json({ error: message });
};

/**
 * Helper to create errors with status codes.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, AppError };
