/**
 * Auth Service Unit Tests
 */

const AuthService = require('../../src/services/auth.service');
const User = require('../../src/models/User');
const { AppError } = require('../../src/utils/errors');

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('../../src/utils/logger');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'user123',
        ...userData,
        role: 'user'
      });

      const result = await AuthService.register(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await expect(
        AuthService.register({ email: 'existing@example.com' })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);

      const result = await AuthService.login('test@example.com', 'password123');

      expect(result.user._id).toBe('user123');
      expect(result.accessToken).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error with invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        AuthService.login('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for deactivated user', async () => {
      const mockUser = {
        email: 'test@example.com',
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

      await expect(
        AuthService.login('test@example.com', 'password123')
      ).rejects.toThrow('Account is deactivated');
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const mockUser = { _id: 'user123', role: 'user' };

      const tokens = AuthService.generateTokens(mockUser);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockUser = { _id: 'user123', role: 'user' };
      const { accessToken } = AuthService.generateTokens(mockUser);

      const decoded = AuthService.verifyToken(accessToken);

      expect(decoded.userId).toBe('user123');
      expect(decoded.role).toBe('user');
    });

    it('should throw error for invalid token', () => {
      expect(() => AuthService.verifyToken('invalid-token')).toThrow(
        'Invalid or expired token'
      );
    });
  });
});
