import { gql } from '@apollo/client';

// Get all bookings for a user
export const GET_MY_BOOKINGS = gql`
  query GetUserBookings($userId: ID!) {
    userBookings(userId: $userId) {
      id
      userId
      items {
        id
        type
        refId
        date
      }
      createdAt
      status
    }
  }
`;

// Get booking by ID
export const GET_BOOKING_BY_ID = gql`
  query GetBookingById($id: ID!) {
    booking(id: $id) {
      id
      userId
      items {
        id
        type
        refId
        date
      }
      createdAt
      status
    }
  }
`;

// Create a new booking
export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      userId
      items {
        id
        type
        refId
        date
      }
      createdAt
      status
    }
  }
`;

// Cancel a booking
export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id)
  }
`;

// Modify a booking
export const MODIFY_BOOKING = gql`
  mutation ModifyBooking($id: ID!, $items: [BookingItemInput!]!) {
    modifyBooking(id: $id, items: $items) {
      id
      userId
      items {
        id
        type
        refId
        date
      }
      createdAt
      status
    }
  }
`;
