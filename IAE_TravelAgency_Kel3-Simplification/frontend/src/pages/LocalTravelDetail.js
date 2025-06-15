import React, { useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLocalTravelDetail, useLocalTravelDailyStatus } from '../services/graphqlLocalTravelHooks';
import { useCreateBooking } from '../services/graphqlBookingHooks';
import { AuthContext } from '../context/AuthContext';
import {
  Typography, Box, CircularProgress, Button, Paper, Alert, Grid, Chip
} from '@mui/material';
import { Place as PlaceIcon, Commute as CommuteIcon, AttachMoney as AttachMoneyIcon, EventSeat as EventSeatIcon } from '@mui/icons-material';
import formatIDR from '../utils/formatIDR';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function LocalTravelDetail() {
  const { id: localTravelId } = useParams();
  const query = useQuery();
  const date = query.get('date');
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const { loading: detailLoading, error: detailError, data: detailData } = useLocalTravelDetail(localTravelId);
  const { loading: statusLoading, error: statusError, data: statusData } = useLocalTravelDailyStatus(localTravelId, date);

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

  const handleBooking = async () => {
    setBookingError(null);
    setBookingSuccess(null);

    if (!currentUser) {
      setBookingError('You must be logged in to book.');
      navigate('/login');
      return;
    }

    if (!dailyStatus) {
      setBookingError('This service is not available on the selected date.');
      return;
    }

    try {
      await createBooking({
        variables: {
          input: {
            userId: currentUser.uid,
            bookingType: 'LOCAL_TRAVEL',
            bookingDetails: {
              localTravelBookingDetails: {
                localTravelId: localTravelId,
                travelDate: date,
              }
            },
            totalAmount: dailyStatus.price,
            currency: 'IDR',
          }
        }
      });
    } catch (err) {
      console.error('Booking submission error:', err);
    }
  };

  const loading = detailLoading || statusLoading;
  const error = detailError || statusError;
  const travel = detailData?.localTravel;
  const dailyStatus = statusData?.localTravelDailyStatus;

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading details: {error.message}</Alert>;
  if (!travel) return <Alert severity="warning">Local travel service not found.</Alert>;

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>{travel.providerName}</Typography>
        <Chip icon={<CommuteIcon />} label={travel.vehicleModel} sx={{ mb: 2 }} />
        <Typography variant="h6">{travel.originCity} to {travel.destinationCity}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>on {new Date(date).toLocaleDateString()}</Typography>

        {dailyStatus ? (
          <Box mt={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>Availability & Price</Typography>
                <Chip icon={<AttachMoneyIcon />} label={`${formatIDR(dailyStatus.price)}`} color="success" sx={{ mr: 1, mb: 1 }} />
                <Chip icon={<EventSeatIcon />} label={`${dailyStatus.seatsAvailable} seats available`} sx={{ mb: 1 }} />
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBooking}
                  disabled={mutationLoading || dailyStatus.seatsAvailable <= 0}
                  sx={{ py: 1.5, px: 4 }}
                >
                  {mutationLoading ? <CircularProgress size={24} /> : 'Book Now'}
                </Button>
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
