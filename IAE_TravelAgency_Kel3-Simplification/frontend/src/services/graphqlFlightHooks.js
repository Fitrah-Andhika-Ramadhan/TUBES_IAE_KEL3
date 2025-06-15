import { useQuery, useMutation } from '@apollo/client';
import {
  FILTER_FLIGHTS,
  GET_FLIGHT_DETAIL,
  GET_FLIGHT_DAILY_STATUS,
  CREATE_FLIGHT,
} from './graphqlFlightQueries';
import {
  CREATE_BOOKING,
  CANCEL_BOOKING,
} from './graphqlBookingQueries'; // Assuming this file exists and is correct

/**
 * Hook to fetch and filter flights.
 * @param {object} params - The filter, sort, and pagination parameters.
 * @param {string} params.statusDate - The date for which to fetch flight status (YYYY-MM-DD).
 */
export function useFilterFlights({ filters = {}, sort = {}, pagination = {}, statusDate }) {
  // Clean up undefined keys from filters, sort, and pagination objects
  const cleanedFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null));
  const cleanedSort = Object.fromEntries(Object.entries(sort).filter(([_, v]) => v != null));
  const cleanedPagination = Object.fromEntries(Object.entries(pagination).filter(([_, v]) => v != null));

  return useQuery(FILTER_FLIGHTS, {
    variables: {
      filters: cleanedFilters,
      sort: cleanedSort,
      pagination: cleanedPagination,
      statusDate,
    },
    fetchPolicy: 'cache-and-network',
    skip: !statusDate, // Don't run the query if the statusDate isn't provided
  });
}

/**
 * Hook to fetch the details of a single flight, including its daily status for a specific date.
 * @param {string} id - The ID of the flight.
 * @param {string} date - The date for which to fetch the flight's status (YYYY-MM-DD).
 */
export function useFlightDetail(id, date) {
  return useQuery(GET_FLIGHT_DETAIL, {
    variables: { id, date },
    skip: !id || !date, // Don't run if id or date are missing
  });
}

/**
 * Hook to fetch the daily status (price, availability) for a specific flight on a given date.
 * @param {string} flightId - The ID of the flight.
 * @param {string} date - The date for which to fetch status (YYYY-MM-DD).
 */
export function useFlightDailyStatus(flightId, date) {
  return useQuery(GET_FLIGHT_DAILY_STATUS, {
    variables: { flightId, date },
    skip: !flightId || !date, // Don't run if flightId or date are missing
  });
}

// Mutation Hooks
export function useCreateFlight(options = {}) {
  return useMutation(CREATE_FLIGHT, options);
}

export function useCreateFlightBooking(options = {}) {
  return useMutation(CREATE_BOOKING, options);
}

export function useCancelFlightBooking(options = {}) {
  return useMutation(CANCEL_BOOKING, options);
}
