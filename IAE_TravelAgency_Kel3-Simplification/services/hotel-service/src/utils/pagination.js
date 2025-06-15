/**
 * Pagination utility for API endpoints
 */

/**
 * Apply pagination to a SQL query
 * 
 * @param {string} sql - The SQL query to paginate
 * @param {Object} params - The query parameters
 * @param {number} params.page - The page number (default: 1)
 * @param {number} params.limit - The number of items per page (default: 10)
 * @returns {Object} - The paginated SQL query and values for prepared statement
 */
const paginateQuery = (sql, params = {}) => {
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const offset = (page - 1) * limit;
  
  // Add pagination to the SQL query
  const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
  
  // Return the paginated SQL and values for the prepared statement
  return {
    sql: paginatedSql,
    values: [limit, offset],
    pagination: {
      page,
      limit,
      offset
    }
  };
};

/**
 * Format paginated response
 * 
 * @param {Array} data - The data to paginate
 * @param {Object} pagination - The pagination parameters
 * @param {number} pagination.page - The current page
 * @param {number} pagination.limit - The number of items per page
 * @param {number} totalItems - The total number of items
 * @returns {Object} - The paginated response
 */
const paginatedResponse = (data, pagination, totalItems) => {
  const totalPages = Math.ceil(totalItems / pagination.limit);
  return {
    data,
    pagination: {
      ...pagination,
      totalItems,
      totalPages
    }
  };
};

module.exports = {
  paginateQuery,
  paginatedResponse
};
