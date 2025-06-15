import { useQuery, useMutation } from '@apollo/client';
import {
  FILTER_LOCAL_TRAVELS,
  GET_LOCAL_TRAVEL_DETAIL,
  GET_LOCAL_TRAVEL_DAILY_STATUS,
  CREATE_LOCAL_TRAVEL,
} from './graphqlLocalTravelQueries';
import {
  CREATE_BOOKING,
  CANCEL_BOOKING,
} from './graphqlBookingQueries'; // Assuming this file exists and is correct

/**
 * Hook to fetch and filter local travel options.
 * @param {object} params - The filter, sort, and pagination parameters.
 * @param {string} params.statusDate - The date for which to fetch status (YYYY-MM-DD).
 */
export function useFilterLocalTravels({ filters = {}, sort = {}, pagination = {}, statusDate }) {
  // Clean up undefined keys from filters, sort, and pagination objects
  const cleanedFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null));
  const cleanedSort = Object.fromEntries(Object.entries(sort).filter(([_, v]) => v != null));
  const cleanedPagination = Object.fromEntries(Object.entries(pagination).filter(([_, v]) => v != null));

  return useQuery(FILTER_LOCAL_TRAVELS, {
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
 * Hook to fetch the details of a single local travel option, including its daily status for a specific date.
 * @param {string} id - The ID of the local travel option.
 * @param {string} date - The date for which to fetch the status (YYYY-MM-DD).
 */
export function useLocalTravelDetail(id, date) {
  return useQuery(GET_LOCAL_TRAVEL_DETAIL, {
    variables: { id, date },
    skip: !id || !date, // Don't run if id or date are missing
  });
}

/**
 * Hook to fetch the daily status (price, availability) for a specific local travel option on a given date.
 * @param {string} localTravelId - The ID of the local travel option.
 * @param {string} date - The date for which to fetch status (YYYY-MM-DD).
 */
export function useLocalTravelDailyStatus(localTravelId, date) {
  return useQuery(GET_LOCAL_TRAVEL_DAILY_STATUS, {
    variables: { localTravelId, date },
    skip: !localTravelId || !date, // Don't run if localTravelId or date are missing
  });
}

// Mutation Hooks
export function useCreateLocalTravel(options = {}) {
  return useMutation(CREATE_LOCAL_TRAVEL, options);
}

export function useCreateLocalTravelBooking(options = {}) {
  return useMutation(CREATE_BOOKING, options);
}

export function useCancelLocalTravelBooking(options = {}) {
  return useMutation(CANCEL_BOOKING, options);
}
