/**
 * Request Validators
 * @description Input validation middleware using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

/**
 * Handle validation errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    throw new ValidationError('Validation failed', errorMessages);
  }
  next();
};

/**
 * Login validation
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidation
];

/**
 * Registration validation
 */
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name too long'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name too long'),
  handleValidation
];

/**
 * Entity validation
 */
const validateEntity = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Entity name is required')
    .isLength({ max: 200 })
    .withMessage('Name too long'),
  body('legalName')
    .trim()
    .notEmpty()
    .withMessage('Legal name is required')
    .isLength({ max: 300 })
    .withMessage('Legal name too long'),
  body('entityType')
    .isIn(['corporation', 'llc', 'partnership', 'sole_proprietorship', 'trust', 'other'])
    .withMessage('Invalid entity type'),
  body('jurisdiction')
    .trim()
    .notEmpty()
    .withMessage('Jurisdiction is required'),
  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('taxId')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('registeredAddress.country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country required for registered address'),
  handleValidation
];

/**
 * Pagination validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidation
];

/**
 * MongoDB ObjectId validation
 */
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidation
];

module.exports = {
  validateLogin,
  validateRegister,
  validateEntity,
  validatePagination,
  validateObjectId,
  handleValidation
};
