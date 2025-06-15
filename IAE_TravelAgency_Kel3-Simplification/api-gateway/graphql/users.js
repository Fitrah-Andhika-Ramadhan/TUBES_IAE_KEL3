// GraphQL schema and resolvers for Users Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String
    phone: String
    created_at: String
  }
  type AuthPayload {
    status: String!
    message: String
    user: User
    token: String!
  }
  input RegisterInput {
    email: String!
    password: String!
    full_name: String!
    phone_number: String
    birth_date: String
    no_nik: String
    address: String
    kelurahan: String
    kecamatan: String
    kabupaten_kota: String
    province: String
    postal_code: String
  }
  type Query {
    users: [User]
    user(id: ID!): User
    # Integration/partner use only: filter users for account integration (not public listing)
    filterUsers(filters: UserFilterInput, pagination: PaginationInput, sort: UserSortInput): FilteredUsersPage
  }

  input UserFilterInput {
    email: String
    full_name: String
    phone_number: String
    min_age: Int
    max_age: Int
    start_date: String
    end_date: String
    kabupaten_kota: String
    province: String
    postal_code: String
  }
  input UserSortInput {
    sort_by: String
    sort_order: String
  }
  input PaginationInput {
    page: Int
    limit: Int
  }
  type FilteredUsersPage {
    users: [User]
    pagination: PaginationInfo
  }
  type PaginationInfo {
    totalItems: Int
    totalPages: Int
    currentPage: Int
    pageSize: Int
    hasNextPage: Boolean
    hasPrevPage: Boolean
  }
  type Mutation {
    updateUser(id: ID!, name: String, email: String, phone: String): User
    deleteUser(id: ID!): Boolean
    login(email: String!, password: String!): AuthPayload
    register(input: RegisterInput!): AuthPayload
  }
`;

const USERS_SERVICE_URL = 'http://localhost:3001/api/users';

const resolvers = {
  Query: {
    async users() {
      const res = await fetch(USERS_SERVICE_URL);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data.map(user => ({
        id: user.id,
        name: user.name || user.full_name || null,
        email: user.email || null,
        phone: user.phone || user.phone_number || null,
        created_at: user.created_at || null,
        
      }));
    },
    async user(_, { id }) {
      const res = await fetch(`${USERS_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success') return null;
      const user = data.data;
      return {
        id: user.id,
        name: user.name || user.full_name || null,
        email: user.email || null,
        phone: user.phone || user.phone_number || null,
        created_at: user.created_at || null,
        
      };
    },
    /**
     * Integration/partner use only: filter users for account integration (not public listing)
     */
    async filterUsers(_, { filters = {}, pagination = {}, sort = {} }) {
      // Compose query params
      const params = { ...filters, ...pagination, ...sort };
      const query = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const url = `${USERS_SERVICE_URL}/filter${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return { users: [], pagination: {} };
      return {
        users: (data.data || []).map(user => ({
          id: user.id,
          name: user.name || user.full_name || null,
          email: user.email || null,
          phone: user.phone || user.phone_number || null,
          created_at: user.created_at || null,
          
        })),
        pagination: data.pagination || {}
      };
    }
  },

  Mutation: {
    async login(_, { email, password }) {
      if (!email || !password) throw new Error('Email and password are required');
      try {
        const res = await fetch(USERS_SERVICE_URL + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Login failed');
        return {
          status: data.status,
          message: data.message,
          user: data.data.user,
          token: data.data.token
        };
      } catch (err) {
        throw new Error('Login failed: ' + err.message);
      }
    },
    async register(_, { input }) {
      if (!input.email || !input.password || !input.full_name) {
        throw new Error('Missing required fields');
      }
      try {
        const res = await fetch(USERS_SERVICE_URL + '/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Registration failed');
        return {
          status: data.status,
          message: data.message,
          user: data.data.user,
          token: data.data.token
        };
      } catch (err) {
        throw new Error('Registration failed: ' + err.message);
      }
    },
    async updateUser(_, { id, name, email, phone }) {
      if (!id) throw new Error('User ID is required');
      try {
        const res = await fetch(`${USERS_SERVICE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to update user');
        return data.data;
      } catch (err) {
        throw new Error('User update failed: ' + err.message);
      }
    },
    async deleteUser(_, { id }) {
      if (!id) throw new Error('User ID is required');
      try {
        const res = await fetch(`${USERS_SERVICE_URL}/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to delete user');
        return true;
      } catch (err) {
        throw new Error('User deletion failed: ' + err.message);
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
