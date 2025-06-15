import React, { useState } from 'react';
import { useFilterFlights } from '../services/graphqlFlightHooks';
import { Box, Typography, Paper, TextField, Button, Grid } from '@mui/material';
import FlightList from '../components/flights/FlightList';
import Pagination from '../components/common/Pagination';

export default function SearchFlights() {
  const [filters, setFilters] = useState({
    originCity: '',
    destinationCity: '',
  });
  const [statusDate, setStatusDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // Prepare filters for the hook, converting empty strings to null
  const queryFilters = {
    originCity: filters.originCity || null,
    destinationCity: filters.destinationCity || null,
  };

  const { loading, error, data } = useFilterFlights({
    filters: queryFilters,
    sort: {}, // Default sort, can be made configurable
    pagination,
    statusDate: statusDate,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const handleDateChange = (e) => {
    setStatusDate(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on date change
  };

  // Explicit search button click can still reset to page 1 if desired, or simply be removed
  // if real-time filtering is preferred without an explicit search action.
  const handleSearchFormSubmit = (e) => {
    e.preventDefault();
    // Data is already being fetched reactively. This can ensure page is reset if user clicks button.
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const flights = data?.filterFlights?.flights || [];
  const paginationInfo = data?.filterFlights?.pagination;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3} align="center">Cari Penerbangan</Typography>
      
      <Paper component="form" onSubmit={handleSearchFormSubmit} sx={{ p: 2, mb: 3 }}>
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
              name="statusDate"
              type="date"
              value={statusDate}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth type="submit" variant="contained" size="large">Search</Button>
          </Grid>
        </Grid>
      </Paper>

      <FlightList flights={flights} loading={loading} error={error} />

      {paginationInfo && paginationInfo.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={paginationInfo.totalPages}
            page={paginationInfo.page}
            onChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
}
