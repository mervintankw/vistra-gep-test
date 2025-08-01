/**
 * Pagination Utility
 * @description Helper functions for paginated queries
 */

/**
 * Paginate a Mongoose query
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query conditions
 * @param {Object} options - Pagination options
 */
const paginate = async (model, query = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  const [data, total] = await Promise.all([
    model.find(query).sort(sort).skip(skip).limit(limit).lean(),
    model.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Build sort object from query string
 * @param {string} sortString - Sort query (e.g., "-createdAt,name")
 */
const buildSort = (sortString) => {
  if (!sortString) return { createdAt: -1 };

  const sort = {};
  const fields = sortString.split(',');

  fields.forEach(field => {
    if (field.startsWith('-')) {
      sort[field.substring(1)] = -1;
    } else {
      sort[field] = 1;
    }
  });

  return sort;
};

/**
 * Build filter object from query parameters
 * @param {Object} queryParams - Request query parameters
 * @param {Array} allowedFields - Fields that can be filtered
 */
const buildFilter = (queryParams, allowedFields = []) => {
  const filter = {};

  allowedFields.forEach(field => {
    if (queryParams[field] !== undefined) {
      filter[field] = queryParams[field];
    }
  });

  // Handle search
  if (queryParams.search && queryParams.searchFields) {
    const searchFields = queryParams.searchFields.split(',');
    filter.$or = searchFields.map(field => ({
      [field]: { $regex: queryParams.search, $options: 'i' }
    }));
  }

  return filter;
};

module.exports = { paginate, buildSort, buildFilter };
