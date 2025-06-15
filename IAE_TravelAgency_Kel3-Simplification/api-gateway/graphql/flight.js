// GraphQL schema and resolvers for Flight Service
const { gql } = require('apollo-server-express');
const axios = require('axios');

const typeDefs = gql`
  type Flight {
    id: ID!
    airline: String
    flight_number: String
    origin: String
    destination: String
    departure_time: String
    arrival_time: String

    # Additional static fields
    origin_airport_iata: String
    destination_airport_iata: String
    airline_code: String

    # price and seats_available moved to dailyStatus
    dailyStatus(date: String!): FlightDailyStatus
  }

  input FlightFiltersInput {
    origin_city: String
    destination_city: String
    origin_code: String
    destination_code: String
    airline_code: String
    airline_name: String
    flight_class: String
    departure_date: String # Consider GraphQL Date scalar if available/used elsewhere
    min_price: Float
    max_price: Float
  }

  enum SortOrder {
    ASC
    DESC
  }

  input FlightSortInput {
    sortBy: String # e.g., "price", "departure_time"
    sortOrder: SortOrder
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

  type AvailabilityResponse {
    status: String!
    message: String
    affectedRows: Int
  }

  type FlightsPage {
    flights: [Flight!]!
    pagination: PaginationInfo
  }

  type Query {
    # Existing queries
    flights(pagination: PaginationInput): [Flight]
    flight(id: ID!): Flight

    # Daily status query for a specific flight (availability & pricing)
    flightDailyStatus(flightId: ID!, date: String!): FlightDailyStatus

    # New filter query
    filterFlights(
      filters: FlightFiltersInput
      sort: FlightSortInput
      pagination: PaginationInput
    ): FlightsPage
  }

  type Mutation {
    decreaseFlightAvailability(flightId: ID!, date: String!, quantity: Int!): AvailabilityResponse
    increaseFlightAvailability(flightId: ID!, date: String!, quantity: Int!): AvailabilityResponse
    createFlight(airline: String!, flight_number: String!, origin: String!, destination: String!, departure_time: String!, arrival_time: String!, price: Float!, seats_available: Int!): Flight
    # Add other mutations as needed
  }

  type FlightDailyStatus {
    flightId: ID!
    date: String!
    availableSeats: Int
    price: Float
    currency: String
  }
`;

const FLIGHT_SERVICE_URL = 'http://localhost:3002/api';

const mapFlight = (flight) => ({
  id: flight.id,
  airline: flight.airline_name,
  flight_number: flight.flight_number,
  origin: flight.origin_name,
  destination: flight.destination_name,
  departure_time: flight.departure_time,
  arrival_time: flight.arrival_time,
  origin_airport_iata: flight.origin_code,
  destination_airport_iata: flight.destination_code,
  airline_code: flight.airline_code,
});

const resolvers = {
  Flight: {
    dailyStatus: async (parent, { date }) => {
      if (!parent.id || !date) return null;
      try {
        const response = await axios.get(`${FLIGHT_SERVICE_URL}/flights/${parent.id}/daily-status`, { params: { date } });
        const { data } = response.data;
        if (response.data.status === 'success' && data) {
          const status = Array.isArray(data) ? data[0] : data;
          return status ? {
            flightId: status.flight_id,
            date: status.date,
            availableSeats: status.available_seats,
            price: status.price,
            currency: status.currency,
          } : null;
        }
        return null;
      } catch (error) {
        console.error(`Error fetching daily status for flight ${parent.id}:`, error.message);
        return null;
      }
    },
  },
  Query: {
    flights: async (_, { pagination = { page: 1, limit: 10 } }) => {
      try {
        const { page, limit } = pagination;
        const { data } = await axios.get(`${FLIGHT_SERVICE_URL}/flights`, { params: { page, limit } });
        if (data.status === 'success' && data.data) {
          return data.data.map(mapFlight);
        }
        return [];
      } catch (error) {
        console.error('Error fetching flights:', error.message);
        return [];
      }
    },
    flight: async (_, { id }) => {
      try {
        const { data } = await axios.get(`${FLIGHT_SERVICE_URL}/flights/${id}`);
        if (data.status === 'success' && data.data) {
          return mapFlight(data.data);
        }
        return null;
      } catch (error) {
        console.error(`Error fetching flight ${id}:`, error.message);
        return null;
      }
    },
    flightDailyStatus: async (_, { flightId, date }) => {
      if (!flightId || !date) return null;
      try {
        const response = await axios.get(`${FLIGHT_SERVICE_URL}/flights/${flightId}/daily-status`, { params: { date } });
        const { data } = response.data; // Assuming service returns { status: 'success', data: { flight_id, ... } }
        if (response.data.status === 'success' && data) {
          const status = Array.isArray(data) ? data[0] : data; // Handle if service wraps in array
          return status ? {
            flightId: status.flight_id,
            date: status.date,
            availableSeats: status.available_seats,
            price: status.price,
            currency: status.currency,
          } : null;
        }
        return null;
      } catch (error) {
        console.error(`Error fetching daily status for flight ${flightId} on date ${date}:`, error.message);
        // Optionally, check error.response.status for 404 and return null, otherwise throw
        if (error.response && error.response.status === 404) {
            return null; // Data not found for this flight/date combination
        }
        // For other errors, you might want to throw or return a more specific GraphQL error
        throw new Error(`Failed to fetch daily status for flight ${flightId}`);
      }
    },
    filterFlights: async (_, { filters, sort, pagination = { page: 1, limit: 10 } }) => {
      try {
        const params = { ...filters, ...sort, ...pagination };
        const { data } = await axios.get(`${FLIGHT_SERVICE_URL}/flights/filter`, { params });
        if (data.status === 'success' && data.data) {
          const servicePagination = data.pagination;
          const gqlPagination = servicePagination ? {
            totalItems: servicePagination.total_items,
            totalPages: servicePagination.total_pages,
            currentPage: servicePagination.current_page,
            pageSize: servicePagination.items_per_page,
            hasNextPage: servicePagination.has_next_page,
            hasPrevPage: servicePagination.has_prev_page,
          } : null;

          return {
            flights: data.data.map(mapFlight),
            pagination: gqlPagination,
          };
        }
        return { flights: [], pagination: null };
      } catch (error) {
        console.error('Error filtering flights:', error.message);
        return { flights: [], pagination: null };
      }
    },
  },
  Mutation: {
    decreaseFlightAvailability: async (_, { flightId, date, quantity }) => {
      try {
        const { data } = await axios.post(`${FLIGHT_SERVICE_URL}/flights/${flightId}/availability/decrease`, { date, quantity });
        return data;
      } catch (error) {
        console.error('Decrease flight availability failed:', error.message);
        throw new Error(error.response?.data?.message || 'Failed to decrease flight availability');
      }
    },
    increaseFlightAvailability: async (_, { flightId, date, quantity }) => {
      try {
        const { data } = await axios.post(`${FLIGHT_SERVICE_URL}/flights/${flightId}/availability/increase`, { date, quantity });
        return data;
      } catch (error) {
        console.error('Increase flight availability failed:', error.message);
        throw new Error(error.response?.data?.message || 'Failed to increase flight availability');
      }
    },
    createFlight: async (_, args) => {
      try {
        const { data } = await axios.post(`${FLIGHT_SERVICE_URL}/flights`, args);
        if (data.status === 'success') {
          return mapFlight(data.data);
        }
        return null;
      } catch (error) {
        console.error('Flight creation failed:', error.message);
        throw new Error(error.response?.data?.message || 'Flight creation failed');
      }
    },
  },
};

module.exports = { typeDefs, resolvers };
