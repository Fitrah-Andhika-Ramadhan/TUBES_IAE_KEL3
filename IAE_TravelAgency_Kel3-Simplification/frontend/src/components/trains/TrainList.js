import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, CardActions, Button, Chip
} from '@mui/material';
import { Train as TrainIcon, Tram as TramIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';

export default function TrainList({ trains, loading, error, selectedDate }) {

  if (loading) {
    return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">Error loading trains: {error.message}</Alert>;
  }

  if (!trains || trains.length === 0) {
    return <Alert severity="info">No trains found for the selected criteria.</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {trains.map((train) => (
        <Grid item key={train.id} xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                <TrainIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> {train.name}
              </Typography>
              <Chip icon={<TramIcon />} label={train.operator} size="small" sx={{ mb: 1 }} />
              <Box display="flex" alignItems="center" my={1}>
                <LocationOnIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {train.origin_station_name} - {train.destination_station_name}
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', p: 2 }}>
              <Button 
                component={Link} 
                to={`/trains/${train.id}?date=${selectedDate}`}
                variant="contained"
                size="small"
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
