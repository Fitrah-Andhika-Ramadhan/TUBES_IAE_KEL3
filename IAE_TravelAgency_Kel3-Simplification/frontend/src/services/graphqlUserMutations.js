import { gql } from '@apollo/client';

export const LOGIN_WITH_SIMPLE_EXTERNAL_SERVICE = gql`
  mutation LoginWithSimpleExternalService($email: String!, $password: String!) {
    loginWithSimpleExternalService(email: $email, password: $password) {
      success
      message
    }
  }
`;
