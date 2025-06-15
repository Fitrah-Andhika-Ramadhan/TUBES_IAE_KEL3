import { useQuery, useMutation } from '@apollo/client';
import { CREATE_PAYMENT, GET_PAYMENTS, GET_PAYMENT_BY_ID } from './graphqlPaymentQueries';

// Query Hooks
export function usePayments(variables = {}, options = {}) {
  return useQuery(GET_PAYMENTS, {
    variables,
    ...options,
  });
}

export function usePaymentById(id, options = {}) {
  return useQuery(GET_PAYMENT_BY_ID, {
    variables: { id },
    ...options,
  });
}

// Mutation Hook
export function useCreatePayment(options = {}) {
  return useMutation(CREATE_PAYMENT, options);
}
