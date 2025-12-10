/**
 * Entity Service Unit Tests
 */

const EntityService = require('../../src/services/entity.service');
const Entity = require('../../src/models/Entity');
const { AppError } = require('../../src/utils/errors');

jest.mock('../../src/models/Entity');
jest.mock('../../src/utils/logger');

describe('EntityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEntity', () => {
    it('should create an entity successfully', async () => {
      const entityData = {
        name: 'Test Corp',
        legalName: 'Test Corporation Ltd',
        entityType: 'corporation',
        jurisdiction: 'Singapore'
      };

      Entity.create.mockResolvedValue({
        _id: 'entity123',
        ...entityData,
        status: 'pending'
      });

      const result = await EntityService.createEntity(entityData, 'user123');

      expect(result.name).toBe(entityData.name);
      expect(Entity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...entityData,
          createdBy: 'user123'
        })
      );
    });
  });

  describe('getEntityById', () => {
    it('should return entity when found', async () => {
      const mockEntity = {
        _id: 'entity123',
        name: 'Test Corp',
        jurisdiction: 'Singapore'
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEntity)
      };

      Entity.findById.mockReturnValue(mockQuery);

      const result = await EntityService.getEntityById('entity123');

      expect(result).toEqual(mockEntity);
    });

    it('should throw NotFound when entity does not exist', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      };

      Entity.findById.mockReturnValue(mockQuery);

      await expect(
        EntityService.getEntityById('nonexistent')
      ).rejects.toThrow('Entity not found');
    });
  });

  describe('searchEntities', () => {
    it('should return paginated results', async () => {
      const mockEntities = [
        { _id: '1', name: 'Entity A' },
        { _id: '2', name: 'Entity B' }
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockEntities)
      };

      Entity.find.mockReturnValue(mockQuery);
      Entity.countDocuments.mockResolvedValue(10);

      const result = await EntityService.searchEntities(
        { status: 'active' },
        { page: 1, limit: 2 }
      );

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(10);
    });

    it('should filter by name with regex', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Entity.find.mockReturnValue(mockQuery);
      Entity.countDocuments.mockResolvedValue(0);

      await EntityService.searchEntities({ name: 'Test' });

      expect(Entity.find).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.objectContaining({ $regex: 'Test' })
        })
      );
    });
  });

  describe('updateEntity', () => {
    it('should update entity successfully', async () => {
      const mockEntity = {
        _id: 'entity123',
        name: 'Updated Corp'
      };

      Entity.findByIdAndUpdate.mockResolvedValue(mockEntity);

      const result = await EntityService.updateEntity(
        'entity123',
        { name: 'Updated Corp' },
        'user123'
      );

      expect(result.name).toBe('Updated Corp');
    });

    it('should throw NotFound when updating non-existent entity', async () => {
      Entity.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        EntityService.updateEntity('nonexistent', {}, 'user123')
      ).rejects.toThrow('Entity not found');
    });
  });

  describe('getComplianceAlerts', () => {
    it('should return entities with compliance issues', async () => {
      const mockEntities = [
        { name: 'Entity A', compliance: { filingStatus: 'overdue' } }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockEntities)
      };

      Entity.find.mockReturnValue(mockQuery);

      const result = await EntityService.getComplianceAlerts();

      expect(result).toHaveLength(1);
      expect(Entity.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active'
        })
      );
    });
  });
});
