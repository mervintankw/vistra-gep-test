/**
 * Report Service
 * @description Generate various reports for entities
 */

const Entity = require('../models/Entity');
const { logger } = require('../utils/logger');

class ReportService {
  /**
   * Generate entity summary report
   */
  async generateEntitySummary(filters = {}) {
    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: '$jurisdiction',
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ];

    const data = await Entity.aggregate(pipeline);

    return {
      generatedAt: new Date(),
      type: 'entity-summary',
      data
    };
  }

  /**
   * Generate compliance status report
   */
  async generateComplianceReport(options = {}) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const pipeline = [
      { $match: { status: 'active' } },
      {
        $facet: {
          overdue: [
            { $match: { 'compliance.filingStatus': 'overdue' } },
            { $project: { name: 1, jurisdiction: 1, compliance: 1 } },
            { $limit: 100 }
          ],
          dueSoon: [
            {
              $match: {
                'compliance.nextAuditDue': {
                  $gte: now,
                  $lte: thirtyDaysFromNow
                }
              }
            },
            { $project: { name: 1, jurisdiction: 1, compliance: 1 } },
            { $limit: 100 }
          ],
          upcoming: [
            {
              $match: {
                'compliance.nextAuditDue': {
                  $gt: thirtyDaysFromNow,
                  $lte: sixtyDaysFromNow
                }
              }
            },
            { $project: { name: 1, jurisdiction: 1, compliance: 1 } },
            { $limit: 100 }
          ],
          stats: [
            {
              $group: {
                _id: '$compliance.filingStatus',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ];

    const [result] = await Entity.aggregate(pipeline);

    logger.info('Compliance report generated');

    return {
      generatedAt: new Date(),
      type: 'compliance-report',
      data: result
    };
  }

  /**
   * Generate entity type distribution report
   */
  async generateTypeDistribution() {
    const pipeline = [
      {
        $group: {
          _id: '$entityType',
          count: { $sum: 1 },
          jurisdictions: { $addToSet: '$jurisdiction' }
        }
      },
      {
        $project: {
          entityType: '$_id',
          count: 1,
          jurisdictionCount: { $size: '$jurisdictions' },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ];

    const data = await Entity.aggregate(pipeline);

    return {
      generatedAt: new Date(),
      type: 'type-distribution',
      data
    };
  }

  /**
   * Generate ownership structure report
   */
  async generateOwnershipReport(rootEntityId) {
    const buildOwnershipTree = async (entityId, depth = 0) => {
      if (depth > 10) return null;

      const entity = await Entity.findById(entityId)
        .select('name legalName entityType jurisdiction owners')
        .populate('owners', 'name legalName entityType')
        .lean();

      if (!entity) return null;

      const subsidiaries = await Entity.find({ parentEntity: entityId })
        .select('name legalName entityType jurisdiction')
        .lean();

      return {
        ...entity,
        subsidiaries: await Promise.all(
          subsidiaries.map(sub => buildOwnershipTree(sub._id, depth + 1))
        )
      };
    };

    const data = await buildOwnershipTree(rootEntityId);

    return {
      generatedAt: new Date(),
      type: 'ownership-structure',
      data
    };
  }
}

module.exports = new ReportService();
