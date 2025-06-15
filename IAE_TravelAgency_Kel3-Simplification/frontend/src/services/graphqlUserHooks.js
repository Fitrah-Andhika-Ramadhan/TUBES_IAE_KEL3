import { useQuery, useMutation } from '@apollo/client';
import {
  LOGIN,
  REGISTER,
  GET_PROFILE,
  UPDATE_PROFILE,
} from './graphqlUserQueries';

// Mutation Hooks
export function useLogin(options = {}) {
  return useMutation(LOGIN, options);
}

export function useRegister(options = {}) {
  return useMutation(REGISTER, options);
}

export function useUpdateProfile(options = {}) {
  return useMutation(UPDATE_PROFILE, options);
}

// Query Hooks
export function useProfile(options = {}) {
  return useQuery(GET_PROFILE, options);
}
