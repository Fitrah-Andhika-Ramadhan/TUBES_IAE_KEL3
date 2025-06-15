import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Box, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';

export default function BookingSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hotelBookingDetails, setHotelBookingDetails] = useState(null);
  // bookingError, bookingSuccess, bookingId states are removed as booking creation moves to PaymentPage

  useEffect(() => {
    if (location.state?.hotelBooking) {
      setHotelBookingDetails(location.state.hotelBooking);
      // Clear localStorage for selectedHotel if we are using route state for this flow
      localStorage.removeItem('selectedHotel');
    }
  }, [location.state]);
  // TODO: If you have a booking summary query, import and use a modular hook for it as well.
  // useCreateBooking hook and its logic are moved to PaymentPage.js
  const [isLoading, setIsLoading] = useState(false); // For the button state if needed
  const { showSnackbar } = React.useContext(SnackbarContext);

  const selectedFlight = JSON.parse(localStorage.getItem('selectedFlight') || 'null');
  // selectedHotel from localStorage is now secondary to hotelBookingDetails from route state
  const selectedHotelFromStorage = JSON.parse(localStorage.getItem('selectedHotel') || 'null');
  const selectedLocalTravel = JSON.parse(localStorage.getItem('selectedLocalTravel') || 'null');
  const selectedTrain = JSON.parse(localStorage.getItem('selectedTrain') || 'null');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleProceedToPayment = () => {
    if (!user) {
      setBookingError('You must be logged in to book.');
      // navigate('/login'); // Or show login prompt
      return;
    }

    if (hotelBookingDetails) {
      navigate('/payment', { state: { hotelBooking: hotelBookingDetails } });
    } else {
      // Fallback or generic multi-item booking from localStorage (existing logic)
      // This part might need to be adjusted if the backend expects a unified input structure
      try {
        const bookingItems = [];
        if (selectedFlight) bookingItems.push({ type: 'flight', refId: selectedFlight.id, date: selectedFlight.departureDate }); // Assuming date is needed
        if (selectedHotelFromStorage) bookingItems.push({ type: 'hotel', refId: selectedHotelFromStorage.id, date: selectedHotelFromStorage.checkInDate }); // Assuming date is needed
        if (selectedLocalTravel) bookingItems.push({ type: 'local_travel', refId: selectedLocalTravel.id, date: selectedLocalTravel.travelDate }); // Assuming date is needed
        if (selectedTrain) bookingItems.push({ type: 'train', refId: selectedTrain.id, date: selectedTrain.departureDate }); // Assuming date is needed
        
        if (bookingItems.length === 0) {
          setBookingError('No items selected for booking.');
          return;
        }
        // This generic booking call might need to be aligned with the backend's expected CreateBookingInput structure
        // For now, assuming it's different or needs a different mutation/logic
        // showSnackbar('Generic booking for multiple items is not fully implemented with detailed input.', 'warning');
        alert('No hotel booking details found to proceed to payment.');
        // setBookingError('Generic multi-item booking needs review for input structure.');
        // localStorage.removeItem('selectedFlight');
        // localStorage.removeItem('selectedHotel');
        // localStorage.removeItem('selectedLocalTravel');
        // localStorage.removeItem('selectedTrain');
      } catch (err) {
        // Error is handled by useCreateBooking's onError
        console.error('Booking submission error (generic):', err);
      }
    }
  };

  // Removed old loading/error display. Error/success for booking is now on PaymentPage.



  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Typography variant="h5" mb={2}>Booking Summary</Typography>
      {/* Display general errors if any, e.g., if hotelBookingDetails is missing */}
      {isLoading && <Box display="flex" justifyContent="center" p={2}><CircularProgress /></Box>} 
      <Paper sx={{ p: 2, mb: 2 }}>
        {hotelBookingDetails ? (
          <Box>
            <Typography variant="h6">Hotel: {hotelBookingDetails.hotelName}</Typography>
            <Typography>Room: {hotelBookingDetails.roomTypeName}</Typography>
            <Typography>Check-in: {hotelBookingDetails.checkInDate}</Typography>
            <Typography>Check-out: {hotelBookingDetails.checkOutDate}</Typography>
            <Typography>Nights: {hotelBookingDetails.nights}</Typography>
            <Typography>Rooms: {hotelBookingDetails.numberOfRooms}</Typography>
            <Typography variant="subtitle1" sx={{mt: 1}}>Total: {hotelBookingDetails.currency} {hotelBookingDetails.totalAmount.toLocaleString()}</Typography>
          </Box>
        ) : (
          <Box>
            {/* Display other items from localStorage if any (existing logic) */}
            {selectedFlight && <Typography>Flight: {selectedFlight.flight_number} ({selectedFlight.origin} → {selectedFlight.destination})</Typography>}
            {selectedHotelFromStorage && <Typography>Hotel (from storage): {selectedHotelFromStorage.name} ({selectedHotelFromStorage.location})</Typography>}
            {selectedLocalTravel && <Typography>Local Travel: {selectedLocalTravel.name} ({selectedLocalTravel.type})</Typography>}
            {selectedTrain && <Typography>Train: {selectedTrain.name} ({selectedTrain.origin} → {selectedTrain.destination})</Typography>}
            {!(selectedFlight || selectedHotelFromStorage || selectedLocalTravel || selectedTrain) && <Typography>No item selected for booking.</Typography>}
          </Box>
        )}
      </Paper>
      <Button variant="contained" color="primary"
        disabled={!hotelBookingDetails || isLoading || !user} // Disable if no hotel details, or if navigating
        onClick={handleProceedToPayment}>
        {isLoading ? <CircularProgress size={24} /> : 'Proceed to Payment'}
      </Button>
      {!user && <Alert severity="warning" sx={{ mt: 2 }}>You must be logged in to confirm a booking.</Alert>}
    </Box>
  );
}
