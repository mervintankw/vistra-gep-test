/**
 * Entity Controller
 * @description Handle HTTP requests for entity operations
 */

const EntityService = require('../../services/entity.service');
const { buildFilter, buildSort } = require('../../utils/pagination');
const { logger } = require('../../utils/logger');

class EntityController {
  /**
   * List entities with filtering and pagination
   */
  async list(req, res, next) {
    try {
      const filters = buildFilter(req.query, [
        'name',
        'entityType',
        'jurisdiction',
        'status',
        'parentEntity'
      ]);

      const pagination = {
        page: req.query.page,
        limit: req.query.limit,
        sort: buildSort(req.query.sort)
      };

      const result = await EntityService.searchEntities(filters, pagination);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single entity by ID
   */
  async getById(req, res, next) {
    try {
      const entity = await EntityService.getEntityById(req.params.id, {
        populate: req.query.populate === 'true'
      });
      res.json(entity);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new entity
   */
  async create(req, res, next) {
    try {
      const entity = await EntityService.createEntity(req.body, req.user._id);
      logger.info(`Entity created: ${entity.name} by ${req.user.email}`);
      res.status(201).json(entity);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update existing entity
   */
  async update(req, res, next) {
    try {
      const entity = await EntityService.updateEntity(
        req.params.id,
        req.body,
        req.user._id
      );
      res.json(entity);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete entity
   */
  async delete(req, res, next) {
    try {
      await EntityService.deleteEntity(req.params.id, req.user._id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get entity hierarchy
   */
  async getHierarchy(req, res, next) {
    try {
      const hierarchy = await EntityService.getEntityHierarchy(req.params.id);
      res.json(hierarchy);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get compliance alerts
   */
  async getComplianceAlerts(req, res, next) {
    try {
      const alerts = await EntityService.getComplianceAlerts({
        limit: parseInt(req.query.limit) || 50
      });
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EntityController();
