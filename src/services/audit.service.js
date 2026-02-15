/**
 * Audit Service
 * @description Track and log all entity changes for compliance
 */

const { logger } = require('../utils/logger');

class AuditService {
  /**
   * Log entity creation
   */
  async logCreate(entity, userId) {
    const auditEntry = {
      action: 'CREATE',
      entityId: entity._id,
      entityName: entity.name,
      userId,
      timestamp: new Date(),
      changes: {
        new: this.sanitizeEntity(entity)
      }
    };

    logger.info('Audit: Entity created', auditEntry);
    return this.saveAuditLog(auditEntry);
  }

  /**
   * Log entity update
   */
  async logUpdate(entityId, previousState, newState, userId) {
    const changes = this.getChanges(previousState, newState);

    if (Object.keys(changes).length === 0) {
      return null;
    }

    const auditEntry = {
      action: 'UPDATE',
      entityId,
      entityName: newState.name,
      userId,
      timestamp: new Date(),
      changes
    };

    logger.info('Audit: Entity updated', auditEntry);
    return this.saveAuditLog(auditEntry);
  }

  /**
   * Log entity deletion
   */
  async logDelete(entity, userId) {
    const auditEntry = {
      action: 'DELETE',
      entityId: entity._id,
      entityName: entity.name,
      userId,
      timestamp: new Date(),
      changes: {
        deleted: this.sanitizeEntity(entity)
      }
    };

    logger.info('Audit: Entity deleted', auditEntry);
    return this.saveAuditLog(auditEntry);
  }

  /**
   * Log status change
   */
  async logStatusChange(entity, previousStatus, newStatus, userId) {
    const auditEntry = {
      action: 'STATUS_CHANGE',
      entityId: entity._id,
      entityName: entity.name,
      userId,
      timestamp: new Date(),
      changes: {
        status: { from: previousStatus, to: newStatus }
      }
    };

    logger.info('Audit: Entity status changed', auditEntry);
    return this.saveAuditLog(auditEntry);
  }

  /**
   * Get audit history for an entity
   */
  async getEntityAuditHistory(entityId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    // In production, this would query an audit log collection
    logger.info(`Fetching audit history for entity ${entityId}`);

    return {
      entityId,
      entries: [],
      total: 0,
      limit,
      offset
    };
  }

  /**
   * Get changes between two states
   */
  getChanges(previous, current) {
    const changes = {};
    const fields = new Set([...Object.keys(previous), ...Object.keys(current)]);

    fields.forEach(field => {
      if (field.startsWith('_') || field === 'updatedAt') return;

      const prevValue = JSON.stringify(previous[field]);
      const currValue = JSON.stringify(current[field]);

      if (prevValue !== currValue) {
        changes[field] = {
          from: previous[field],
          to: current[field]
        };
      }
    });

    return changes;
  }

  /**
   * Sanitize entity for logging (remove sensitive data)
   */
  sanitizeEntity(entity) {
    const sanitized = { ...entity };
    delete sanitized.password;
    delete sanitized.__v;
    return sanitized;
  }

  /**
   * Save audit log entry
   */
  async saveAuditLog(entry) {
    // In production, save to audit log collection
    return entry;
  }
}

module.exports = new AuditService();
