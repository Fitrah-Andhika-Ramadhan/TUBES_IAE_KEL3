import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import './HotelList.css';

export default function HotelList({ hotels, loading, error, selectedDate }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading hotels: {error.message}</Alert>;
  }

  if (!hotels || hotels.length === 0) {
    return (
        <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
            No hotels found for the selected criteria.
            </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} alignItems="stretch">
      {hotels.map((hotel) => (
        <Grid item xs={12} sm={6} md={4} key={hotel.id} sx={{ display: 'flex', height: '100%' }}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
            <CardMedia
              component="img"
              sx={{ width: '100%', height: 100, objectFit: 'cover' }}
              image={hotel.imageUrl || '/hotel-placeholder.jpg'}
              alt={hotel.name}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <CardContent sx={{ flex: '1 1 auto', pb: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography component="div" variant="h6">
                      {hotel.name}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5} mb={1}>
                      <Rating value={hotel.stars || 0} precision={0.5} readOnly size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {[hotel.address.city, hotel.address.province].filter(Boolean).join(', ')}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {hotel.description || 'No description available.'}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={Link}
                  to={`/hotels/${hotel.id}?date=${selectedDate}`}
                  variant="contained"
                  size="small"
                  disabled={!selectedDate}
                >
                  View Details
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
