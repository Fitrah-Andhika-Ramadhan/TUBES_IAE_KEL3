import { gql } from '@apollo/client';

/**
 * Fetches detailed static information for a single hotel, including its
 * defined room types. Note: Room availability and pricing are NOT included here.
 * Use GET_HOTEL_DAILY_STATUS for dynamic room data.
 */
export const GET_HOTEL_DETAIL = gql`
  query GetHotelDetail($id: ID!) {
    hotel(id: $id) {
      id
      name
      city
      address {
        street
        city
        province
      }
      stars
      property_type
      description
      facilities
      room_types {
        name
        description
        capacity
        features
      }
    }
  }
`;

/**
 * Fetches the daily status (availability, price) for all room types
 * of a specific hotel on a given date. This is the primary query for
 * checking room availability and prices.
 */
export const GET_HOTEL_DAILY_STATUS = gql`
  query GetHotelDailyStatus($hotelId: ID!, $date: String!) {
    hotelDailyStatus(hotelId: $hotelId, date: $date) {
      roomTypeName
      availableRooms
      price
      currency
    }
  }
`;

/**
 * Filters and paginates hotels based on a variety of criteria.
 * This query returns a list of hotels with their static data.
 * To get room prices/availability, a separate GET_HOTEL_DAILY_STATUS
 * call is needed for a selected hotel.
 */
export const FILTER_HOTELS = gql`
  query FilterHotels($filters: HotelFiltersInput, $sort: HotelSortInput, $pagination: PaginationInput) {
  filterHotels(filters: $filters, sort: $sort, pagination: $pagination) {
    hotels {
      id
      name
      city
      address {
        street
        city
        province
      }
      stars
      property_type
      description
      facilities
      __typename
    }
    pagination {
      totalItems
      totalPages
      currentPage
      __typename
    }
    __typename
  }
}`;

/**
 * Creates a new hotel and its associated room types with initial
 * pricing and availability.
 */
export const CREATE_HOTEL = gql`
  mutation CreateHotel(
    $name: String!
    $city: String!
    $address: String!
    $stars: Int
    $property_type: String
    $description: String
    $facilities: String
    $room_types: [RoomTypeInput!]!
  ) {
    createHotel(
      name: $name
      city: $city
      address: $address
      stars: $stars
      property_type: $property_type
      description: $description
      facilities: $facilities
      room_types: $room_types
    ) {
      id
      name
      city
      address
      stars
      property_type
      description
      facilities
      room_types {
        name
        description
        capacity
        features
      }
    }
  }
`;


