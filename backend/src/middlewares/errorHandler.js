// const { logger } = require('../utils/logger');
const { ApiResponse } = require('../utils/response');

const errorHandler = (error, req, res, next) => {
  // logger.error('Global error handler:', {
  //   message: error.message,
  //   stack: error.stack,
  //   url: req.url,
  //   method: req.method,
  //   ip: req.ip
  // });

  // Supabase specific errors
  if (error.code && error.code.startsWith('PGRST')) {
    return ApiResponse.error(res, 'Database operation failed', 400);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired');
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return ApiResponse.validationError(res, error.details);
  }

  // Default error response
  return ApiResponse.error(
    res, 
    process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    500,
    process.env.NODE_ENV !== 'production' ? error.stack : null
  );
};

module.exports = { errorHandler };
