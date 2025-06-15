import React, { useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTrainDetail, useTrainDailyStatus } from '../services/graphqlTrainHooks';
import { useCreateBooking } from '../services/graphqlBookingHooks';
import { AuthContext } from '../context/AuthContext';
import {
  Typography, Box, CircularProgress, Button, TextField, Paper, Alert, Grid, Chip
} from '@mui/material';
import { Train as TrainIcon, Tram as TramIcon, EventSeat as EventSeatIcon, AttachMoney as AttachMoneyIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
import formatIDR from '../utils/formatIDR';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function TrainDetail() {
  const { id: trainId } = useParams();
  const query = useQuery();
  const date = query.get('date');
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const { loading: trainLoading, error: trainError, data: trainData } = useTrainDetail(trainId);
  const { loading: statusLoading, error: statusError, data: statusData } = useTrainDailyStatus(trainId, date);

  const [createBooking, { loading: mutationLoading }] = useCreateBooking({
    onCompleted: (data) => {
      setBookingSuccess(`Booking successful! ID: ${data.createBooking.id}. Redirecting...`);
      setBookingError(null);
      setTimeout(() => navigate('/my-bookings'), 3000);
    },
    onError: (error) => {
      setBookingError(`Booking failed: ${error.message}`);
      setBookingSuccess(null);
    }
  });

  const handleBooking = async (event) => {
    event.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (!currentUser) {
      setBookingError('You must be logged in to book.');
      navigate('/login');
      return;
    }

    if (!dailyStatus || numberOfSeats <= 0) {
      setBookingError('This train is not available on the selected date, or seat quantity is invalid.');
      return;
    }

    try {
      await createBooking({
        variables: {
          input: {
            userId: currentUser.uid,
            bookingType: 'TRAIN',
            bookingDetails: {
              trainBookingDetails: {
                trainId: trainId,
                departureDate: date,
                numberOfSeats: parseInt(numberOfSeats, 10),
              }
            },
            totalAmount: dailyStatus.price * parseInt(numberOfSeats, 10),
            currency: 'IDR',
          }
        }
      });
    } catch (err) {
      console.error('Booking submission error:', err);
    }
  };

  const loading = trainLoading || statusLoading;
  const error = trainError || statusError;
  const train = trainData?.train;
  const dailyStatus = statusData?.trainDailyStatus;

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading train details: {error.message}</Alert>;
  if (!train) return <Alert severity="warning">Train not found.</Alert>;

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>{train.trainName}</Typography>
        <Chip icon={<TramIcon />} label={train.operatorName} sx={{ mb: 2 }} />
        <Typography variant="h6">{train.originStation.name} to {train.destinationStation.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>on {new Date(date).toLocaleDateString()}</Typography>

        {dailyStatus ? (
          <Box mt={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Schedule & Price</Typography>
                <Chip icon={<AccessTimeIcon />} label={`Departure: ${dailyStatus.departureTime}`} sx={{ mr: 1, mb: 1 }} />
                <Chip icon={<AccessTimeIcon />} label={`Arrival: ${dailyStatus.arrivalTime}`} sx={{ mb: 1 }} />
                <Chip icon={<AttachMoneyIcon />} label={`${formatIDR(dailyStatus.price)} / seat`} color="success" sx={{ mr: 1, mb: 1 }} />
                <Chip icon={<EventSeatIcon />} label={`${dailyStatus.seatsAvailable} seats available`} sx={{ mb: 1 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Book Your Seats</Typography>
                <Box component="form" onSubmit={handleBooking} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Number of Seats"
                    type="number"
                    value={numberOfSeats}
                    onChange={(e) => setNumberOfSeats(e.target.value)}
                    InputProps={{ inputProps: { min: 1, max: dailyStatus.seatsAvailable } }}
                    disabled={mutationLoading}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={mutationLoading || numberOfSeats <= 0 || dailyStatus.seatsAvailable < numberOfSeats}
                  >
                    {mutationLoading ? <CircularProgress size={24} /> : `Book ${numberOfSeats} Seat(s)`}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Alert severity="warning" sx={{ mt: 3 }}>
            No schedule or pricing information available for the selected date.
          </Alert>
        )}

        {bookingSuccess && <Alert severity="success" sx={{ mt: 2 }}>{bookingSuccess}</Alert>}
        {bookingError && <Alert severity="error" sx={{ mt: 2 }}>{bookingError}</Alert>}
      </Paper>
    </Box>
  );
}
