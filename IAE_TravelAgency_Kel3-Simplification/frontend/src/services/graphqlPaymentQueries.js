import { gql } from '@apollo/client';

// Payment (Aligned with API Gateway)
export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      userId
      bookingId
      amount
      currency
      paymentMethodType
      paymentReference
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAYMENTS = gql`
  query Payments($userId: ID, $bookingId: ID) {
    payments(userId: $userId, bookingId: $bookingId) {
      id
      userId
      bookingId
      amount
      currency
      paymentMethodType
      paymentReference
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAYMENT_BY_ID = gql`
  query Payment($id: ID!) {
    payment(id: $id) {
      id
      userId
      bookingId
      amount
      currency
      paymentMethodType
      paymentReference
      status
      createdAt
      updatedAt
    }
  }
`;
