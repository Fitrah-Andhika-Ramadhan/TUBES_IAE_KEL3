import React, { useState } from 'react';
import { useFilterHotels } from '../services/graphqlHotelHooks';
import HotelList from '../components/hotels/HotelList';
import Pagination from '../components/common/Pagination';
import {
  Box, Typography, TextField, Button, Paper, Grid, Container, CircularProgress
} from '@mui/material';

export default function SearchHotels() {
  const [filters, setFilters] = useState({
    city: '',
    name: '', 
  });
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 9 });

  const queryFilters = {
    city: filters.city || null,
    name: filters.name || null,
  };

  const dailyStatusDateRange = {
    startDate: checkInDate,
    endDate: checkOutDate,
  };

  const { loading, error, data } = useFilterHotels({
    filters: queryFilters,
    pagination,
    dailyStatusDateRange,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCheckInDateChange = (e) => {
    setCheckInDate(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCheckOutDateChange = (e) => {
    setCheckOutDate(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearchFormSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const hotels = data?.filterHotels?.hotels || [];
  const paginationInfo = data?.filterHotels?.pagination;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" mb={3} align="center">Search for Hotels</Typography>
      <Paper component="form" onSubmit={handleSearchFormSubmit} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Hotel Name (Optional)"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Check-in Date"
              name="checkInDate"
              type="date"
              value={checkInDate}
              onChange={handleCheckInDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Check-out Date"
              name="checkOutDate"
              type="date"
              value={checkOutDate}
              onChange={handleCheckOutDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              type="submit" 
              variant="contained" 
              size="large" 
              sx={{ height: '56px' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <HotelList hotels={hotels} loading={loading} error={error} checkInDate={checkInDate} checkOutDate={checkOutDate} />

      {paginationInfo && paginationInfo.totalPages > 1 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={paginationInfo.totalPages}
            page={paginationInfo.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}
