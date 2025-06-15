import { gql } from '@apollo/client';

// LOGIN mutation
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      status
      message
      token
      user {
        id
        fullName
        email
        phoneNumber
        birthDate
        noNik
      }
    }
  }
`;

// REGISTER mutation
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      status
      message
      token
      user {
        id
        fullName
        email
        phoneNumber
        birthDate
        noNik
      }
    }
  }
`;

// GET_PROFILE query
export const GET_PROFILE = gql`
  query GetProfile {
    profile {
      id
      full_name
      email
      phone_number
      birth_date
      no_nik
    }
  }
`;

// UPDATE_PROFILE mutation
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      full_name
      email
      phone_number
      birth_date
      no_nik
    }
  }
`;
