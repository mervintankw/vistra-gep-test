/**
 * Entity Service
 * @description Business logic for entity management
 */

const Entity = require('../models/Entity');
const { logger } = require('../utils/logger');
const { AppError } = require('../utils/errors');
const { paginate } = require('../utils/pagination');

class EntityService {
  /**
   * Create a new entity
   */
  async createEntity(entityData, userId) {
    const entity = await Entity.create({
      ...entityData,
      createdBy: userId
    });

    logger.info(`Entity created: ${entity.name} by user ${userId}`);
    return entity;
  }

  /**
   * Get entity by ID with population
   */
  async getEntityById(entityId, options = {}) {
    const query = Entity.findById(entityId);

    if (options.populate) {
      query.populate('parentEntity', 'name legalName');
      query.populate('owners', 'name legalName');
    }

    const entity = await query.exec();
    if (!entity) {
      throw new AppError('Entity not found', 404);
    }

    return entity;
  }

  /**
   * Search and filter entities
   */
  async searchEntities(filters = {}, pagination = {}) {
    const query = {};

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }

    if (filters.entityType) {
      query.entityType = filters.entityType;
    }

    if (filters.jurisdiction) {
      query.jurisdiction = filters.jurisdiction;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.parentEntity) {
      query.parentEntity = filters.parentEntity;
    }

    const result = await paginate(Entity, query, pagination);
    return result;
  }

  /**
   * Update entity
   */
  async updateEntity(entityId, updateData, userId) {
    const entity = await Entity.findByIdAndUpdate(
      entityId,
      { ...updateData, updatedBy: userId },
      { new: true, runValidators: true }
    );

    if (!entity) {
      throw new AppError('Entity not found', 404);
    }

    logger.info(`Entity updated: ${entity.name} by user ${userId}`);
    return entity;
  }

  /**
   * Get entity hierarchy (tree structure)
   */
  async getEntityHierarchy(rootEntityId) {
    const buildTree = async (entityId, depth = 0, maxDepth = 10) => {
      if (depth >= maxDepth) return null;

      const entity = await Entity.findById(entityId)
        .select('name legalName entityType status')
        .lean();

      if (!entity) return null;

      const children = await Entity.find({ parentEntity: entityId })
        .select('_id')
        .lean();

      const childTrees = await Promise.all(
        children.map(child => buildTree(child._id, depth + 1, maxDepth))
      );

      return {
        ...entity,
        children: childTrees.filter(Boolean)
      };
    };

    return buildTree(rootEntityId);
  }

  /**
   * Get entities with compliance issues
   */
  async getComplianceAlerts(options = {}) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const query = {
      status: 'active',
      $or: [
        { 'compliance.filingStatus': 'overdue' },
        { 'compliance.nextAuditDue': { $lte: thirtyDaysFromNow } }
      ]
    };

    const entities = await Entity.find(query)
      .select('name jurisdiction compliance')
      .sort({ 'compliance.nextAuditDue': 1 })
      .limit(options.limit || 50);

    return entities;
  }
}

module.exports = new EntityService();
