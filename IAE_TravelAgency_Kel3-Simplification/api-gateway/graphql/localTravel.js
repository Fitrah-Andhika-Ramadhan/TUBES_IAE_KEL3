// GraphQL schema and resolvers for Local Travel Service
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type LocalTravel {
    id: ID!
    name: String # As expected by frontend
    type: String
    operator_name: String # Maps to operator_name from service
    description: String
    features: String
    origin: String # Maps to origin_city or similar
    destination: String # Maps to destination_city or similar
    departure_time: String
    arrival_time: String
    vehicle_model: String
    dailyStatus(date: String!): LocalTravelDailyStatus
    origin_province: String
    destination_province: String
    origin_kabupaten: String
    destination_kabupaten: String
    route: String
    capacity: Int
    has_ac: Boolean
    has_wifi: Boolean
    # Add other fields as needed
  }

  input LocalTravelFiltersInput {
    origin_city: String
    destination_city: String
    origin_province: String
    destination_province: String
    origin_kabupaten: String
    destination_kabupaten: String
    type: String
    operator_name: String # Maps to 'provider' in LocalTravel type if distinct
    provider: String
    route: String
    min_capacity: Int
    max_capacity: Int
    has_ac: Boolean
    has_wifi: Boolean
    min_price: Float
    max_price: Float
    date: String # For filtering by specific travel date
  }

  enum SortOrder {
    ASC
    DESC
  }

  input LocalTravelSortInput {
    sortBy: String # e.g., "price", "name"
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

  type LocalTravelsPage {
    data: [LocalTravel!]!
    pagination: PaginationInfo
  }

  type Query {
    # Existing queries
    localTravels(pagination: PaginationInput): [LocalTravel]
    localTravel(id: ID!): LocalTravel

    # Daily status query for a specific local travel (availability & pricing)
    localTravelDailyStatus(localTravelId: ID!, date: String!): LocalTravelDailyStatus

    # New filter query
    filterLocalTravels(
      filters: LocalTravelFiltersInput
      sort: LocalTravelSortInput
      pagination: PaginationInput
    ): LocalTravelsPage
  }

  type Mutation {
    decreaseLocalTravelAvailability(localTravelId: ID!, date: String!, quantity: Int!): AvailabilityResponse
    increaseLocalTravelAvailability(localTravelId: ID!, date: String!, quantity: Int!): AvailabilityResponse
    createLocalTravel(type: String!, provider: String!, origin: String!, destination: String!, departure_time: String!, arrival_time: String!, price: Float!, seats_available: Int!): LocalTravel
    # Add other mutations as needed
  }

  type LocalTravelDailyStatus {
    localTravelId: ID!
    date: String!
    availableSeats: Int
    price: Float
    currency: String
  }
`;

const LOCAL_TRAVEL_SERVICE_URL = 'http://localhost:3006/api/local-travel';

const resolvers = {
  LocalTravel: {
    dailyStatus: async (parent, { date }) => {
      if (!parent.id || !date) return null;
      try {
        const url = `${LOCAL_TRAVEL_SERVICE_URL}/${parent.id}/daily-status?date=${date}`;
        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 404) return null;
          console.error(`Local Travel service request failed (dailyStatus) with status ${res.status}`);
          return null;
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return null;
        }
        const statusData = Array.isArray(serviceResponse.data) ? serviceResponse.data[0] : serviceResponse.data;
        if (!statusData) return null;

        return {
          localTravelId: statusData.local_travel_id || parent.id,
          date: statusData.date || date,
          availableSeats: statusData.available_units, // Service model uses available_units
          price: statusData.price,
          currency: statusData.currency
        };
      } catch (error) {
        console.error(`Error fetching daily status for local travel ${parent.id}:`, error.message);
        return null;
      }
    },
  },
  Query: {
    localTravels: async (_, { pagination = {} }) => {
      const query = Object.entries(pagination)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const url = `${LOCAL_TRAVEL_SERVICE_URL}${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return (data.data || []).map(travel => ({
        id: travel.id,
        name: travel.name || travel.operator_name || null, // Prefer name, fallback to operator_name
        type: travel.type || null,
        operator_name: travel.operator_name || null, // Directly map operator_name
        description: travel.description || null,
        features: travel.features || null,
        origin: travel.origin_city || travel.origin_kabupaten || travel.origin_province || travel.origin || null,
        destination: travel.destination_city || travel.destination_kabupaten || travel.destination_province || travel.destination || null,
        departure_time: travel.departure_time || null,
        arrival_time: travel.arrival_time || null,
        vehicle_model: travel.vehicle_model || travel.vehicle_type || null,
        origin_province: travel.origin_province || null,
        destination_province: travel.destination_province || null,
        origin_kabupaten: travel.origin_kabupaten || null,
        destination_kabupaten: travel.destination_kabupaten || null,
        route: travel.route || null,
        capacity: travel.capacity !== undefined ? parseInt(travel.capacity, 10) : null,
        has_ac: travel.has_ac,
        has_wifi: travel.has_wifi,
      }));
    },
    localTravel: async (_, { id }) => {
      const res = await fetch(`${LOCAL_TRAVEL_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success' || !data.data) return null;
      const travel = data.data;
      return {
        id: travel.id,
        name: travel.name || travel.operator_name || null, // Prefer name, fallback to operator_name
        type: travel.type || null,
        operator_name: travel.operator_name || null, // Directly map operator_name
        description: travel.description || null,
        features: travel.features || null,
        origin: travel.origin_city || travel.origin_kabupaten || travel.origin_province || travel.origin || null,
        destination: travel.destination_city || travel.destination_kabupaten || travel.destination_province || travel.destination || null,
        departure_time: travel.departure_time || null,
        arrival_time: travel.arrival_time || null,
        vehicle_model: travel.vehicle_model || travel.vehicle_type || null,
        origin_province: travel.origin_province || null,
        destination_province: travel.destination_province || null,
        origin_kabupaten: travel.origin_kabupaten || null,
        destination_kabupaten: travel.destination_kabupaten || null,
        route: travel.route || null,
        capacity: travel.capacity !== undefined ? parseInt(travel.capacity, 10) : null,
        has_ac: travel.has_ac,
        has_wifi: travel.has_wifi,
      };
    },
    localTravelDailyStatus: async (_, { localTravelId, date }) => {
      const url = `${LOCAL_TRAVEL_SERVICE_URL}/${localTravelId}/daily-status?date=${date}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 404) return null;
          console.error(`Local Travel service request failed (localTravelDailyStatus) with status ${res.status}`);
          return null;
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return null;
        }
        const statusData = Array.isArray(serviceResponse.data) ? serviceResponse.data[0] : serviceResponse.data;
        if (!statusData) return null;

        return {
          localTravelId: statusData.local_travel_id || localTravelId,
          date: statusData.date || date,
          availableSeats: statusData.available_seats || statusData.available_units,
          price: statusData.price,
          currency: statusData.currency
        };
      } catch (error) {
        console.error('An error occurred while fetching local travel daily status: ' + error.message);
        return null;
      }
    },
    filterLocalTravels: async (_, { filters, sort, pagination }) => {
      const LOCAL_TRAVEL_FILTER_URL = `${LOCAL_TRAVEL_SERVICE_URL}/filter`;
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

      const url = `${LOCAL_TRAVEL_FILTER_URL}?${queryParams.toString()}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Local Travel service request failed with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch local travels from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return { data: [], pagination: null };
        }

        const mappedLocalTravels = serviceResponse.data.map(travel => ({
          id: travel.id,
          name: travel.name || travel.operator_name || null,
          type: travel.type || null,
          operator_name: travel.operator_name || null,
          description: travel.description || null,
          features: travel.features || null,
          origin: travel.origin_city || travel.origin_kabupaten || travel.origin_province || travel.origin || null,
          destination: travel.destination_city || travel.destination_kabupaten || travel.destination_province || travel.destination || null,
          departure_time: travel.departure_time || null,
          arrival_time: travel.arrival_time || null,
          vehicle_model: travel.vehicle_model || travel.vehicle_type || null,
          origin_province: travel.origin_province || null,
          destination_province: travel.destination_province || null,
          origin_kabupaten: travel.origin_kabupaten || null,
          destination_kabupaten: travel.destination_kabupaten || null,
          route: travel.route || null,
          capacity: travel.capacity !== undefined ? parseInt(travel.capacity, 10) : null,
          has_ac: travel.has_ac,
          has_wifi: travel.has_wifi,
        }));

        const servicePagination = serviceResponse.pagination;
        const gqlPagination = servicePagination ? {
          totalItems: servicePagination.totalItems,
          totalPages: servicePagination.totalPages,
          currentPage: servicePagination.page,
          pageSize: servicePagination.limit,
          hasNextPage: servicePagination.page < servicePagination.totalPages,
          hasPrevPage: servicePagination.page > 1,
        } : null;

        return {
          data: mappedLocalTravels,
          pagination: gqlPagination,
        };
      } catch (error) {
        console.error('Error filtering local travels:', error.message);
        throw new Error('An error occurred while filtering local travels: ' + error.message);
      }
    },
  },
  Mutation: {
    decreaseLocalTravelAvailability(_, { localTravelId, date, quantity }) {
      return fetch(`${LOCAL_TRAVEL_SERVICE_URL}/${localTravelId}/availability/decrease`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, quantity }),
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errorBody => {
            throw new Error(errorBody.message || 'Failed to decrease availability');
          });
        }
        return res.json();
      })
      .catch(err => {
        console.error('Decrease local travel availability failed:', err);
        throw new Error('Failed to decrease local travel availability due to a network or service error.');
      });
    },
    increaseLocalTravelAvailability(_, { localTravelId, date, quantity }) {
      return fetch(`${LOCAL_TRAVEL_SERVICE_URL}/${localTravelId}/availability/increase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, quantity }),
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errorBody => {
            throw new Error(errorBody.message || 'Failed to increase availability');
          });
        }
        return res.json();
      })
      .catch(err => {
        console.error('Increase local travel availability failed:', err);
        throw new Error('Failed to increase local travel availability due to a network or service error.');
      });
    },
    createLocalTravel(_, args) {
      return fetch(LOCAL_TRAVEL_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errorBody => {
            throw new Error(errorBody.message || 'Failed to create local travel');
          });
        }
        return res.json();
      })
      .then(response => {
        if (response.status === 'success') {
          return response.data; // Assuming the service returns the created object in `data`
        } else {
          throw new Error(response.message || 'Failed to create local travel');
        }
      })
      .catch(err => {
        console.error('Create local travel failed:', err);
        throw new Error('Failed to create local travel due to a network or service error.');
      });
    },
  }
};

module.exports = { typeDefs, resolvers };
