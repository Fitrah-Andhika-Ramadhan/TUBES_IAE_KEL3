import React, { useState } from 'react';
import { useFilterTrains } from '../services/graphqlTrainHooks';
import { 
  Container, Typography, Box, Paper, Grid, TextField, Button, CircularProgress 
} from '@mui/material';
import Pagination from '../components/common/Pagination';
import TrainList from '../components/trains/TrainList';

export default function SearchTrains() {
  const [filters, setFilters] = useState({
    originCity: '',
    destinationCity: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });
  const [page, setPage] = useState(1);
  const limit = 9;

  const { loading, error, data } = useFilterTrains({
    filters: {
      origin_station_name_contains: filters.originCity || null,
      destination_station_name_contains: filters.destinationCity || null,
    },
    pagination: {
      page: page,
      limit: limit,
    },
    statusDate: filters.date,
  });

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on any filter change
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
    // The query will automatically refetch because its variables (filters, page) have changed.
  };

  const trains = data?.filterTrains?.trains || [];
  const pagination = data?.filterTrains?.pagination;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" mb={3} align="center">Search for Trains</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Origin City"
              name="originCity"
              value={filters.originCity}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Destination City"
              name="destinationCity"
              value={filters.destinationCity}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleSearch} 
              disabled={loading}
              sx={{ height: '56px' }} // Match TextField height
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TrainList 
        trains={trains}
        loading={loading}
        error={error}
        selectedDate={filters.date}
      />

      {pagination && pagination.totalPages > 1 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}
