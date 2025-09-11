const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateCreator = [
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Must be a valid phone number'),
  
  body('audience_size')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Audience size must be a positive integer'),
  
  body('engagement_rate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Engagement rate must be between 0 and 100'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean'),
  
  handleValidationErrors
];

const validateInteraction = [
  body('interaction_type')
    .notEmpty()
    .withMessage('Interaction type is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Interaction type must be between 2 and 50 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  body('potential_fit_score')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Potential fit score must be between 1 and 10'),
  
  handleValidationErrors
];

module.exports = {
  validateCreator,
  validateInteraction,
  handleValidationErrors
};