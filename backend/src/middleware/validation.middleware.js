const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        field: error.details[0].path[0]
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  answerCard: Joi.object({
    card_id: Joi.string().uuid().required(),
    grade: Joi.string().valid('again', 'hard', 'good', 'easy').required(),
    selected_option: Joi.string().valid('a', 'b', 'c', 'd').required(),
    response_time_seconds: Joi.number().min(0).max(3600).optional(),
    session_id: Joi.string().uuid().optional()
  }),

  startSession: Joi.object({
    subjects: Joi.array().items(Joi.string().uuid()).optional(),
    subtopics: Joi.array().items(Joi.string().uuid()).optional(),
    year_ranges: Joi.array().items(Joi.number().min(1979).max(2030)).optional(),
    mode: Joi.string().valid('timed', 'untimed', 'mixed').default('mixed'),
    target_cards: Joi.number().min(1).max(200).optional()
  }),

  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    mobile_number: Joi.string().pattern(/^\+91[6-9][0-9]{9}$/).optional(),
    daily_goal: Joi.number().min(5).max(200).optional(),
    theme_preference: Joi.string().valid('light', 'dark').optional(),
    language_preference: Joi.string().valid('en', 'hi').optional()
  }),

  updateSettings: Joi.object({
    learning_steps: Joi.array().items(Joi.number().min(1).max(1440)).min(1).max(10).optional(),
    graduating_interval: Joi.number().min(1).max(30).optional(),
    easy_interval: Joi.number().min(2).max(30).optional(),
    starting_ease: Joi.number().min(1.30).max(3.00).optional(),
    easy_bonus: Joi.number().min(1.10).max(2.00).optional(),
    hard_interval_multiplier: Joi.number().min(1.00).max(2.00).optional(),
    new_cards_per_day: Joi.number().min(1).max(500).optional(),
    maximum_reviews_per_day: Joi.number().min(10).max(1000).optional(),
    show_new_cards_first: Joi.boolean().optional()
  })
};

module.exports = { validate, schemas };