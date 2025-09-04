const Joi = require('joi');

// Custom validation functions
const validateUUID = (value, helpers) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const validateMobileNumber = (value, helpers) => {
  const mobileRegex = /^\+91[6-9][0-9]{9}$/;
  if (!mobileRegex.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Base schemas
const baseSchemas = {
  uuid: Joi.string().custom(validateUUID, 'UUID validation').required(),
  optionalUuid: Joi.string().custom(validateUUID, 'UUID validation').optional(),
  mobileNumber: Joi.string().custom(validateMobileNumber, 'Mobile number validation'),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().min(2).max(100).trim(),
  year: Joi.number().integer().min(1979).max(new Date().getFullYear() + 1),
  percentage: Joi.number().min(0).max(100),
  positiveInteger: Joi.number().integer().min(1),
  nonNegativeInteger: Joi.number().integer().min(0)
};

// Card-related schemas
const cardSchemas = {
  answerCard: Joi.object({
    card_id: baseSchemas.uuid,
    grade: Joi.string().valid('again', 'hard', 'good', 'easy').required(),
    selected_option: Joi.string().valid('a', 'b', 'c', 'd').required(),
    response_time_seconds: Joi.number().min(0).max(3600).optional(),
    session_id: baseSchemas.optionalUuid
  }),

  getDueCards: Joi.object({
    new_cards_limit: Joi.number().integer().min(1).max(200).default(20),
    review_cards_limit: Joi.number().integer().min(1).max(500).default(100),
    learning_cards_limit: Joi.number().integer().min(1).max(200).default(100),
    subjects: Joi.array().items(baseSchemas.uuid).optional(),
    subtopics: Joi.array().items(baseSchemas.uuid).optional(),
    years: Joi.array().items(baseSchemas.year).optional()
  }),

  suspendCard: Joi.object({
    reason: Joi.string().max(500).optional()
  })
};

// Session-related schemas
const sessionSchemas = {
  startSession: Joi.object({
    subjects: Joi.array().items(baseSchemas.uuid).min(1).optional(),
    subtopics: Joi.array().items(baseSchemas.uuid).min(1).optional(),
    year_ranges: Joi.array().items(baseSchemas.year).min(1).optional(),
    mode: Joi.string().valid('timed', 'untimed', 'mixed').default('mixed'),
    target_cards: Joi.number().integer().min(1).max(200).optional(),
    estimated_duration_minutes: Joi.number().integer().min(5).max(480).optional()
  }).or('subjects', 'subtopics', 'year_ranges'), // At least one filter must be provided

  endSession: Joi.object({
    total_cards: baseSchemas.nonNegativeInteger.required(),
    correct_answers: baseSchemas.nonNegativeInteger.required(),
    incorrect_answers: baseSchemas.nonNegativeInteger.required(),
    accuracy: baseSchemas.percentage.required(),
    total_time: baseSchemas.nonNegativeInteger.required(),
    average_time: Joi.number().min(0).required(),
    new_cards_studied: baseSchemas.nonNegativeInteger.default(0),
    learning_cards_studied: baseSchemas.nonNegativeInteger.default(0),
    review_cards_studied: baseSchemas.nonNegativeInteger.default(0)
  }),

  updateSession: Joi.object({
    cards_completed: baseSchemas.nonNegativeInteger.optional(),
    current_accuracy: baseSchemas.percentage.optional(),
    time_spent: baseSchemas.nonNegativeInteger.optional()
  })
};

// User and profile schemas
const userSchemas = {
  updateProfile: Joi.object({
    full_name: baseSchemas.name.optional(),
    mobile_number: baseSchemas.mobileNumber.optional(),
    daily_goal: Joi.number().integer().min(5).max(200).optional(),
    timezone: Joi.string().max(50).optional(),
    theme_preference: Joi.string().valid('light', 'dark').optional(),
    language_preference: Joi.string().valid('en', 'hi').optional()
  }),

  updateMobileNumber: Joi.object({
    mobile_number: baseSchemas.mobileNumber.required()
  }),

  registerUser: Joi.object({
    email: baseSchemas.email,
    password: baseSchemas.password,
    full_name: baseSchemas.name.required(),
    mobile_number: baseSchemas.mobileNumber.optional()
  }),

  loginUser: Joi.object({
    email: baseSchemas.email,
    password: baseSchemas.password
  })
};

// Settings schemas
const settingsSchemas = {
  updateAnkiSettings: Joi.object({
    learning_steps: Joi.array()
      .items(Joi.number().integer().min(1).max(1440))
      .min(1)
      .max(10)
      .optional(),
    graduating_interval: Joi.number().integer().min(1).max(30).optional(),
    easy_interval: Joi.number().integer().min(2).max(30).optional(),
    starting_ease: Joi.number().min(1.30).max(3.00).optional(),
    easy_bonus: Joi.number().min(1.10).max(2.00).optional(),
    interval_modifier: Joi.number().min(0.50).max(2.00).optional(),
    maximum_interval: Joi.number().integer().min(30).max(36500).optional(),
    hard_interval_multiplier: Joi.number().min(1.00).max(2.00).optional(),
    new_interval_percentage: Joi.number().min(0.00).max(1.00).optional(),
    minimum_interval: Joi.number().integer().min(1).max(30).optional(),
    leech_threshold: Joi.number().integer().min(3).max(20).optional(),
    leech_action: Joi.string().valid('suspend', 'tag', 'bury').optional(),
    new_cards_per_day: Joi.number().integer().min(1).max(500).optional(),
    maximum_reviews_per_day: Joi.number().integer().min(10).max(1000).optional(),
    show_new_cards_first: Joi.boolean().optional()
  }),

  updateNotificationSettings: Joi.object({
    daily_reminders: Joi.boolean().optional(),
    review_reminders: Joi.boolean().optional(),
    streak_reminders: Joi.boolean().optional(),
    reminder_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
    notification_sound: Joi.boolean().optional()
  })
};

// Question-related schemas
const questionSchemas = {
  getQuestions: Joi.object({
    subject_id: baseSchemas.optionalUuid,
    subtopic_id: baseSchemas.optionalUuid,
    year: baseSchemas.year.optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: baseSchemas.nonNegativeInteger.default(0),
    sort_by: Joi.string().valid('year', 'difficulty', 'accuracy', 'created_at').default('year'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  searchQuestions: Joi.object({
    q: Joi.string().min(3).max(200).required(),
    subject_id: baseSchemas.optionalUuid,
    year_from: baseSchemas.year.optional(),
    year_to: baseSchemas.year.optional(),
    limit: Joi.number().integer().min(1).max(50).default(20)
  }),

  createQuestion: Joi.object({
    subject_id: baseSchemas.uuid,
    subtopic_id: baseSchemas.uuid,
    question_text: Joi.string().min(10).max(2000).required(),
    question_image_url: Joi.string().uri().optional(),
    option_a: Joi.string().min(1).max(500).required(),
    option_b: Joi.string().min(1).max(500).required(),
    option_c: Joi.string().min(1).max(500).required(),
    option_d: Joi.string().min(1).max(500).required(),
    correct_option: Joi.string().valid('a', 'b', 'c', 'd').required(),
    explanation: Joi.string().min(10).max(2000).required(),
    year: baseSchemas.year.required(),
    exam_type: Joi.string().valid('prelims', 'mains').default('prelims'),
    paper_number: Joi.number().integer().min(1).max(2).default(1),
    question_number: Joi.number().integer().min(1).max(200).optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
    estimated_time_seconds: Joi.number().integer().min(30).max(600).default(120),
    source: Joi.string().max(200).optional()
  })
};

// Progress and analytics schemas
const progressSchemas = {
  getAnalytics: Joi.object({
    period: Joi.number().integer().min(1).max(365).default(30),
    subject_id: baseSchemas.optionalUuid,
    subtopic_id: baseSchemas.optionalUuid,
    granularity: Joi.string().valid('daily', 'weekly', 'monthly').default('daily')
  }),

  getProgress: Joi.object({
    subject_id: baseSchemas.optionalUuid,
    include_subtopics: Joi.boolean().default(true),
    include_stats: Joi.boolean().default(true)
  })
};

// Combined schemas object
const schemas = {
  // Card schemas
  ...cardSchemas,
  
  // Session schemas
  ...sessionSchemas,
  
  // User schemas
  ...userSchemas,
  
  // Settings schemas
  ...settingsSchemas,
  
  // Question schemas
  ...questionSchemas,
  
  // Progress schemas
  ...progressSchemas
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }
    
    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errorDetails
      });
    }
    
    req.query = value;
    next();
  };
};

// Parameter validation
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Parameter validation failed',
        details: errorDetails
      });
    }
    
    req.params = value;
    next();
  };
};

// Custom validators for specific use cases
const customValidators = {
  // Validate that end date is after start date
  dateRange: (startDate, endDate) => {
    return new Date(endDate) > new Date(startDate);
  },
  
  // Validate that array contains unique values
  uniqueArray: (arr) => {
    return arr.length === new Set(arr).size;
  },
  
  // Validate session duration makes sense
  sessionDuration: (startTime, endTime, minDuration = 60) => {
    const duration = (new Date(endTime) - new Date(startTime)) / 1000;
    return duration >= minDuration && duration <= 86400; // Max 24 hours
  },
  
  // Validate accuracy calculation
  accuracyCalculation: (correct, total, calculatedAccuracy) => {
    if (total === 0) return calculatedAccuracy === 0;
    const expectedAccuracy = Math.round((correct / total) * 100);
    return Math.abs(expectedAccuracy - calculatedAccuracy) <= 1; // Allow 1% tolerance for rounding
  }
};

module.exports = {
  schemas,
  validate,
  validateQuery,
  validateParams,
  customValidators,
  baseSchemas
};