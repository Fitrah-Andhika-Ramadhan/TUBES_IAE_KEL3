import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Assuming AuthContext provides user ID
import { useMyBookings, useCancelBooking, useModifyBooking } from '../services/graphqlBookingHooks';
import { useCreatePayment } from '../services/graphqlPaymentHooks';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { SnackbarContext } from '../App';

export default function MyBookings() {
  const { currentUser } = useContext(AuthContext); // Get currentUser from AuthContext
  const { loading, error, data, refetch } = useMyBookings(currentUser?.id, {
    skip: !currentUser?.id,
  });
  const [cancelBooking] = useCancelBooking();
  const [modifyBooking] = useModifyBooking();
  const [createPayment, { loading: payLoading }] = useCreatePayment();
  const { showSnackbar } = React.useContext(SnackbarContext);

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking({ variables: { id: bookingId } });
      showSnackbar('Pemesanan berhasil dibatalkan!', 'success');
    } catch (err) {
      showSnackbar('Gagal membatalkan pemesanan: ' + (err.message || 'Terjadi kesalahan'), 'error');
    }
  };

  const handleModify = async (bookingId, newData) => {
    try {
      await modifyBooking({ variables: { bookingId: bookingId, items: newData } }); // Corrected variable names
      showSnackbar('Pemesanan berhasil diubah!', 'success');
    } catch (err) {
      showSnackbar('Gagal mengubah pemesanan: ' + (err.message || 'Terjadi kesalahan'), 'error');
    }
  };

  if (loading) return <Typography>Memuat daftar pemesanan...</Typography>;
  if (error) return <Typography color="error">Gagal memuat pemesanan: {error.message}</Typography>;

  // Payment dialog state
  const [openPay, setOpenPay] = React.useState(false);
  const [payBooking, setPayBooking] = React.useState(null);
  const [payMethod, setPayMethod] = React.useState('credit_card');
  const [payAmount, setPayAmount] = React.useState('');
  const [paymentReference, setPaymentReference] = React.useState(''); // Added for payment reference

  const handleOpenPay = (booking) => {
    setPayBooking(booking);
    setPayAmount(booking.amount_due || '');
    setPayMethod('credit_card'); // Reset to default
    setPaymentReference(''); // Reset payment reference
    setOpenPay(true);
  };

  // Define the handlePay function to handle the payment
  const handlePay = async () => {
    if (!payBooking) return;
    try {
      // Use the createPayment mutation to create a payment
      await createPayment({
        variables: {
          userId: payBooking.user_id,
          bookingId: payBooking.id,
          amount: parseFloat(payAmount),
          currency: "IDR", // Set default currency
          payment_method_type: payMethod,
          payment_reference: paymentReference || null // Pass payment reference, or null if empty
        }
      });
      showSnackbar('Pembayaran berhasil!', 'success');
      setOpenPay(false);
      refetch();
    } catch (err) {
      showSnackbar('Gagal melakukan pembayaran: ' + (err.message || 'Terjadi kesalahan'), 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2} align="center">Daftar Pemesanan Saya</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.getUserBookings && data.getUserBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>
                  {booking.items && booking.items.map(item => (
                    <div key={item.id}>
                      {item.type}: {item.details} (Date: {item.date})
                    </div>
                  ))}
                </TableCell>
                <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => handleCancel(booking.id)} color="error" variant="outlined" size="small" sx={{ mr: 1 }}>
                    Batalkan
                  </Button>
                  <Button onClick={() => handleOpenPay(booking)} color="primary" variant="contained" size="small">
                    Bayar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Payment Dialog */}
      <Dialog open={openPay} onClose={() => setOpenPay(false)}>
        <DialogTitle>Pembayaran</DialogTitle>
        <DialogContent>
          <Typography>Booking ID: {payBooking?.id}</Typography>
          <Typography>Status: {payBooking?.status}</Typography>
          <Box mt={2}>
            <TextField
              label="Jumlah"
              type="number"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="payment-method-label">Metode Pembayaran</InputLabel>
              <Select
                labelId="payment-method-label"
                id="payment-method-select"
                value={payMethod}
                label="Metode Pembayaran"
                onChange={e => setPayMethod(e.target.value)}
              >
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="e_wallet">E-Wallet</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Referensi Pembayaran (Opsional)"
              value={paymentReference}
              onChange={e => setPaymentReference(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPay(false)}>Batal</Button>
          <Button onClick={handlePay} disabled={payLoading} variant="contained" color="primary">
            {payLoading ? <CircularProgress size={24} /> : 'Bayar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
