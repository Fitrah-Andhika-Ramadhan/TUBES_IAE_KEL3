import { useQuery, useMutation } from '@apollo/client';
import {
  FILTER_TRAINS,
  GET_TRAIN_DETAIL,
  GET_TRAIN_DAILY_STATUS,
  CREATE_TRAIN,
} from './graphqlTrainQueries';
import {
  CREATE_BOOKING,
  CANCEL_BOOKING,
} from './graphqlBookingQueries'; // Assuming this file exists and is correct

/**
 * Hook to fetch and filter trains.
 * @param {object} params - The filter, sort, and pagination parameters.
 * @param {string} params.statusDate - The date for which to fetch train status (YYYY-MM-DD).
 */
export function useFilterTrains({ filters = {}, sort = {}, pagination = {}, statusDate }) {
  // Clean up undefined keys from filters, sort, and pagination objects
  const cleanedFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null));
  const cleanedSort = Object.fromEntries(Object.entries(sort).filter(([_, v]) => v != null));
  const cleanedPagination = Object.fromEntries(Object.entries(pagination).filter(([_, v]) => v != null));

  return useQuery(FILTER_TRAINS, {
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
 * Hook to fetch the details of a single train, including its daily status for a specific date.
 * @param {string} id - The ID of the train.
 * @param {string} date - The date for which to fetch the train's status (YYYY-MM-DD).
 */
export function useTrainDetail(id, date) {
  return useQuery(GET_TRAIN_DETAIL, {
    variables: { id, date },
    skip: !id || !date, // Don't run if id or date are missing
  });
}

/**
 * Hook to fetch the daily status (price, availability) for a specific train on a given date.
 * @param {string} trainId - The ID of the train.
 * @param {string} date - The date for which to fetch status (YYYY-MM-DD).
 */
export function useTrainDailyStatus(trainId, date) {
  return useQuery(GET_TRAIN_DAILY_STATUS, {
    variables: { trainId, date },
    skip: !trainId || !date, // Don't run if trainId or date are missing
  });
}

// Mutation Hooks
export function useCreateTrain(options = {}) {
  return useMutation(CREATE_TRAIN, options);
}

export function useCreateTrainBooking(options = {}) {
  return useMutation(CREATE_BOOKING, options);
}

export function useCancelTrainBooking(options = {}) {
  return useMutation(CANCEL_BOOKING, options);
}
