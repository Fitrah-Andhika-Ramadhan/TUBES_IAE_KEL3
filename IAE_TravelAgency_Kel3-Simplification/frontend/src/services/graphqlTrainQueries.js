import { gql } from '@apollo/client';

/**
 * Fetches detailed static information for a single train and its dynamic
 * daily status (price, availability) for a specific date.
 */
export const GET_TRAIN_DETAIL = gql`
  query GetTrainDetail($id: ID!, $date: String!) {
    train(id: $id) {
      id
      name
      train_number
      operator
      origin_station_code
      origin_station_name
      destination_station_code
      destination_station_name
      departure_time
      arrival_time
      duration
      description
      facilities
      dailyStatus(date: $date) {
        price
        availableSeats
        currency
      }
    }
  }
`;

/**
 * Fetches the daily status (price, availability) for a specific train on a specific date.
 */
export const GET_TRAIN_DAILY_STATUS = gql`
  query GetTrainDailyStatus($trainId: ID!, $date: String!) {
    trainDailyStatus(trainId: $trainId, date: $date) {
      price
      availableSeats
      currency
    }
  }
`;

/**
 * Filters and paginates trains based on a variety of criteria.
 * Also fetches the daily status for each train in the result for a given date.
 */
export const FILTER_TRAINS = gql`
  query FilterTrains(
    $filters: TrainFiltersInput
    $sort: TrainSortInput
    $pagination: PaginationInput
    $statusDate: String! # Date for which to fetch status, e.g., "YYYY-MM-DD"
  ) {
    filterTrains(filters: $filters, sort: $sort, pagination: $pagination) {
      trains {
        id
        name
        train_number
        operator
        origin_station_code
        origin_station_name
        destination_station_code
        destination_station_name
        departure_time
        arrival_time
        duration
        description
        facilities
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
 * Creates a new train with its initial pricing and availability.
 */
export const CREATE_TRAIN = gql`
  mutation CreateTrain(
    $name: String!
    $train_number: String!
    $operator: String
    $origin_station_code: String!
    $origin_station_name: String!
    $destination_station_code: String!
    $destination_station_name: String!
    $departure_time: String!
    $arrival_time: String!
    $duration: String
    $description: String
    $facilities: String
    $price: Float!
    $seats_available: Int!
  ) {
    createTrain(
      name: $name
      train_number: $train_number
      operator: $operator
      origin_station_code: $origin_station_code
      origin_station_name: $origin_station_name
      destination_station_code: $destination_station_code
      destination_station_name: $destination_station_name
      departure_time: $departure_time
      arrival_time: $arrival_time
      duration: $duration
      description: $description
      facilities: $facilities
      price: $price
      seats_available: $seats_available
    ) {
      id
      name
      train_number
      operator
      origin_station_code
      origin_station_name
      destination_station_code
      destination_station_name
      departure_time
      arrival_time
      duration
      description
      facilities
    }
  }
`;

