import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; // To provide routing context
import { MockedProvider } from '@apollo/client/testing';
import SimpleExternalLoginPage from './SimpleExternalLoginPage';
import { LOGIN_WITH_SIMPLE_EXTERNAL_SERVICE } from '../services/graphqlUserMutations';

// Helper function to wrap component with providers
const renderWithProviders = (ui, { mocks = [] } = {}) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('SimpleExternalLoginPage', () => {
  it('renders the login form correctly', () => {
    renderWithProviders(<SimpleExternalLoginPage />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/External Service Login/i)).toBeInTheDocument();
  });

  it('allows typing into email and password fields', () => {
    renderWithProviders(<SimpleExternalLoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByPlaceholderText(/email/i).value).toBe('test@example.com');
    expect(screen.getByPlaceholderText(/password/i).value).toBe('password123');
  });

  it('shows a success message on successful login', async () => {
    const mockSuccess = {
      request: {
        query: LOGIN_WITH_SIMPLE_EXTERNAL_SERVICE,
        variables: { email: 'user@example.com', password: 'password' },
      },
      result: {
        data: {
          loginWithSimpleExternalService: {
            success: true,
            message: 'Login successful!',
          },
        },
      },
    };

    renderWithProviders(<SimpleExternalLoginPage />, { mocks: [mockSuccess] });

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Login successful!')).toBeInTheDocument();
    });
  });

  it('shows an error message on failed login (server-side error)', async () => {
    const mockFailure = {
      request: {
        query: LOGIN_WITH_SIMPLE_EXTERNAL_SERVICE,
        variables: { email: 'wrong@example.com', password: 'wrongpassword' },
      },
      result: {
        data: {
          loginWithSimpleExternalService: {
            success: false,
            message: 'Invalid credentials.',
          },
        },
      },
    };

    renderWithProviders(<SimpleExternalLoginPage />, { mocks: [mockFailure] });

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials.')).toBeInTheDocument();
    });
  });

  it('shows an error message on network/GraphQL error', async () => {
    const mockGraphQLError = {
      request: {
        query: LOGIN_WITH_SIMPLE_EXTERNAL_SERVICE,
        variables: { email: 'error@example.com', password: 'errorpassword' },
      },
      error: new Error('An API error occurred'),
    };

    renderWithProviders(<SimpleExternalLoginPage />, { mocks: [mockGraphQLError] });

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'error@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'errorpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      // The component's onError handler defaults to error.message or 'An unexpected error occurred.'
      expect(screen.getByText('An API error occurred')).toBeInTheDocument();
    });
  });
});
