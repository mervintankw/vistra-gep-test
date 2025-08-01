/**
 * Entity API Integration Tests
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Entity = require('../../src/models/Entity');
const User = require('../../src/models/User');
const AuthService = require('../../src/services/auth.service');

describe('Entity API', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');

    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin'
    });

    const { accessToken } = AuthService.generateTokens(testUser);
    authToken = accessToken;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Entity.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Entity.deleteMany({});
  });

  describe('POST /api/v1/entities', () => {
    it('should create a new entity', async () => {
      const entityData = {
        name: 'Test Corp',
        legalName: 'Test Corporation Ltd',
        entityType: 'corporation',
        jurisdiction: 'Singapore',
        registeredAddress: {
          street: '123 Test Street',
          city: 'Singapore',
          country: 'Singapore',
          postalCode: '123456'
        }
      };

      const response = await request(app)
        .post('/api/v1/entities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entityData)
        .expect(201);

      expect(response.body.name).toBe(entityData.name);
      expect(response.body.status).toBe('pending');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/entities')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('GET /api/v1/entities', () => {
    beforeEach(async () => {
      await Entity.create([
        {
          name: 'Entity A',
          legalName: 'Entity A Ltd',
          entityType: 'corporation',
          jurisdiction: 'Singapore',
          status: 'active'
        },
        {
          name: 'Entity B',
          legalName: 'Entity B Ltd',
          entityType: 'llc',
          jurisdiction: 'Hong Kong',
          status: 'active'
        },
        {
          name: 'Entity C',
          legalName: 'Entity C Ltd',
          entityType: 'corporation',
          jurisdiction: 'Singapore',
          status: 'inactive'
        }
      ]);
    });

    it('should return paginated entities', async () => {
      const response = await request(app)
        .get('/api/v1/entities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by jurisdiction', async () => {
      const response = await request(app)
        .get('/api/v1/entities?jurisdiction=Singapore')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach(entity => {
        expect(entity.jurisdiction).toBe('Singapore');
      });
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/entities?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach(entity => {
        expect(entity.status).toBe('active');
      });
    });
  });

  describe('GET /api/v1/entities/:id', () => {
    it('should return entity by ID', async () => {
      const entity = await Entity.create({
        name: 'Test Entity',
        legalName: 'Test Entity Ltd',
        entityType: 'corporation',
        jurisdiction: 'Singapore'
      });

      const response = await request(app)
        .get(`/api/v1/entities/${entity._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.name).toBe('Test Entity');
    });

    it('should return 404 for non-existent entity', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/api/v1/entities/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/v1/entities/:id', () => {
    it('should update entity', async () => {
      const entity = await Entity.create({
        name: 'Original Name',
        legalName: 'Original Name Ltd',
        entityType: 'corporation',
        jurisdiction: 'Singapore'
      });

      const response = await request(app)
        .put(`/api/v1/entities/${entity._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });
  });
});
