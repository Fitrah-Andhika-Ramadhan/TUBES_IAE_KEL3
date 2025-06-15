import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography, Button } from '@mui/material';
import formatIDR from '../../utils/formatIDR';

export default function FlightList({ flights, loading, error }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" sx={{ p: 2 }}>
        Error loading flights: {error.message}
      </Typography>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography>No flights found matching your criteria.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Airline</TableCell>
            <TableCell>Origin</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Departure</TableCell>
            <TableCell>Arrival</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {flights.map(flight => (
            <TableRow key={flight.id}>
              <TableCell>{flight.airline}</TableCell>
              <TableCell>{flight.origin_airport_iata}</TableCell>
              <TableCell>{flight.destination_airport_iata}</TableCell>
              <TableCell>{flight.departure_time}</TableCell>
              <TableCell>{flight.arrival_time}</TableCell>
              <TableCell>{flight.dailyStatus ? formatIDR(flight.dailyStatus.price) : 'N/A'}</TableCell>
              <TableCell>
                <Button
                  component={Link}
                  to={`/flights/${flight.id}?date=${flight.dailyStatus?.date}`}
                  variant="contained"
                  size="small"
                  disabled={!flight.dailyStatus}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
