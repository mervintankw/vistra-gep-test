/**
 * Auth Controller
 * @description Handle authentication HTTP requests
 */

const AuthService = require('../../services/auth.service');
const NotificationService = require('../../services/notification.service');
const { logger } = require('../../utils/logger');

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName
      });

      // Send welcome email
      await NotificationService.sendWelcomeEmail(result.user);

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        message: 'Registration successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      const tokens = await AuthService.refreshAccessToken(refreshToken);

      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req, res, next) {
    try {
      // In a production app, you might invalidate the token here
      logger.info(`User logged out: ${req.user?.email}`);

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const resetToken = await AuthService.createPasswordResetToken(email);

      if (resetToken) {
        const user = { email, firstName: 'User' };
        await NotificationService.sendPasswordResetEmail(user, resetToken);
      }

      // Always return success to prevent email enumeration
      res.json({
        message: 'If the email exists, a reset link will be sent'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      await AuthService.resetPassword(token, password);

      logger.info('Password reset successful');

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
