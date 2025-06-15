import { useQuery, useMutation } from '@apollo/client';
import {
  FILTER_HOTELS,
  GET_HOTEL_DETAIL,
  GET_HOTEL_DAILY_STATUS,
  CREATE_HOTEL,
} from './graphqlHotelQueries';
import {
  CREATE_BOOKING,
  CANCEL_BOOKING,
} from './graphqlBookingQueries'; // Assuming this file exists and is correct

/**
 * Hook to fetch and filter hotels based on static criteria.
 * @param {object} params - The filter, sort, and pagination parameters.
 */
export function useFilterHotels({ filters = {}, sort = {}, pagination = {} }) {
  // Clean up undefined keys from filters, sort, and pagination objects
  const cleanedFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null));
  const cleanedSort = Object.fromEntries(Object.entries(sort).filter(([_, v]) => v != null));
  const cleanedPagination = Object.fromEntries(Object.entries(pagination).filter(([_, v]) => v != null));

  return useQuery(FILTER_HOTELS, {
    variables: {
      filters: cleanedFilters,
      sort: cleanedSort,
      pagination: cleanedPagination,
    },
    fetchPolicy: 'cache-and-network',
  });
}

/**
 * Hook to fetch the static details of a single hotel (e.g., name, address, room types).
 * @param {string} id - The ID of the hotel.
 */
export function useHotelDetail(id) {
  return useQuery(GET_HOTEL_DETAIL, {
    variables: { id },
    skip: !id,
  });
}

/**
 * Hook to fetch the daily status (price, availability) for all room types of a hotel on a specific date.
 * @param {string} hotelId - The ID of the hotel.
 * @param {string} date - The date for which to fetch status (YYYY-MM-DD).
 */
export function useHotelDailyStatus(hotelId, date) {
  return useQuery(GET_HOTEL_DAILY_STATUS, {
    variables: { hotelId, date },
    skip: !hotelId || !date, // Don't run if hotelId or date are missing
    fetchPolicy: 'cache-and-network',
  });
}

// Mutation Hooks
export function useCreateHotel(options = {}) {
  return useMutation(CREATE_HOTEL, options);
}

export function useCreateHotelBooking(options = {}) {
  return useMutation(CREATE_BOOKING, options);
}

export function useCancelHotelBooking(options = {}) {
  return useMutation(CANCEL_BOOKING, options);
}
