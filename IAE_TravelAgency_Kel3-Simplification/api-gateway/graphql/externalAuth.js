const { gql } = require('apollo-server-express');
const axios = require('axios');

const EXTERNAL_USER_SERVICE_URL = 'http://localhost:4001/graphql';

const typeDefs = gql`
  type ExternalLoginStatus {
    success: Boolean!
    message: String!
    # We could add user details here later if needed for the demo
    # user_id: ID
    # email: String
    # name: String
  }

  extend type Mutation {
    loginWithSimpleExternalService(email: String!, password: String!): ExternalLoginStatus
  }
`;

const resolvers = {
  Mutation: {
    loginWithSimpleExternalService: async (_, { email, password }) => {
      if (!EXTERNAL_USER_SERVICE_URL) {
        console.error('EXTERNAL_USER_SERVICE_URL is not defined in environment variables.');
        return {
          success: false,
          message: 'External user service configuration error.',
        };
      }

      try {
        // GraphQL query to fetch all users from the external service
        const query = `
          query GetAllUsers {
            users {
              user_id
              name
              email
              password
            }
          }
        `;

        const response = await axios.post(EXTERNAL_USER_SERVICE_URL, {
          query: query,
        });

        if (response.data.errors) {
          console.error('Error from external user service:', response.data.errors);
          return {
            success: false,
            message: 'Error fetching users from external service.',
          };
        }

        const users = response.data.data.users;
        if (!users || !Array.isArray(users)) {
          console.error('Unexpected response format from external user service:', response.data);
          return {
            success: false,
            message: 'Invalid user data from external service.',
          };
        }

        const foundUser = users.find(user => user.email === email);

        if (!foundUser) {
          return {
            success: false,
            message: 'Email not found.',
          };
        }

        // Direct password comparison (as per demo requirement)
        if (foundUser.password === password) {
          return {
            success: true,
            message: 'Login successful!',
            // user_id: foundUser.user_id, // Optional: return user details
            // email: foundUser.email,
            // name: foundUser.name,
          };
        } else {
          return {
            success: false,
            message: 'Invalid password.',
          };
        }
      } catch (error) {
        console.error('Error connecting to external user service:', error.message);
        // Check for specific axios errors if needed (e.g., error.response, error.request)
        if (error.code === 'ECONNREFUSED') {
            return {
                success: false,
                message: `Connection refused to external user service at ${EXTERNAL_USER_SERVICE_URL}. Please ensure it's running and accessible.`
            };
        }
        return {
          success: false,
          message: 'Could not connect to external user service.',
        };
      }
    },
  },
};

module.exports = { typeDefs, resolvers };
