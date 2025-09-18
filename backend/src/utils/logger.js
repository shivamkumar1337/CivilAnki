/**
 * Production-Ready Logging System
 * 
 * This module provides comprehensive logging functionality with multiple
 * transport options, log rotation, structured logging, and environment-specific
 * configuration for the CivilAnki backend application.
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Environment configuration
const environment = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || (environment === 'production' ? 'info' : 'debug');

/**
 * Custom log levels with numeric priorities
 */
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'cyan',
  }
};

winston.addColors(customLevels.colors);

/**
 * Development format (human readable with colors)
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `[${timestamp}] ${level}: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    return logMessage;
  })
);

/**
 * Production format (JSON structured with system info)
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    return JSON.stringify({
      ...info,
      hostname: os.hostname(),
      pid: process.pid,
      memory: process.memoryUsage(),
    });
  })
);

/**
 * Sanitize sensitive data from logs
 */
const sanitizeFormat = winston.format((info) => {
  const sensitiveFields = [
    'password', 'token', 'refresh_token', 'access_token', 'otp', 
    'secret', 'key', 'authorization', 'auth', 'credential',
    'phone', 'email', 'mobile'
  ];
  
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = { ...obj };
    
    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        if (typeof sanitized[key] === 'string' && sanitized[key].length > 4) {
          // Partial redaction for debugging
          const value = sanitized[key];
          sanitized[key] = `${value.substring(0, 2)}***${value.substring(value.length - 2)}`;
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeObject(sanitized[key]);
      }
    });
    
    return sanitized;
  };
  
  if (info.meta) {
    info.meta = sanitizeObject(info.meta);
  }
  
  if (typeof info.message === 'object') {
    info.message = sanitizeObject(info.message);
  }
  
  return info;
});

/**
 * File transport with daily rotation
 */
const createFileTransport = (filename, level = 'info') => {
  return new DailyRotateFile({
    filename: path.join(logDir, filename),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: level,
    format: environment === 'production' ? productionFormat : developmentFormat,
  });
};

/**
 * Winston logger configuration
 */
const logger = winston.createLogger({
  level: logLevel,
  levels: customLevels.levels,
  format: winston.format.combine(
    sanitizeFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console({
      level: logLevel,
      format: environment === 'production' ? productionFormat : developmentFormat,
    }),
    createFileTransport('application-%DATE%.log', 'info'),
    createFileTransport('error-%DATE%.log', 'error'),
    createFileTransport('debug-%DATE%.log', 'debug'),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') }),
  ],
  exitOnError: false,
});

/**
 * Enhanced Logger class with specialized methods
 */
class Logger {
  constructor(winstonLogger) {
    this.winston = winstonLogger;
    this.requestId = null;
    this.defaultMeta = {};
  }

  setRequestId(requestId) {
    this.requestId = requestId;
    return this;
  }

  child(defaultMeta = {}) {
    const childLogger = new Logger(this.winston);
    childLogger.defaultMeta = { ...this.defaultMeta, ...defaultMeta };
    childLogger.requestId = this.requestId;
    return childLogger;
  }

  formatLog(level, message, meta = {}) {
    const logMeta = {
      ...this.defaultMeta,
      ...meta,
    };

    if (this.requestId) {
      logMeta.requestId = this.requestId;
    }

    logMeta.timestamp = new Date().toISOString();
    
    return { level, message, ...logMeta };
  }

  // Standard log levels
  error(message, meta = {}) {
    this.winston.error(this.formatLog('error', message, meta));
  }

  warn(message, meta = {}) {
    this.winston.warn(this.formatLog('warn', message, meta));
  }

  info(message, meta = {}) {
    this.winston.info(this.formatLog('info', message, meta));
  }

  http(message, meta = {}) {
    this.winston.http(this.formatLog('http', message, meta));
  }

  debug(message, meta = {}) {
    this.winston.debug(this.formatLog('debug', message, meta));
  }

  // Specialized logging methods
  performance(operation, duration, meta = {}) {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      operation,
      duration,
      performance: true,
      ...meta
    });
  }

  security(event, meta = {}) {
    this.warn(`Security Event: ${event}`, {
      event,
      security: true,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  database(operation, table, meta = {}) {
    this.debug(`Database: ${operation} on ${table}`, {
      operation,
      table,
      database: true,
      ...meta
    });
  }

  api(method, path, statusCode, responseTime, meta = {}) {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
    
    this[level](`API: ${method} ${path} - ${statusCode}`, {
      method,
      path,
      statusCode,
      responseTime,
      api: true,
      ...meta
    });
  }

  auth(event, userId, meta = {}) {
    this.info(`Auth: ${event}`, {
      event,
      userId: userId ? `user_${userId.substring(0, 8)}***` : 'anonymous',
      auth: true,
      ...meta
    });
  }

  // Performance timer
  timer(operation) {
    const startTime = process.hrtime.bigint();
    
    return {
      end: (meta = {}) => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;
        this.performance(operation, parseFloat(duration.toFixed(2)), meta);
        return duration;
      }
    };
  }

  health(component, status, meta = {}) {
    const level = status === 'healthy' ? 'info' : 'error';
    this[level](`Health: ${component} is ${status}`, {
      component,
      status,
      health: true,
      ...meta
    });
  }
}

// Create main logger instance
const mainLogger = new Logger(logger);

// Request-specific logger factory
const createRequestLogger = (requestId, additionalMeta = {}) => {
  return mainLogger.child({ requestId, ...additionalMeta });
};

// Morgan stream interface
const stream = {
  write: (message) => {
    mainLogger.http(message.trim());
  }
};

// Global error handlers
process.on('uncaughtException', (error) => {
  mainLogger.error('Uncaught Exception:', { 
    error: error.message, 
    stack: error.stack,
    fatal: true 
  });
});

process.on('unhandledRejection', (reason, promise) => {
  mainLogger.error('Unhandled Rejection:', { 
    reason: reason?.message || reason, 
    promise: promise.toString(),
    fatal: true 
  });
});

// Log application startup
mainLogger.info('Logger initialized', {
  environment,
  logLevel,
  logDir,
  hostname: os.hostname(),
  platform: os.platform(),
  nodeVersion: process.version,
  pid: process.pid
});

module.exports = {
  logger: mainLogger,
  createRequestLogger,
  stream,
  Logger,
};
