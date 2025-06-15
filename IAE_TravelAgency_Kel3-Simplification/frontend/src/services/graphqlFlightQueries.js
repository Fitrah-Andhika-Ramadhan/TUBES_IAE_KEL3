import { gql } from '@apollo/client';

/**
 * Fetches detailed static information for a single flight and its dynamic
 * daily status (price, availability) for a specific date.
 */
export const GET_FLIGHT_DETAIL = gql`
  query GetFlightDetail($id: ID!, $date: String!) {
    flight(id: $id) {
      id
      flight_number
      airline
      origin_airport_iata
      destination_airport_iata
      departure_time
      arrival_time
      dailyStatus(date: $date) {
        price
        availableSeats
        currency
      }
    }
  }
`;

/**
 * Fetches the daily status (price, availability) for a specific flight on a specific date.
 * This is a more lightweight query than GET_FLIGHT_DETAIL if only pricing is needed.
 */
export const GET_FLIGHT_DAILY_STATUS = gql`
  query GetFlightDailyStatus($flightId: ID!, $date: String!) {
    flightDailyStatus(flightId: $flightId, date: $date) {
      price
      availableSeats
      currency
    }
  }
`;

/**
 * Filters and paginates flights based on a variety of criteria.
 * Also fetches the daily status for each flight in the result for a given date.
 */
export const FILTER_FLIGHTS = gql`
  query FilterFlights(
    $filters: FlightFiltersInput
    $sort: FlightSortInput
    $pagination: PaginationInput
    $statusDate: String! # Date for which to fetch status, e.g., "YYYY-MM-DD"
  ) {
    filterFlights(
      filters: $filters
      sort: $sort
      pagination: $pagination
    ) {
      flights {
        id
        flight_number
        airline
        origin_airport_iata
        destination_airport_iata
        departure_time
        arrival_time
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
 * Creates a new flight with its initial pricing and availability.
 * The backend handles creating the initial daily status entry.
 */
export const CREATE_FLIGHT = gql`
  mutation CreateFlight(
    $flight_number: String!
    $airline: String!
    $origin_airport_iata: String!
    $destination_airport_iata: String!
    $departure_time: String!
    $arrival_time: String!
    $price: Float!
    $seats_available: Int!
  ) {
    createFlight(
      flight_number: $flight_number
      airline: $airline
      origin_airport_iata: $origin_airport_iata
      destination_airport_iata: $destination_airport_iata
      departure_time: $departure_time
      arrival_time: $arrival_time
      price: $price
      seats_available: $seats_available
    ) {
      id
      flight_number
      airline
      origin_airport_iata
      destination_airport_iata
      departure_time
      arrival_time
    }
  }
`;
