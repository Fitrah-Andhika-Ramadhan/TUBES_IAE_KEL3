const { gql } = require('apollo-server-express');

// Shared GraphQL types for all domains
const commonTypeDefs = gql`
  enum SortOrder {
    ASC
    DESC
  }

  input PaginationInput {
    page: Int
    limit: Int
  }

  type PaginationInfo {
    totalItems: Int
    totalPages: Int
    currentPage: Int
    pageSize: Int
    hasNextPage: Boolean
    hasPrevPage: Boolean
  }
`;

module.exports = { typeDefs: commonTypeDefs };
