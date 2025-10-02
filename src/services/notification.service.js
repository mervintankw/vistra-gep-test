/**
 * Notification Service
 * @description Handle email and in-app notifications
 */

const { logger } = require('../utils/logger');

class NotificationService {
  constructor() {
    this.emailQueue = [];
  }

  /**
   * Send email notification
   */
  async sendEmail(options) {
    const { to, subject, template, data } = options;

    try {
      // In production, this would use a proper email service
      logger.info(`Sending email to ${to}: ${subject}`);

      // Queue the email
      this.emailQueue.push({
        to,
        subject,
        template,
        data,
        createdAt: new Date(),
        status: 'pending'
      });

      return { success: true, messageId: `msg_${Date.now()}` };
    } catch (error) {
      logger.error('Email send failed:', error);
      throw error;
    }
  }

  /**
   * Send compliance alert notification
   */
  async sendComplianceAlert(entity, alertType) {
    const templates = {
      overdue: {
        subject: `Compliance Alert: ${entity.name} Filing Overdue`,
        template: 'compliance-overdue'
      },
      due_soon: {
        subject: `Reminder: ${entity.name} Filing Due Soon`,
        template: 'compliance-reminder'
      },
      audit_due: {
        subject: `Audit Due: ${entity.name}`,
        template: 'audit-reminder'
      }
    };

    const config = templates[alertType];
    if (!config) {
      throw new Error(`Unknown alert type: ${alertType}`);
    }

    // Get stakeholders for this entity
    const recipients = await this.getEntityStakeholders(entity._id);

    const notifications = recipients.map(recipient =>
      this.sendEmail({
        to: recipient.email,
        subject: config.subject,
        template: config.template,
        data: {
          entityName: entity.name,
          jurisdiction: entity.jurisdiction,
          dueDate: entity.compliance?.nextAuditDue
        }
      })
    );

    return Promise.all(notifications);
  }

  /**
   * Get stakeholders for an entity
   */
  async getEntityStakeholders(entityId) {
    // In production, this would query the database
    return [
      { email: 'admin@vistra.com', role: 'admin' }
    ];
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Vistra GEP',
      template: 'welcome',
      data: {
        firstName: user.firstName,
        loginUrl: process.env.FRONTEND_URL
      }
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetUrl,
        expiresIn: '1 hour'
      }
    });
  }

  /**
   * Create in-app notification
   */
  async createInAppNotification(userId, notification) {
    const { title, message, type, link } = notification;

    logger.info(`Creating notification for user ${userId}: ${title}`);

    return {
      id: `notif_${Date.now()}`,
      userId,
      title,
      message,
      type,
      link,
      read: false,
      createdAt: new Date()
    };
  }
}

module.exports = new NotificationService();
