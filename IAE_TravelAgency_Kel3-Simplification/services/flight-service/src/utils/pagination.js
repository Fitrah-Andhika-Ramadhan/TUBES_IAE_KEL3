function paginateQuery(baseQuery, pagination = {}) {
  const page = parseInt(pagination.page, 10) || 1;
  const limit = parseInt(pagination.limit, 10) || 10;
  const offset = (page - 1) * limit;
  return {
    sql: `${baseQuery} LIMIT ? OFFSET ?`,
    values: [limit, offset],
    pagination: { page, limit }
  };
}

const paginatedResponse = (data, pagination, totalItems) => {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(totalItems / limit);
  return {
    data,
    pagination: {
      total_items: totalItems,
      total_pages: totalPages,
      current_page: page,
      items_per_page: limit,
      has_next_page: page < totalPages,
      has_prev_page: page > 1
    }
  };
};

module.exports = {
  paginateQuery,
  paginatedResponse
};
