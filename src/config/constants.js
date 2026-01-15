/**
 * Application Constants
 * @description Centralized configuration constants
 */

module.exports = {
  // Entity Types
  ENTITY_TYPES: [
    'corporation',
    'llc',
    'partnership',
    'sole_proprietorship',
    'trust',
    'other'
  ],

  // Entity Status
  ENTITY_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    DISSOLVED: 'dissolved'
  },

  // Compliance Status
  COMPLIANCE_STATUS: {
    CURRENT: 'current',
    OVERDUE: 'overdue',
    PENDING: 'pending'
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Cache TTL (seconds)
  CACHE_TTL: {
    SHORT: 60,          // 1 minute
    MEDIUM: 300,        // 5 minutes
    LONG: 3600,         // 1 hour
    DASHBOARD: 60,      // 1 minute
    REPORTS: 300        // 5 minutes
  },

  // Rate Limiting
  RATE_LIMITS: {
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
      MAX_REQUESTS: 5
    },
    API: {
      WINDOW_MS: 60 * 1000,       // 1 minute
      MAX_REQUESTS: 60
    }
  },

  // Compliance Thresholds (days)
  COMPLIANCE_THRESHOLDS: {
    URGENT: 7,
    WARNING: 30,
    UPCOMING: 60
  },

  // Supported Jurisdictions (sample list)
  JURISDICTIONS: [
    'Singapore',
    'Hong Kong',
    'United Kingdom',
    'United States - Delaware',
    'United States - Nevada',
    'British Virgin Islands',
    'Cayman Islands',
    'Netherlands',
    'Luxembourg',
    'Ireland'
  ],

  // File Export Formats
  EXPORT_FORMATS: {
    CSV: 'csv',
    EXCEL: 'xlsx',
    PDF: 'pdf',
    JSON: 'json'
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    COMPLIANCE_ALERT: 'compliance_alert',
    ENTITY_UPDATE: 'entity_update',
    USER_MENTION: 'user_mention',
    SYSTEM: 'system'
  }
};
