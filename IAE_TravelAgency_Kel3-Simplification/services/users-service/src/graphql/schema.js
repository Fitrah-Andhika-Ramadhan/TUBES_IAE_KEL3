const { gql } = require('apollo-server-express');
const User = require('../models/User');

// GraphQL Schema Definition Language (SDL)
const typeDefs = gql`
  type User {
    id: ID
    email: String
    full_name: String
    phone_number: String
    birth_date: String
    no_nik: String
    address: String
    kelurahan: String
    kecamatan: String
    kabupaten_kota: String
    province: String
    postal_code: String
    created_at: String
  }

  type Query {
    userByEmail(email: String!): User
    users: [User]
  }
`;

// Resolvers
const resolvers = {
  Query: {
    userByEmail: async (_, { email }) => {
      try {
        const user = await User.getByEmail(email);
        if (!user) {
          return null;
        }
        // Ensure password is not returned
        const { password, ...userData } = user;
        return userData;
      } catch (error) {
        console.error('Error in userByEmail resolver:', error);
        throw new Error('Failed to fetch user data.');
      }
    },
    users: async () => {
      try {
        // Fetch all users, default to first 100 for safety
        const result = await User.listAll({ page: 1, limit: 100 });
        // Remove password field if present (shouldn't be in result, but for safety)
        return result.data.map(({ password, ...user }) => user);
      } catch (error) {
        console.error('Error in users resolver:', error);
        throw new Error('Failed to fetch users.');
      }
    },
  },
};

module.exports = { typeDefs, resolvers };

