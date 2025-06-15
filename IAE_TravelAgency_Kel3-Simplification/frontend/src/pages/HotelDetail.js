import React, { useState, useContext, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useHotelDetail, useHotelDailyStatus } from '../services/graphqlHotelHooks';

import { AuthContext } from '../context/AuthContext';
import {
  Typography, Box, CircularProgress, Button, TextField, Grid, FormControl, 
  InputLabel, Select, MenuItem, Paper, Alert, Rating
} from '@mui/material';
import formatIDR from '../utils/formatIDR';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function HotelDetail() {
  const { id: hotelId } = useParams();
  const query = useQuery();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // State for booking form
  const [checkInDate, setCheckInDate] = useState(query.get('date') || new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRoomTypeName, setSelectedRoomTypeName] = useState('');
  const [numberOfRooms, setNumberOfRooms] = useState(1);

  // Data fetching hooks
  const { loading: hotelLoading, error: hotelError, data: hotelData } = useHotelDetail(hotelId);
  const { loading: statusLoading, error: statusError, data: statusData } = useHotelDailyStatus(hotelId, checkInDate);

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const nights = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
    return nights > 0 ? nights : 0;
  }, [checkInDate, checkOutDate]);

  const handleProceedToSummary = (event) => {
    event.preventDefault();

    if (!currentUser) {
      setBookingError('You must be logged in to book.');
      navigate('/login');
      return;
    }

    const selectedRoom = statusData?.hotelDailyStatus?.find(r => r.roomTypeName === selectedRoomTypeName);

    if (!selectedRoom || nights <= 0 || numberOfRooms <= 0) {
      // Consider setting an error state to display to the user
      alert('Please select a valid room, check-in/out dates, and number of rooms.');
      return;
    }

    const bookingDetails = {
      hotelId: hotelId,
      hotelName: hotel.name, // Assuming 'hotel' object is available from useHotelDetail
      roomTypeName: selectedRoomTypeName,
      roomPrice: selectedRoom.price,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      nights: nights,
      numberOfRooms: numberOfRooms,
      totalAmount: selectedRoom.price * nights * numberOfRooms,
      currency: 'IDR', // Or get from selectedRoom.currency if available
      userId: currentUser.uid,
      bookingType: 'HOTEL'
    };

    navigate('/booking-summary', { state: { hotelBooking: bookingDetails } });
  };

  const loading = hotelLoading || statusLoading;
  const error = hotelError || statusError;
  const hotel = hotelData?.hotel;
  const rooms = statusData?.hotelDailyStatus || [];
  const selectedRoomDetails = rooms.find(r => r.roomTypeName === selectedRoomTypeName);

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading hotel details: {error.message}</Alert>;
  if (!hotel) return <Alert severity="warning">Hotel not found.</Alert>;

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>{hotel.name}</Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Rating value={hotel.stars || 0} precision={0.5} readOnly />
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {`${hotel.address.street}, ${hotel.address.city}, ${hotel.address.province}`}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>{hotel.description}</Typography>

        <Typography variant="h5" mt={4} mb={2}>Book Your Stay</Typography>

        <Box component="form" onSubmit={handleProceedToSummary} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Check-in Date"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Check-out Date"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: checkInDate }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth required>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={selectedRoomTypeName}
                  label="Room Type"
                  onChange={(e) => setSelectedRoomTypeName(e.target.value)}
                  disabled={statusLoading || rooms.length === 0}
                >
                  {rooms.length > 0 ? rooms.map((room) => (
                    <MenuItem key={room.roomTypeName} value={room.roomTypeName} disabled={room.roomsAvailable <= 0}>
                      {`${room.roomTypeName} - ${formatIDR(room.price)}/night (${room.roomsAvailable} available)`}
                    </MenuItem>
                  )) : <MenuItem disabled>No rooms available for this date.</MenuItem>}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Number of Rooms"
                type="number"
                value={numberOfRooms}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val > 0) {
                    setNumberOfRooms(val);
                  } else {
                    setNumberOfRooms(1); // Or handle error
                  }
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: 1,
                  max: selectedRoomDetails ? selectedRoomDetails.availableRooms : 1,
                }}
                disabled={!selectedRoomTypeName || (selectedRoomDetails && selectedRoomDetails.availableRooms <= 0)}
              />
            </Grid>
          </Grid>

          <Button 
            type="submit"
            variant="contained" 
            color="primary" 
            disabled={!selectedRoomTypeName || nights <= 0 || numberOfRooms <= 0 || (selectedRoomDetails && selectedRoomDetails.availableRooms < numberOfRooms)}
            sx={{ mt: 3, width: '100%' }}
          >
            {`Proceed to Summary (${nights} night(s), ${numberOfRooms} room(s))`}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
