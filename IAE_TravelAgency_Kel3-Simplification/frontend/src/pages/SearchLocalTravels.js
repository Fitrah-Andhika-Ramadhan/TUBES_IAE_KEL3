import React, { useState } from 'react';
import { useFilterLocalTravels } from '../services/graphqlLocalTravelHooks';
import { 
  Container, Typography, Box, Paper, Grid, TextField, Button, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import Pagination from '../components/common/Pagination';
import LocalTravelList from '../components/localtravel/LocalTravelList';

const travelTypes = ['TAXI', 'BUS', 'ANGKOT', 'OJEK', 'RENTAL_CAR', 'BECAK'];

export default function SearchLocalTravels() {
  const [filters, setFilters] = useState({
    originCity: '',
    destinationCity: '',
    type: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });
  const [page, setPage] = useState(1);
  const limit = 9;

  const { loading, error, data } = useFilterLocalTravels({
    filters: {
      originCity: filters.originCity || null,
      destinationCity: filters.destinationCity || null,
      type: filters.type || null,
    },
    statusDate: filters.date,
    pagination: {
      page: page,
      limit: limit,
    },
  });

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on any filter change
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
  };

  const localTravels = data?.filterLocalTravels?.data || [];
  const pagination = data?.filterLocalTravels?.pagination;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" mb={3} align="center">Search for Local Travel</Typography>
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
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel id="type-select-label">Type</InputLabel>
              <Select
                labelId="type-select-label"
                name="type"
                value={filters.type}
                label="Type"
                onChange={handleFilterChange}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                {travelTypes.map(type => (
                  <MenuItem key={type} value={type}>{type.replace('_', ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
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
          <Grid item xs={12} sm={2}>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleSearch} 
              disabled={loading}
              sx={{ height: '56px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <LocalTravelList 
        localTravels={localTravels}
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
