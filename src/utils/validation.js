/**
 * Validation Utilities
 * @description Common validation functions
 */

const mongoose = require('mongoose');
const { ENTITY_TYPES, ENTITY_STATUS, JURISDICTIONS } = require('../config/constants');

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate entity type
 */
const isValidEntityType = (type) => {
  return ENTITY_TYPES.includes(type);
};

/**
 * Validate entity status
 */
const isValidStatus = (status) => {
  return Object.values(ENTITY_STATUS).includes(status);
};

/**
 * Validate jurisdiction
 */
const isValidJurisdiction = (jurisdiction) => {
  return JURISDICTIONS.includes(jurisdiction);
};

/**
 * Validate date format (ISO 8601)
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate password strength
 */
const isStrongPassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongRegex.test(password);
};

/**
 * Sanitize string for safe database storage
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate pagination parameters
 */
const validatePagination = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { page: validPage, limit: validLimit };
};

/**
 * Validate sort string format
 */
const isValidSortString = (sortString) => {
  if (!sortString) return true;
  const sortPattern = /^-?[a-zA-Z_]+(?:,-?[a-zA-Z_]+)*$/;
  return sortPattern.test(sortString);
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidEntityType,
  isValidStatus,
  isValidJurisdiction,
  isValidDate,
  isStrongPassword,
  sanitizeString,
  validatePagination,
  isValidSortString
};
