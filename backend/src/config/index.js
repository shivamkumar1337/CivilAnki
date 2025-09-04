const path = require('path');

// Load environment variables
require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development'
  },

  // Database configuration
  database: {
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    tokenExpiry: process.env.TOKEN_EXPIRY || '7d',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '30d'
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // requests per window
    message: 'Too many requests from this IP, please try again later'
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    uploadDir: path.join(__dirname, '../../uploads')
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: process.env.LOG_FILE || null
  },

  // Anki algorithm defaults
  anki: {
    defaultSettings: {
      learning_steps: [1, 10], // minutes
      graduating_interval: 1, // days
      easy_interval: 4, // days
      starting_ease: 2.50,
      easy_bonus: 1.30,
      interval_modifier: 1.00,
      maximum_interval: 36500, // ~100 years
      hard_interval_multiplier: 1.20,
      new_interval_percentage: 0.00,
      minimum_interval: 1, // days
      leech_threshold: 8,
      leech_action: 'suspend',
      new_cards_per_day: 20,
      maximum_reviews_per_day: 200,
      show_new_cards_first: true
    },
    
    // Card scheduling constraints
    constraints: {
      minEaseFactor: 1.30,
      maxEaseFactor: 5.00,
      minInterval: 1,
      maxInterval: 36500,
      maxLearningSteps: 10,
      maxLearningStepMinutes: 1440 // 24 hours
    }
  },

  // Session configuration
  session: {
    defaultLimits: {
      newCards: 20,
      reviewCards: 100,
      learningCards: 100,
      maxSessionDuration: 4 * 60 * 60, // 4 hours in seconds
      minSessionDuration: 60 // 1 minute
    },
    
    modes: ['timed', 'untimed', 'mixed'],
    
    // Auto-save session progress interval
    autoSaveInterval: 30 * 1000 // 30 seconds
  },

  // Progress tracking configuration
  progress: {
    streakCalculation: {
      minQuestionsForStreak: 5,
      streakResetHours: 24
    },
    
    analytics: {
      defaultPeriod: 30, // days
      maxPeriod: 365, // days
      granularities: ['daily', 'weekly', 'monthly']
    }
  },

  // Question configuration
  questions: {
    search: {
      minQueryLength: 3,
      maxResults: 50,
      highlightResults: true
    },
    
    pagination: {
      defaultLimit: 50,
      maxLimit: 200
    },
    
    // UPSC specific configuration
    upsc: {
      subjects: [
        'polity',
        'history',
        'geography',
        'economy',
        'environment',
        'science',
        'current_affairs'
      ],
      
      examTypes: ['prelims', 'mains'],
      difficulties: ['easy', 'medium', 'hard'],
      yearRange: {
        min: 1979,
        max: new Date().getFullYear() + 1
      }
    }
  },

  // Notification configuration
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED === 'true',
    
    // Push notification settings
    push: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
      vapidEmail: process.env.VAPID_EMAIL
    },
    
    // Email notification settings
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
      from: process.env.EMAIL_FROM || 'noreply@civilanki.com',
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    }
  },

  // Cache configuration
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB) || 0
    },
    
    // Cache TTL in seconds
    ttl: {
      questions: 60 * 60, // 1 hour
      subjects: 24 * 60 * 60, // 24 hours
      userStats: 5 * 60, // 5 minutes
      dueCards: 60 // 1 minute
    }
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    
    // Password requirements
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    
    // Session security
    session: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  },

  // API configuration
  api: {
    version: 'v1',
    prefix: '/api/v1',
    
    // Response configuration
    response: {
      includeTimestamp: true,
      includeRequestId: process.env.NODE_ENV === 'development'
    },
    
    // Pagination defaults
    pagination: {
      defaultLimit: 20,
      maxLimit: 100
    }
  },

  // Health check configuration
  health: {
    checks: {
      database: true,
      cache: false, // Enable when Redis is configured
      external: false // Enable for external API checks
    },
    
    timeout: 5000 // 5 seconds
  },

  // Development configuration
  development: {
    enableDebugRoutes: process.env.NODE_ENV === 'development',
    enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
    logQueries: process.env.LOG_QUERIES === 'true'
  }
};

// Validation function to ensure required config is present
const validateConfig = () => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Helper functions
const getConfig = (path) => {
  return path.split('.').reduce((obj, key) => obj && obj[key], config);
};

const isDevelopment = () => config.server.env === 'development';
const isProduction = () => config.server.env === 'production';
const isTesting = () => config.server.env === 'test';

// Export configuration
module.exports = {
  ...config,
  validateConfig,
  getConfig,
  isDevelopment,
  isProduction,
  isTesting
};