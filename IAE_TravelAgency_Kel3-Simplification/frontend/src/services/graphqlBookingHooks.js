import { useQuery, useMutation } from '@apollo/client';
import {
  GET_MY_BOOKINGS,
  GET_BOOKING_BY_ID,
  CREATE_BOOKING,
  CANCEL_BOOKING,
  MODIFY_BOOKING,
  // Add other booking queries/mutations as needed
} from './graphqlBookingQueries';

// Query Hooks
export function useMyBookings(userId, options = {}) {
  return useQuery(GET_MY_BOOKINGS, {
    variables: { userId },
    ...options,
  });
}

export function useBookingById(id, options = {}) {
  return useQuery(GET_BOOKING_BY_ID, {
    variables: { id },
    ...options,
  });
}

// Mutation Hooks
export function useCreateBooking(options = {}) {
  return useMutation(CREATE_BOOKING, options);
}

export function useCancelBooking(options = {}) {
  return useMutation(CANCEL_BOOKING, options);
}

export function useModifyBooking(options = {}) {
  return useMutation(MODIFY_BOOKING, options);
}
