import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, TextField, Grid, CircularProgress, Alert } from '@mui/material';
import { useCreateBooking } from '../services/graphqlBookingHooks'; // Assuming this hook is still relevant
import { AuthContext } from '../context/AuthContext'; // If needed for user ID
import formatIDR from '../utils/formatIDR';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = React.useContext(AuthContext); // Get current user if needed for booking

  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const [createBooking, { loading: mutationLoading, error: mutationError, data: mutationData }] = useCreateBooking({
    onCompleted: (data) => {
      setIsProcessing(false);
      // alert(`Booking successful! ID: ${data.createBooking.id}. Redirecting to My Bookings...`);
      navigate('/my-bookings', { replace: true });
    },
    onError: (error) => {
      setIsProcessing(false);
      setPaymentError(`Booking creation failed: ${error.message}`);
    }
  });

  useEffect(() => {
    if (location.state?.hotelBooking) {
      setBookingDetails(location.state.hotelBooking);
    } else {
      // If no booking details are passed, redirect or show an error
      // alert('No booking details found. Redirecting to home.');
      navigate('/');
    }
  }, [location.state, navigate]);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    setPaymentError(null);
    setIsProcessing(true);

    // Basic validation for mock form
    if (!cardNumber || !expiryDate || !cvv) {
      setPaymentError('Please fill in all payment fields.');
      setIsProcessing(false);
      return;
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Assuming payment is successful, proceed to create booking
    if (bookingDetails && currentUser) {
      try {
        await createBooking({
          variables: {
            input: {
              userId: currentUser.uid, // Ensure currentUser and uid are available
              bookingType: bookingDetails.bookingType,
              bookingDetails: {
                hotelBookingDetails: {
                  hotelId: bookingDetails.hotelId,
                  roomTypeName: bookingDetails.roomTypeName,
                  checkInDate: bookingDetails.checkInDate,
                  checkOutDate: bookingDetails.checkOutDate,
                  numberOfRooms: bookingDetails.numberOfRooms,
                }
              },
              totalAmount: bookingDetails.totalAmount,
              currency: bookingDetails.currency,
            }
          }
        });
      } catch (err) {
        // Error already handled by useCreateBooking's onError
        // but setIsProcessing might need to be called here if not caught by hook's onError
        setIsProcessing(false);
        setPaymentError(`An unexpected error occurred: ${err.message}`);
      }
    } else {
      setPaymentError('Booking details or user information is missing.');
      setIsProcessing(false);
    }
  };

  if (!bookingDetails) {
    return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 700, margin: 'auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>Payment</Typography>
        
        <Box mb={3}>
          <Typography variant="h6">Booking Summary</Typography>
          <Typography>Hotel: {bookingDetails.hotelName}</Typography>
          <Typography>Room: {bookingDetails.roomTypeName}</Typography>
          <Typography>Check-in: {bookingDetails.checkInDate}, Check-out: {bookingDetails.checkOutDate} ({bookingDetails.nights} nights)</Typography>
          <Typography>Rooms: {bookingDetails.numberOfRooms}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Total Amount: {formatIDR(bookingDetails.totalAmount)} {bookingDetails.currency}
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>Enter Payment Details</Typography>
        <Box component="form" onSubmit={handlePaymentSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Expiry Date (MM/YY)"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </Grid>
          </Grid>

          {paymentError && <Alert severity="error" sx={{ mt: 2 }}>{paymentError}</Alert>}
          {mutationError && <Alert severity="error" sx={{ mt: 2 }}>Booking Error: {mutationError.message}</Alert>} 

          <Button 
            type="submit"
            variant="contained" 
            color="primary" 
            disabled={isProcessing || mutationLoading}
            sx={{ mt: 3, width: '100%' }}
          >
            {isProcessing || mutationLoading ? <CircularProgress size={24} /> : 'Pay Now'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
