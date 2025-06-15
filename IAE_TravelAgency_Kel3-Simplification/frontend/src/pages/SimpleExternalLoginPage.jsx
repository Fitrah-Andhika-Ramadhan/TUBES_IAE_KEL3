import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_WITH_SIMPLE_EXTERNAL_SERVICE } from '../services/graphqlUserMutations'; // Adjusted path
import { Link } from 'react-router-dom'; // For a link back to main login or home

// Basic styling (can be moved to a CSS file)
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  input: {
    marginBottom: '15px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  message: {
    marginTop: '15px',
    padding: '10px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  linkContainer: {
    marginTop: '20px',
  }
};

function SimpleExternalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const [loginWithSimpleExternal, { loading }] = useMutation(LOGIN_WITH_SIMPLE_EXTERNAL_SERVICE, {
    onCompleted: (data) => {
      const { success, message: responseMessage } = data.loginWithSimpleExternalService;
      setMessage({ text: responseMessage, type: success ? 'success' : 'error' });
      if (success) {
        // For a demo, we just show a success message.
        // In a real app, you might store a token, update auth context, and redirect.
        console.log('Login successful:', responseMessage);
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      setMessage({ text: error.message || 'An unexpected error occurred.', type: 'error' });
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null); // Clear previous messages
    try {
      await loginWithSimpleExternal({ variables: { email, password } });
    } catch (err) {
      // Error is handled by onError in useMutation
      console.error('Caught submit error (should be handled by useMutation onError):', err);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>External Service Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {message && (
          <div style={{ ...styles.message, ...(message.type === 'success' ? styles.successMessage : styles.errorMessage) }}>
            {message.text}
          </div>
        )}
      </form>
      <div style={styles.linkContainer}>
        <Link to="/login">Back to Main Login</Link> {/* Adjust link as needed */}
      </div>
    </div>
  );
}

export default SimpleExternalLoginPage;
