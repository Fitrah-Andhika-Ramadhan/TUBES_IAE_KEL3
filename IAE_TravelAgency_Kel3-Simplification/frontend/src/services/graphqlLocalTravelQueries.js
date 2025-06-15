import { gql } from '@apollo/client';

/**
 * Fetches detailed static information for a single local travel option and its
 * dynamic daily status (price, availability) for a specific date.
 */
export const GET_LOCAL_TRAVEL_DETAIL = gql`
  query GetLocalTravelDetail($id: ID!, $date: String!) {
    localTravel(id: $id) {
      id
      name
      type
      operator_name
      origin
      destination
      departure_time
      arrival_time
      vehicle_model
      capacity
      description
      features
      has_ac
      has_wifi
      dailyStatus(date: $date) {
        price
        availableSeats
        currency
      }
    }
  }
`;

/**
 * Fetches the daily status (price, availability) for a specific local travel option on a specific date.
 */
export const GET_LOCAL_TRAVEL_DAILY_STATUS = gql`
  query GetLocalTravelDailyStatus($localTravelId: ID!, $date: String!) {
    localTravelDailyStatus(localTravelId: $localTravelId, date: $date) {
      price
      availableSeats
      currency
    }
  }
`;

/**
 * Filters and paginates local travel options based on a variety of criteria.
 * Also fetches the daily status for each option in the result for a given date.
 */
export const FILTER_LOCAL_TRAVELS = gql`
  query FilterLocalTravels(
    $filters: LocalTravelFiltersInput
    $sort: LocalTravelSortInput
    $pagination: PaginationInput
    $statusDate: String! # Date for which to fetch status, e.g., "YYYY-MM-DD"
  ) {
    filterLocalTravels(filters: $filters, sort: $sort, pagination: $pagination) {
      data {
        id
        name
        type
        operator_name
        origin
        destination
        departure_time
        arrival_time
        vehicle_model
        capacity
        description
        features
        has_ac
        has_wifi
        dailyStatus(date: $statusDate) {
          price
          availableSeats
          currency
        }
      }
      pagination {
        totalItems
        totalPages
        currentPage
      }
    }
  }
`;

/**
 * Creates a new local travel option with its initial pricing and availability.
 */
export const CREATE_LOCAL_TRAVEL = gql`
  mutation CreateLocalTravel(
    $name: String!
    $type: String!
    $operator_name: String
    $origin: String!
    $destination: String!
    $departure_time: String
    $arrival_time: String
    $vehicle_model: String
    $capacity: Int
    $description: String
    $features: String
    $has_ac: Boolean
    $has_wifi: Boolean
    $price: Float!
    $seats_available: Int!
  ) {
    createLocalTravel(
      name: $name
      type: $type
      operator_name: $operator_name
      origin: $origin
      destination: $destination
      departure_time: $departure_time
      arrival_time: $arrival_time
      vehicle_model: $vehicle_model
      capacity: $capacity
      description: $description
      features: $features
      has_ac: $has_ac
      has_wifi: $has_wifi
      price: $price
      seats_available: $seats_available
    ) {
      id
      name
      type
      operator_name
      origin
      destination
      departure_time
      arrival_time
      vehicle_model
      capacity
      description
      features
      has_ac
      has_wifi
    }
  }
`;
