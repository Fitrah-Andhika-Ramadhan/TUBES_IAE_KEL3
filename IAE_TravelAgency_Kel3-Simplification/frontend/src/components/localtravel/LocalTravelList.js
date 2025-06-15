import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid, Card, CardContent, CardActions, Button, Typography, Box, CircularProgress, Alert, Chip
} from '@mui/material';
import { Place as PlaceIcon, DirectionsCar as DirectionsCarIcon, Commute as CommuteIcon } from '@mui/icons-material';

const getTravelTypeIcon = (type) => {
  switch ((type || '').toLowerCase()) {
    case 'taxi': return '🚕';
    case 'ojek': return '🛵';
    case 'angkot': return '🚐';
    case 'bus': return '🚌';
    case 'becak': return '🛺';
    case 'rental car': return '🚗';
    default: return <DirectionsCarIcon />;
  }
};

export default function LocalTravelList({ localTravels, loading, error, selectedDate }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error fetching local travel options: {error.message}</Alert>;
  }

  if (localTravels.length === 0) {
    return <Alert severity="info">No local travel options found for the selected criteria.</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {localTravels.map((item) => (
        <Grid item key={item.id} xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                {getTravelTypeIcon(item.type)} {item.name}
              </Typography>
              <Chip icon={<CommuteIcon />} label={item.vehicle_model} size="small" sx={{ mb: 1 }} />
              <Box display="flex" alignItems="center" mb={1}>
                <PlaceIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {item.origin} to {item.destination}
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Button
                component={RouterLink}
                to={`/local-travel/${item.id}?date=${selectedDate}`}
                size="small"
                variant="contained"
              >
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
