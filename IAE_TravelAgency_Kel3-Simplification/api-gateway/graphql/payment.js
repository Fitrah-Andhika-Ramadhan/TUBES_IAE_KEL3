// GraphQL schema and resolvers for Payment Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Payment {
    id: ID!
    user_id: ID!
    booking_id: ID!
    amount: Float!
    currency: String
    payment_method_type: String
    payment_reference: String
    status: String
    created_at: String
    updated_at: String
  }
  type Query {
    payments(bookingId: ID!): [Payment]
    getPaymentStatus(id: ID!): String
  }
  type Mutation {
    createPayment(userId: ID!, bookingId: ID!, amount: Float!, currency: String, payment_method_type: String, payment_reference: String): Payment
  }
`;

const PAYMENT_SERVICE_URL = 'http://localhost:3005/api/payments';

const resolvers = {
  Query: {
    async payments(_, { bookingId }) {
      if (!bookingId) throw new Error('bookingId is required');
      const url = `${PAYMENT_SERVICE_URL}/booking/${bookingId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data.map(payment => ({
        id: payment.id,
        user_id: payment.user_id || null,
        booking_id: payment.booking_id || null,
        amount: payment.amount || null,
        currency: payment.currency || null,
        payment_method_type: payment.payment_method_type || null,
        payment_reference: payment.payment_reference || null,
        status: payment.status || null,
        created_at: payment.created_at || null,
        updated_at: payment.updated_at || null,
      }));
    },
    async getPaymentStatus(_, { id }) {
      const res = await fetch(`${PAYMENT_SERVICE_URL}/${id}/status`);
      const data = await res.json();
      if (data.status !== 'success') return null;
      return data.status || null;
    }
  },
  Mutation: {
    async createPayment(_, { userId, bookingId, amount, currency, payment_method_type, payment_reference }) {
      if (!userId || !bookingId || !amount) {
        throw new Error('userId, bookingId, and amount are required');
      }
      try {
        const res = await fetch(PAYMENT_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, bookingId, amount, currency, payment_method_type, payment_reference })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to create payment');
        return data.data;
      } catch (err) {
        throw new Error('Payment creation failed: ' + err.message);
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
