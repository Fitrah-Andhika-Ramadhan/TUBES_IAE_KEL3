import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../services/graphqlUserQueries';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext);

  const [loginMutation, { loading: loggingIn }] = useMutation(LOGIN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginMutation({ variables: { email, password } });
      if (data.login.status === 'success' && data.login.user && data.login.token) {
        login(data.login.user, data.login.token); // Use login from AuthContext
        navigate('/');
      } else {
        setError(data.login.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={6}>
      <Typography variant="h5" mb={2}>Login</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" required />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
      </form>
      <Button onClick={() => navigate('/register')} sx={{ mt: 2 }}>Don't have an account? Register</Button>
      <Button component={Link} to="/simple-external-login" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>Or, Login with External Service</Button>
    </Box>
  );
}
