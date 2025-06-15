import React, { useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGetFlightById } from '../services/graphqlFlightHooks';
import { useCreateBooking } from '../services/graphqlBookingHooks';
import { AuthContext } from '../context/AuthContext';
import {
  Typography, Box, CircularProgress, TextField, Button, Alert, Paper, Grid
} from '@mui/material';
import formatIDR from '../utils/formatIDR';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function FlightDetail() {
  const { id: flightId } = useParams();
  const query = useQuery();
  const date = query.get('date');
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const { loading: queryLoading, error: queryError, data } = useGetFlightById(flightId, date);

  const [createBooking, { loading: mutationLoading }] = useCreateBooking({
    onError: (error) => {
      setBookingError(`Booking failed: ${error.message}`);
      setBookingSuccess(null);
    },
    onCompleted: (data) => {
      setBookingSuccess(`Booking successful! Booking ID: ${data.createBooking.id}. You will be redirected shortly.`);
      setBookingError(null);
      setTimeout(() => navigate('/my-bookings'), 3000);
    }
  });

  const handleBooking = async (event) => {
    event.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (!currentUser) {
      setBookingError('You must be logged in to book a flight.');
      navigate('/login');
      return;
    }

    const passengers = parseInt(numberOfPassengers, 10);
    if (!flightId || passengers <= 0) {
      setBookingError('Please ensure all booking details are correct.');
      return;
    }

    const flight = data?.flight;
    if (!flight || !flight.dailyStatus) {
        setBookingError('Flight information is not available for the selected date.');
        return;
    }

    try {
      await createBooking({
        variables: {
          input: {
            userId: currentUser.uid, // Ensure you are using the correct user ID field from your auth context
            bookingType: 'FLIGHT',
            bookingDetails: {
              flightBookingDetails: {
                flightId: flightId,
                numberOfPassengers: passengers,
              }
            },
            totalAmount: flight.dailyStatus.price * passengers,
            currency: 'IDR',
          }
        }
      });
    } catch (err) {
      console.error('Booking submission error:', err);
    }
  };

  if (queryLoading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  if (queryError) return <Alert severity="error">Error loading flight details: {queryError.message}</Alert>;
  if (!data || !data.flight) return <Alert severity="warning">Flight details not found.</Alert>;

  const flight = data.flight;
  const dailyStatus = flight.dailyStatus;

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: '20px auto' }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" mb={3} align="center">Flight Details</Typography>
        
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Flight Information</Typography>
            <Typography><b>Airline:</b> {flight.airlineName}</Typography>
            <Typography><b>Flight Number:</b> {flight.flightNumber}</Typography>
            <Typography><b>Route:</b> {`${flight.origin.city} (${flight.origin.code})`} → {`${flight.destination.city} (${flight.destination.code})`}</Typography>
            <Typography><b>Departure:</b> {new Date(flight.departureTime).toLocaleString()}</Typography>
            <Typography><b>Arrival:</b> {new Date(flight.arrivalTime).toLocaleString()}</Typography>
            {dailyStatus ? (
              <>
                <Typography><b>Price per Ticket:</b> {formatIDR(dailyStatus.price)}</Typography>
                <Typography><b>Available Seats:</b> {dailyStatus.seatsAvailable}</Typography>
              </>
            ) : (
              <Typography color="error">Price and availability not available for the selected date.</Typography>
            )}
            {flight.description && <Typography><b>Notes:</b> {flight.description}</Typography>}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Booking Form</Typography>
            <Box component="form" onSubmit={handleBooking} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="numberOfPassengers"
                label="Number of Passengers"
                name="numberOfPassengers"
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                value={numberOfPassengers}
                onChange={(e) => setNumberOfPassengers(e.target.value)}
                disabled={mutationLoading || !dailyStatus}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={mutationLoading || !dailyStatus || parseInt(numberOfPassengers, 10) > dailyStatus.seatsAvailable}
              >
                {mutationLoading ? <CircularProgress size={24} /> : 'Book Now'}
              </Button>
              {dailyStatus && parseInt(numberOfPassengers, 10) > dailyStatus.seatsAvailable && (
                <Alert severity="warning" sx={{ mt: 1 }}>Number of passengers exceeds available seats.</Alert>
              )}
            </Box>
          </Grid>
        </Grid>

        {bookingError && <Alert severity="error" sx={{ mt: 2 }}>{bookingError}</Alert>}
        {bookingSuccess && <Alert severity="success" sx={{ mt: 2 }}>{bookingSuccess}</Alert>}
      </Paper>
    </Box>
  );
}
