// GraphQL schema and resolvers for Hotel Service, to be used in API Gateway
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Hotel {
    id: ID!
    name: String
    city: String
    province: String
    address: String
    description: String
    stars: Float
    property_type: String
    facilities: String
  }

  type RoomType {
    id: ID!
    hotel_id: ID!
    name: String
    description: String
    type_code: String # e.g. DBL, SGL, STE
    bed_type: String
    size_sqm: Float
    max_occupancy: Int
    price_per_night: Float # Average or base price
    amenities: [String]
    images: [String]
  }

  input HotelFiltersInput {
    name: String
    city: String
    province: String
    stars: Int
    property_type: String
    facilities: String

    # DailyStatus related filters
    date: String
    room_type_name: String
    min_price: Float
    max_price: Float
  }

  enum SortOrder {
    ASC
    DESC
  }

  input HotelSortInput {
    sortBy: String # e.g., "stars", "price", "name"
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
  }

  type HotelsPage {
    hotels: [Hotel!]!
    pagination: PaginationInfo!
  }

  type Query {
    hotels(limit: Int, page: Int): HotelsPage
    hotel(id: ID!): Hotel

    filterHotels(
      filters: HotelFiltersInput
      sort: HotelSortInput
      pagination: PaginationInput
    ): HotelsPage

    hotelDailyStatus(hotelId: ID!, date: String!): [HotelRoomDailyStatus]
  }

 type HotelRoomDailyStatus {
    roomTypeName: String!
    date: String!
    availableRooms: Int
    price: Float
    currency: String
  } 

  type Mutation {
    decreaseRoomAvailability(hotelId: ID!, roomTypeName: String!, date: String!, quantity: Int!): AvailabilityResponse
    increaseRoomAvailability(hotelId: ID!, roomTypeName: String!, date: String!, quantity: Int!): AvailabilityResponse
  }

  type AvailabilityResponse {
    status: String!
    message: String
    affectedRows: Int
  }
`;

const HOTEL_SERVICE_URL = 'http://localhost:3003/api/hotels';

// Helper function to map service data to the GraphQL Hotel type
const mapHotel = (hotel) => ({
  id: hotel.id,
  name: hotel.name,
  city: hotel.city,
  province: hotel.province,
  address: hotel.address,
  description: hotel.description,
  stars: hotel.star_rating, // Corrected mapping from the service's 'star_rating'
  property_type: hotel.property_type,
  facilities: hotel.facilities,
});

const resolvers = {
  Query: {
    async hotels(_, { limit, page }) {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit);
      if (page) queryParams.append('page', page);
      
      const url = `${HOTEL_SERVICE_URL}?${queryParams.toString()}`;
      console.log(`Fetching hotels from: ${url}`);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          throw new Error(`Hotel service request failed (hotels) with status ${res.status}: ${errorBody}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return { hotels: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 } };
        }

        return {
          hotels: serviceResponse.data.map(mapHotel),
          pagination: {
            totalItems: serviceResponse.pagination.totalItems,
            totalPages: serviceResponse.pagination.totalPages,
            currentPage: serviceResponse.pagination.page,
            pageSize: serviceResponse.pagination.limit,
          },
        };
      } catch (err) {
        console.error('Error in hotels resolver:', err);
        throw new Error('Could not fetch hotels.');
      }
    },

    async hotel(_, { id }) {
      const url = `${HOTEL_SERVICE_URL}/${id}`;
      console.log(`Fetching hotel details from: ${url}`);
      try {
        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 404) return null;
          const errorBody = await res.text();
          throw new Error(`Hotel service request failed with status ${res.status}: ${errorBody}`);
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return null;
        }
        return mapHotel(serviceResponse.data);
      } catch (err) {
        console.error('Error in hotel resolver:', err);
        throw new Error('Could not fetch hotel details.');
      }
    },

    async filterHotels(_, { filters, sort, pagination }) {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
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
      
      const url = `${HOTEL_SERVICE_URL}/filter?${queryParams.toString()}`;
      console.log(`Fetching filtered hotels from: ${url}`);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          throw new Error(`Failed to fetch filtered hotels. Status: ${res.status}: ${errorBody}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return { hotels: [], pagination: { totalItems: 0, totalPages: 0, currentPage: pagination?.page || 1, pageSize: pagination?.limit || 10 } };
        }

        return {
          hotels: serviceResponse.data.map(mapHotel),
          pagination: {
            totalItems: serviceResponse.pagination.totalItems,
            totalPages: serviceResponse.pagination.totalPages,
            currentPage: serviceResponse.pagination.page,
            pageSize: serviceResponse.pagination.limit,
          },
        };
      } catch (error) {
        console.error('Error in filterHotels resolver:', error);
        throw new Error('Could not fetch filtered hotels.');
      }
    },

    async hotelDailyStatus(_, { hotelId, date }) {
      const url = `${HOTEL_SERVICE_URL}/${hotelId}/daily-status?date=${date}`;
      console.log(`Fetching hotel daily status from: ${url}`);
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          throw new Error(`Hotel service request failed (daily-status) with status ${res.status}: ${errorBody}`);
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success') {
          return [];
        }
        
        // The service now returns a single array with all the required fields.
        // The field names in the service response match the GraphQL type, so no mapping is needed.
        return serviceResponse.data;
      } catch (error) {
        console.error('Error in hotelDailyStatus resolver:', error);
        throw new Error('Could not fetch hotel daily status.');
      }
    },
  },

  Mutation: {
    async decreaseRoomAvailability(_, { hotelId, roomTypeName, date, quantity }) {
      const url = `${HOTEL_SERVICE_URL}/${hotelId}/availability/decrease`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_type_name: roomTypeName, date, quantity }),
        });
        if (!res.ok) {
          const errorBody = await res.json();
          throw new Error(errorBody.details || errorBody.message || 'Failed to decrease availability');
        }
        return await res.json();
      } catch (error) {
        console.error('Error in decreaseRoomAvailability resolver:', error);
        return { status: 'error', message: error.message };
      }
    },

    async increaseRoomAvailability(_, { hotelId, roomTypeName, date, quantity }) {
      const url = `${HOTEL_SERVICE_URL}/${hotelId}/availability/increase`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_type_name: roomTypeName, date, quantity }),
        });
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Hotel service POST ${url} failed with status ${res.status}: ${errorBody}`);
          let details = errorBody;
          try { details = JSON.parse(errorBody).message || errorBody; } catch (e) { /* ignore parsing error */ }
          throw new Error(`Failed to increase room availability. Status: ${res.status}. Message: ${details}`);
        }
        return res.json(); // Expects { status, message, affectedRows }
      } catch (error) {
        console.error('Error in increaseRoomAvailability:', error.message);
        throw new Error(error.message || 'Error increasing room availability.');
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
