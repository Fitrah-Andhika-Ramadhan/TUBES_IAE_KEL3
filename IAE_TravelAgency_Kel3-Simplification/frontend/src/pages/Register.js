import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../services/graphqlUserHooks';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
// Updated: phone_number, birth_date, no_nik are no longer required for registration.

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext);

  const [registerMutation, { loading: registering }] = useRegister();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Only include fields now required for registration
      const input = { email, password, full_name: fullName }; 
      const { data } = await registerMutation({ variables: { input } });
      if (data.register.status === 'success' && data.register.user && data.register.token) {
        // Optionally log the user in directly after registration
        // login(data.register.user, data.register.token);
        // setSuccess('Registration successful! You are now logged in.');
        // setTimeout(() => navigate('/'), 1200); // Navigate to home or dashboard
        
        // Or, as per original logic, prompt to login manually:
        setSuccess('Registration successful! Please login.');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setError(data.register.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={6}>
      <Typography variant="h5" mb={2}>Register</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" required />
        {/* Removed Phone Number, Birth Date, No NIK fields */}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
      </form>
      <Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>Already have an account? Login</Button>
    </Box>
  );
}
