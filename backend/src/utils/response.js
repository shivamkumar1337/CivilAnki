/**
 * Standardized API Response Utilities
 * 
 * This module provides a centralized way to handle all API responses
 * with consistent formatting, status codes, and error handling.
 * 
 * @author CivilAnki Backend Team
 * @version 1.0.0
 */

// const { logger } = require('./logger');

/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

class ApiResponse {
  /**
   * Send successful response
   */
  static success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK, meta = {}) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null && data !== undefined) {
      response.data = data;
    }

    if (meta && Object.keys(meta).length > 0) {
      response.meta = meta;
    }

    // logger.info(`API Success: ${statusCode} - ${message}`, {
    //   statusCode,
    //   hasData: data !== null && data !== undefined,
    //   dataType: data ? typeof data : null,
    //   responseSize: JSON.stringify(response).length
    // });

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(res, message = 'Internal Server Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null, meta = {}) {
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    };

    // Include error details in development mode or for client errors
    if (details && (process.env.NODE_ENV !== 'production' || statusCode < 500)) {
      response.details = details;
    }

    if (meta && Object.keys(meta).length > 0) {
      response.meta = meta;
    }

    // logger.error(`API Error: ${statusCode} - ${message}`, {
    //   statusCode,
    //   message,
    //   details: process.env.NODE_ENV !== 'production' ? details : '[HIDDEN IN PRODUCTION]',
    //   meta
    // });

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(res, errors = [], message = 'Validation failed') {
    const response = {
      success: false,
      error: message,
      errors: errors.map(err => ({
        field: err.field || err.path || err.param,
        message: err.message || err.msg,
        value: err.value,
        ...(err.location && { location: err.location })
      })),
      timestamp: new Date().toISOString()
    };

    // logger.warn(`Validation Error: ${message}`, {
    //   errorCount: errors.length,
    //   fields: errors.map(err => err.field || err.path || err.param)
    // });

    return res.status(HTTP_STATUS.BAD_REQUEST).json(response);
  }

  // Specific error response methods
  static unauthorized(res, message = 'Unauthorized access', meta = {}) {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED, null, meta);
  }

  static forbidden(res, message = 'Access forbidden', meta = {}) {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN, null, meta);
  }

  static notFound(res, message = 'Resource not found', meta = {}) {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND, null, meta);
  }

  static conflict(res, message = 'Resource conflict', details = null) {
    return this.error(res, message, HTTP_STATUS.CONFLICT, details);
  }

  static tooManyRequests(res, message = 'Too many requests', meta = {}) {
    return this.error(res, message, HTTP_STATUS.TOO_MANY_REQUESTS, null, meta);
  }

  /**
   * Send paginated response with metadata
   */
  static paginated(res, data = [], pagination = {}, message = 'Data retrieved successfully') {
    const meta = {
      pagination: {
        currentPage: pagination.currentPage || 1,
        itemsPerPage: pagination.itemsPerPage || 10,
        totalItems: pagination.totalItems || data.length,
        totalPages: pagination.totalPages || 1,
        hasNextPage: pagination.hasNextPage || false,
        hasPreviousPage: pagination.hasPreviousPage || false,
        ...pagination
      }
    };

    return this.success(res, data, message, HTTP_STATUS.OK, meta);
  }

  /**
   * Send created response for new resources
   */
  static created(res, data = null, message = 'Resource created successfully', location = null) {
    if (location) {
      res.location(location);
    }

    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
   * Send accepted response for async operations
   */
  static accepted(res, data = null, message = 'Request accepted for processing') {
    return this.success(res, data, message, HTTP_STATUS.ACCEPTED);
  }

  /**
   * Send no content response
   */
  static noContent(res) {
    // logger.info('API Success: 204 - No Content');
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  /**
   * Send health check response
   */
  static health(res, healthData = {}) {
    const response = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      ...healthData
    };

    return res.status(HTTP_STATUS.OK).json(response);
  }

  /**
   * Handle async controller wrapper
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Send response based on operation result
   */
  static fromResult(res, result, successMessage = 'Operation successful', errorMessage = 'Operation failed') {
    if (result && result.success !== false) {
      return this.success(res, result, successMessage);
    } else {
      const error = result ? result.error || result.message : errorMessage;
      const statusCode = result && result.statusCode ? result.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      return this.error(res, error, statusCode);
    }
  }
}

module.exports = {
  ApiResponse,
  HTTP_STATUS
};
