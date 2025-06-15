// GraphQL schema and resolvers for Train Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Train {
    id: ID!
    train_number: String
    name: String
    operator: String
    origin_station_code: String
    origin_station_name: String
    origin_city: String
    origin_province: String
    destination_station_code: String
    destination_station_name: String
    destination_city: String
    destination_province: String
    departure_time: String
    arrival_time: String
    duration: Int
    train_type: String
    description: String
    facilities: String
    created_at: String
    updated_at: String

    # Field to get date-specific status (price, availability)
    dailyStatus(date: String!): TrainDailyStatus
  }

  input TrainFiltersInput {
    origin_station_code: String
    destination_station_code: String
    origin_city: String
    destination_city: String
    origin_province: String
    destination_province: String
    train_type: String
    operator: String
    min_duration: Int
    max_duration: Int
    price_category: String
    min_price: Float
    max_price: Float
    departure_date: String # Consider GraphQL Date scalar
  }

  enum SortOrder {
    ASC
    DESC
  }

  input TrainSortInput {
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

  type TrainsPage {
    trains: [Train!]!
    pagination: PaginationInfo
  }

  type Query {
    # Existing queries
    trains(pagination: PaginationInput): [Train]
    train(id: ID!): Train

    # Daily status query for a specific train (availability & pricing)
    trainDailyStatus(trainId: ID!, date: String!): TrainDailyStatus

    # New filter query
    filterTrains(
      filters: TrainFiltersInput
      sort: TrainSortInput
      pagination: PaginationInput
    ): TrainsPage
  }

  type Mutation {
    decreaseTrainAvailability(trainId: ID!, date: String!, quantity: Int!): AvailabilityResponse
    increaseTrainAvailability(trainId: ID!, date: String!, quantity: Int!): AvailabilityResponse
    createTrain(train_number: String!, origin: String!, destination: String!, departure_time: String!, arrival_time: String!, price: Float!, seats_available: Int!): Train
    # Add other mutations as needed
  }

  type TrainDailyStatus {
    trainId: ID!
    date: String!
    availableSeats: Int
    price: Float
    currency: String
  }
`;

const TRAIN_SERVICE_URL = 'http://localhost:3007/api/trains'

const resolvers = {
  Train: {
    async dailyStatus(parent, { date }, context) {
      const trainId = parent.id;
      const url = `${TRAIN_SERVICE_URL}/${trainId}/daily-status?date=${date}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`Train service request failed for dailyStatus (trainId: ${trainId}, date: ${date}) with status ${res.status}`);
          return null; // Return null if status not found or on error
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return null; // No data found for this date
        }
        // Map service data to GraphQL type
        const statusData = serviceResponse.data;
        return {
          trainId: statusData.train_id,
          date: statusData.date,
          availableSeats: statusData.available_seats,
          price: statusData.price,
          currency: statusData.currency,
        };
      } catch (error) {
        console.error('Error fetching train daily status in Train resolver:', error);
        return null;
      }
    },
  },
  Query: {
    // Refactored trains resolver: supports only pagination
    async trains(_, { pagination = {} }) {
      const query = Object.entries(pagination)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const url = `${TRAIN_SERVICE_URL}${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
       return (data.data || []).map(train => ({
        id: train.id,
        train_number: train.train_number || train.train_code || train.train_no || null,
        name: train.name || null,
        operator: train.operator || null,
        origin_station_code: train.origin_station_code || null,
        origin_station_name: train.origin_station_name || null,
        origin_city: train.origin_city || null,
        origin_province: train.origin_province || null,
        destination_station_code: train.destination_station_code || null,
        destination_station_name: train.destination_station_name || null,
        destination_city: train.destination_city || null,
        destination_province: train.destination_province || null,
        departure_time: train.departure_time || null,
        arrival_time: train.arrival_time || null,
        duration: train.duration !== undefined ? parseInt(train.duration, 10) : (train.travel_duration !== undefined ? parseInt(train.travel_duration, 10) : null),
        train_class: train.train_class || null,
        subclass: train.subclass || null,
        train_type: train.train_type || null,
        description: train.description || null,
        facilities: train.facilities || null,
        created_at: train.created_at || null,
        updated_at: train.updated_at || null,
      }));
    },
    // Resolver for train daily status (availability and pricing)
     async trainDailyStatus(_, { trainId, date }) {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      const url = `${TRAIN_SERVICE_URL}/${trainId}/daily-status?date=${date}`; // Assuming this endpoint provides combined daily status
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Train service request failed (trainDailyStatus) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch train daily status from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return [];
        }
        // Expecting serviceResponse.data to be an object or an array with a single object for the daily status
        // e.g., { train_id, date, available_seats, price, currency }
        // Map to GraphQL TrainDailyStatus
        const statusData = serviceResponse.data;
        if (!statusData) return null; // Or throw error if data is expected

        return {
          trainId: statusData.train_id || trainId,
          date: statusData.date || date,
          availableSeats: statusData.available_seats,
          price: statusData.price,
          currency: statusData.currency
        };
      } catch (error) {
        // TODO: Add monitoring/logging for trainDailyStatus errors
        throw new Error('An error occurred while fetching train daily status: ' + error.message);
      }
    },

    async train(_, { id }) {
      const res = await fetch(`${TRAIN_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success' || !data.data) return null;
      const train = data.data;
      return {
        id: train.id,
        train_number: train.train_number || train.train_code || train.train_no || null,
        name: train.name || null,
        operator: train.operator || null,
        origin_station_code: train.origin_station_code || null,
        origin_station_name: train.origin_station_name || null,
        origin_city: train.origin_city || null,
        origin_province: train.origin_province || null,
        destination_station_code: train.destination_station_code || null,
        destination_station_name: train.destination_station_name || null,
        destination_city: train.destination_city || null,
        destination_province: train.destination_province || null,
        departure_time: train.departure_time || null,
        arrival_time: train.arrival_time || null,
        duration: train.duration !== undefined ? parseInt(train.duration, 10) : (train.travel_duration !== undefined ? parseInt(train.travel_duration, 10) : null),
        train_class: train.train_class || null,
        subclass: train.subclass || null,
        train_type: train.train_type || null,
        description: train.description || null,
        facilities: train.facilities || null,

        created_at: train.created_at || null,
        updated_at: train.updated_at || null,
      };
    },
    async filterTrains(_, { filters, sort, pagination }) {
      const TRAIN_FILTER_URL = `${TRAIN_SERVICE_URL}/filter`;
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && String(value).trim() !== '') {
            queryParams.append(key, value);
          }
        });
      }

      if (sort) {
        if (sort.sortBy) queryParams.append('sort_by', sort.sortBy);
        if (sort.sortOrder) queryParams.append('sort_order', sort.sortOrder);
      }

      if (pagination) {
        if (pagination.page) queryParams.append('page', pagination.page);
        if (pagination.limit) queryParams.append('limit', pagination.limit);
      }

      const url = `${TRAIN_FILTER_URL}?${queryParams.toString()}`;
      console.log(`Fetching trains from: ${url}`); // For debugging

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Train service request failed with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch trains from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          console.warn('Train service did not return success or data:', serviceResponse);
          return { trains: [], pagination: null };
        }

        const mappedTrains = serviceResponse.data.map(train => ({
          id: train.id,
          train_number: train.train_number || train.train_code || train.train_no || null, // train_code is an alias from service
          name: train.name || null,
          operator: train.operator || null,
          origin_station_code: train.origin_station_code || null,
          origin_station_name: train.origin_station_name || null,
          origin_city: train.origin_city || null,
          origin_province: train.origin_province || null,
          destination_station_code: train.destination_station_code || null,
          destination_station_name: train.destination_station_name || null,
          destination_city: train.destination_city || null,
          destination_province: train.destination_province || null,
          departure_time: train.departure_time || null,
          arrival_time: train.arrival_time || null,
          duration: train.duration !== undefined ? parseInt(train.duration, 10) : (train.travel_duration !== undefined ? parseInt(train.travel_duration, 10) : null), // travel_duration is an alias from service
          train_type: train.train_type || null,
          description: train.description || null,
          facilities: train.facilities || null,
          created_at: train.created_at || null,
          updated_at: train.updated_at || null
        }));

        const servicePagination = serviceResponse.pagination || {};
        const currentPage = parseInt(servicePagination.current_page || servicePagination.page, 10) || 1;
        const totalPages = parseInt(servicePagination.total_pages || servicePagination.pages, 10) || 0;

        const mappedPagination = {
          totalItems: parseInt(servicePagination.total_items || servicePagination.total, 10) || 0,
          totalPages: totalPages,
          currentPage: currentPage,
          pageSize: parseInt(servicePagination.per_page || servicePagination.limit, 10) || 0,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        };

        return {
          trains: mappedTrains,
          pagination: mappedPagination,
        };
      } catch (error) {
        console.error('Error in filterTrains resolver:', error);
        throw new Error('An error occurred while fetching trains.');
      }
    },
  },
  Mutation: {
    async decreaseTrainAvailability(_, { trainId, date, quantity }) {
      if (!trainId || !date || !quantity) {
        throw new Error('trainId, date, and quantity are required');
      }
      try {
        const url = `${TRAIN_SERVICE_URL}/${trainId}/availability/decrease`;
        const body = { date, quantity };
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to decrease train availability');
        return data;
      } catch (err) {
        throw new Error('Decrease train availability failed: ' + err.message);
      }
    },
    async increaseTrainAvailability(_, { trainId, date, quantity }) {
      if (!trainId || !date || !quantity) {
        throw new Error('trainId, date, and quantity are required');
      }
      try {
        const url = `${TRAIN_SERVICE_URL}/${trainId}/availability/increase`;
        const body = { date, quantity };
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to increase train availability');
        return data;
      } catch (err) {
        throw new Error('Increase train availability failed: ' + err.message);
      }
    },
    async createTrain(_, args) {
      // Map GraphQL args to Train microservice fields
      const payload = {
        train_number: args.train_number,
        origin_station_name: args.origin, // assuming 'origin' maps to 'origin_station_name'
        destination_station_name: args.destination, // assuming 'destination' maps to 'destination_station_name'
        departure_time: args.departure_time,
        arrival_time: args.arrival_time,
        price: args.price,
        seats_available: args.seats_available
        // Add more fields if your Train model expects them
      };
      // Validate required fields
      for (const key of Object.keys(payload)) {
        if (payload[key] === undefined || payload[key] === null) {
          throw new Error(`Field '${key}' is required`);
        }
      }
      try {
        const res = await fetch(TRAIN_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to create train');
        return { id: data.data.id, ...payload };
      } catch (err) {
        throw new Error('Train creation failed: ' + err.message);
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
