// GraphQL schema and resolvers for Booking, to be used in API Gateway
const { ApolloServer, gql, UserInputError, ApolloError, AuthenticationError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Type Definitions (migrated from Booking Service)
const typeDefs = gql`
  scalar JSON
  type Booking {
    id: ID!
    user_id: ID!
    booking_code: String
    type: String!
    ref_id: ID!
    travel_date: String!
    quantity: Int!
    unit_price: Float!
    total_amount: Float!
    currency: String!
    payment_method: String! # This will be passed to booking-service
    payment_status: String
    special_requests: String
    details: JSON
    status: String
    created_at: String!
    updated_at: String
  }

  # BookingItem is removed as booking-service now handles single item bookings directly.
  type Query {
    getBookingById(id: ID!): Booking
    getUserBookings(userId: ID!): [Booking!]!
  }
  type Mutation {
    createBooking(
      type: String!,
      refId: ID!, # maps to ref_id in booking-service
      travelDate: String!, # maps to travel_date in booking-service
      quantity: Int!,
      unitPrice: Float!,
      totalAmount: Float!,
      currency: String!,
      paymentMethod: String!, # maps to payment_method in booking-service
      specialRequests: String,
      details: JSON
    ): Booking # Consider a BookingCreationResponse type later if needed
    cancelBooking(bookingId: ID!): Boolean
    # modifyBooking might need similar simplification if kept
    modifyBooking(bookingId: ID!, type: String, refId: ID, travelDate: String, quantity: Int, unitPrice: Float, totalAmount: Float, currency: String, paymentMethod: String, specialRequests: String, details: JSON): Booking
  }
  type PaymentResponse {
    status: String!
    paymentId: ID
    message: String
  }
  # BookingItemInput is removed as createBooking now takes direct arguments.
`;

// REST endpoint for the Booking Service
const BOOKING_SERVICE_URL = 'http://localhost:3004/api/bookings';
const PAYMENT_SERVICE_URL = 'http://localhost:3005/api/payments';

const resolvers = {
  Query: {
    async getBookingById(_, { id }) {
      const res = await fetch(`${BOOKING_SERVICE_URL}/${id}`);
      const bookingData = await res.json(); // Renamed for clarity
      if (bookingData.status !== 'success' || !bookingData.data) return null;
      
      // Assuming bookingData.data is the single booking object from the service
      const booking = bookingData.data;

      return {
        id: booking.id,
        user_id: booking.user_id,
        booking_code: booking.booking_code,
        type: booking.type,
        ref_id: booking.ref_id,
        travel_date: booking.travel_date,
        quantity: booking.quantity,
        unit_price: booking.unit_price,
        total_amount: booking.total_amount,
        currency: booking.currency,
        payment_method: booking.payment_method || null, // As per previous resolver
        payment_status: booking.payment_status,
        special_requests: booking.special_requests,
        details: booking.details,
        status: booking.status,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      };
    },
    async getUserBookings(_, { userId }) {
      const res = await fetch(`${BOOKING_SERVICE_URL}/user/${userId}`);
      const data = await res.json();
      if (data.status !== 'success' || !data.data) return [];
      // data.data is expected to be an array of booking objects from the service
      return data.data.map(booking => ({
        id: booking.id,
        user_id: booking.user_id,
        booking_code: booking.booking_code,
        type: booking.type, // Assuming booking-service returns this directly
        ref_id: booking.ref_id, // Assuming booking-service returns this directly
        travel_date: booking.travel_date, // Assuming booking-service returns this directly
        quantity: booking.quantity, // Assuming booking-service returns this directly
        unit_price: booking.unit_price, // Assuming booking-service returns this directly
        total_amount: booking.total_amount,
        currency: booking.currency,
        // For payment_method, the booking record itself might not store the one sent during creation.
        // It's usually part of payment details. If GraphQL Booking type needs it,
        // we might need to decide on a source or make it nullable if not always available directly on booking list.
        // For now, let's assume booking-service might return it, or it's okay to be null if not.
        payment_method: booking.payment_method || null, 
        payment_status: booking.payment_status,
        special_requests: booking.special_requests,
        details: booking.details, // Assuming booking-service returns this directly
        status: booking.status,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      }));
    }
  },
  Mutation: {
    async createBooking(_, args, context) {
      // JWT Authentication
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new AuthenticationError('Authentication token must be provided.');
      }
      const token = authHeader.split('Bearer ')[1];
      console.log('[API Gateway] Received Token for verification:', token);
      if (!token) {
        throw new AuthenticationError('Authentication token must be in \'Bearer [token]\' format.');
      }

      let decodedToken;
      try {
        // IMPORTANT: Ensure JWT_SECRET is consistent with users-service
        // In a real app, this secret should be a robust, environment-managed variable.
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error('JWT Verification Error:', err.message);
        throw new AuthenticationError('Invalid or expired token.');
      }

      const loggedInUserId = decodedToken.id;
      if (!loggedInUserId) {
          throw new AuthenticationError('User ID not found in token. Token may be malformed or setup incorrectly.');
      }

      const { 
        // userId is now derived from the token, not from args
        type, 
        refId, 
        travelDate, 
        quantity, 
        unitPrice, 
        totalAmount, 
        currency, 
        paymentMethod, 
        specialRequests, 
        details 
      } = args;

      const bookingPayload = {
        user_id: loggedInUserId, // Use userId from validated token
        type: type,
        ref_id: refId,
        travel_date: travelDate,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        currency: currency,
        payment_method: paymentMethod, // Passed to booking-service
        special_requests: specialRequests,
        details: details
      };

      try {
        console.log('[GraphQL Resolver] Sending createBooking request to Booking Service:', bookingPayload);
        const response = await fetch(BOOKING_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload),
        });

        const responseData = await response.json();
        console.log('[GraphQL Resolver] Received response from Booking Service:', responseData);

        if (responseData.status !== 'success') {
          throw new ApolloError(responseData.message || 'Failed to create booking.', 'BOOKING_SERVICE_ERROR', {
            details: responseData.details,
          });
        }

        // The booking service now returns a nested object. Extract booking_details.
        const bookingDetails = responseData.data.booking_details;
        const paymentDetails = responseData.data.payment_details;

        // Combine data from the original request payload and the successful DB insert response
        return {
          // Fields from the DB response (bookingDetails)
          id: bookingDetails.id,
          booking_code: bookingDetails.booking_code,
          payment_status: bookingDetails.payment_status || (paymentDetails ? paymentDetails.paymentStatus : null),
          status: bookingDetails.status,
          created_at: bookingDetails.created_at,
          updated_at: bookingDetails.updated_at,

          // Fields from the original request (bookingPayload)
          user_id: bookingPayload.user_id,
          type: bookingPayload.type,
          ref_id: bookingPayload.ref_id,
          travel_date: bookingPayload.travel_date,
          quantity: bookingPayload.quantity,
          unit_price: bookingPayload.unit_price,
          total_amount: bookingPayload.total_amount,
          currency: bookingPayload.currency,
          payment_method: bookingPayload.payment_method,
          special_requests: bookingPayload.special_requests,
          details: bookingPayload.details,
        };

      } catch (error) {
        console.error('[GraphQL Resolver] Error creating booking:', error.response ? error.response.data : error.message);
        const serviceError = error.response ? error.response.data : { message: 'Failed to create booking. An unknown error occurred in the booking service.' };
        throw new ApolloError(serviceError.message || 'Failed to process booking.', 'BOOKING_SERVICE_ERROR', {
          details: serviceError.details,
        });
      }
    },
    async cancelBooking(_, { bookingId }) {
      // --- Service endpoint definitions (same as in createBooking) ---
      const SERVICE_ENDPOINTS = {
        hotel: {
          url: 'http://localhost:3003/api/hotels',
          increase: 'availability/increase',
          idField: 'ref_id',
          payload: (item) => ({
            room_type_id: item.details.roomTypeId,
            date: item.details.checkInDate,
            quantity: item.details.quantity
          })
        },
        train: {
          url: 'http://localhost:3007/api/trains',
          increase: 'availability/increase',
          idField: 'ref_id',
          payload: (item) => ({
            date: item.details.date,
            quantity: item.details.quantity
          })
        },
        flight: {
          url: 'http://localhost:3002/api/flights',
          increase: 'availability/increase',
          idField: 'ref_id',
          payload: (item) => ({
            date: item.details.date,
            quantity: item.details.quantity
          })
        },
        local_travel: {
          url: 'http://localhost:3006/api/local-travel',
          increase: 'availability/increase',
          idField: 'ref_id',
          payload: (item) => ({
            date: item.details.date,
            quantity: item.details.quantity
          })
        }
      };

      // 1. Fetch booking details to get items
      const bookingRes = await fetch(`${BOOKING_SERVICE_URL}/${bookingId}`);
      const bookingData = await bookingRes.json();
      if (bookingData.status !== 'success') return false;
      const booking = bookingData.data;

      // 2. Cancel the booking
      const res = await fetch(`${BOOKING_SERVICE_URL}/${bookingId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status !== 'success') return false;

      // 3. For each booking item, increase availability
      for (const item of booking.items || []) {
        const service = SERVICE_ENDPOINTS[item.type];
        if (service && item.details && service.payload(item)) {
          try {
            const endpoint = `${service.url}/${item[service.idField]}/${service.increase}`;
            const payload = service.payload(item);
            await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } catch (err) {
            // Log error, but booking is already canceled
            console.error(`Availability rollback failed for ${item.type}:`, err.message);
          }
        }
      }
      return true;
    },
    async modifyBooking(_, { bookingId, items }) {
      const res = await fetch(`${BOOKING_SERVICE_URL}/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (data.status !== 'success') return null;
      return data.data;
    }
  }
};

module.exports = { typeDefs, resolvers };
