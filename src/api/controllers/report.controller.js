/**
 * Report Controller
 * @description Handle report generation requests
 */

const ReportService = require('../../services/report.service');
const CacheService = require('../../services/cache.service');
const { logger } = require('../../utils/logger');

class ReportController {
  /**
   * Get entity summary by jurisdiction
   */
  async getEntitySummary(req, res, next) {
    try {
      const cacheKey = CacheService.generateKey('report', 'entity-summary');

      const report = await CacheService.remember(
        cacheKey,
        300, // 5 minutes
        () => ReportService.generateEntitySummary(req.query)
      );

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get compliance status report
   */
  async getComplianceReport(req, res, next) {
    try {
      const report = await ReportService.generateComplianceReport();

      logger.info(`Compliance report requested by ${req.user.email}`);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get entity type distribution
   */
  async getTypeDistribution(req, res, next) {
    try {
      const cacheKey = 'report:type-distribution';

      const report = await CacheService.remember(
        cacheKey,
        600, // 10 minutes
        () => ReportService.generateTypeDistribution()
      );

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ownership structure report
   */
  async getOwnershipReport(req, res, next) {
    try {
      const { entityId } = req.params;
      const report = await ReportService.generateOwnershipReport(entityId);

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export report as file
   */
  async exportReport(req, res, next) {
    try {
      const { reportType, format, filters } = req.body;

      // Generate report data
      let data;
      switch (reportType) {
        case 'entity-summary':
          data = await ReportService.generateEntitySummary(filters);
          break;
        case 'compliance':
          data = await ReportService.generateComplianceReport();
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Convert to requested format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${reportType}-${Date.now()}.csv`);
        // TODO: Implement CSV conversion
        res.send(this.convertToCSV(data));
      } else {
        res.json(data);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(req, res, next) {
    try {
      const cacheKey = 'dashboard:stats';

      const stats = await CacheService.remember(
        cacheKey,
        60, // 1 minute
        async () => {
          const Entity = require('../../models/Entity');

          const [total, statusCounts] = await Promise.all([
            Entity.countDocuments(),
            Entity.aggregate([
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
          ]);

          const statusMap = statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {});

          return {
            totalEntities: total,
            activeEntities: statusMap.active || 0,
            pendingEntities: statusMap.pending || 0,
            inactiveEntities: statusMap.inactive || 0,
            complianceAlerts: await this.getComplianceAlertCount()
          };
        }
      );

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get count of compliance alerts
   */
  async getComplianceAlertCount() {
    const Entity = require('../../models/Entity');
    return Entity.countDocuments({
      status: 'active',
      'compliance.filingStatus': 'overdue'
    });
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    // Simple CSV conversion
    if (!data.data || !Array.isArray(data.data)) {
      return '';
    }

    const headers = Object.keys(data.data[0] || {});
    const rows = data.data.map(row =>
      headers.map(h => JSON.stringify(row[h] || '')).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }
}

module.exports = new ReportController();
