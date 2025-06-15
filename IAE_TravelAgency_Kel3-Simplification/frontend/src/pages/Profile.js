import React from 'react';
import { useProfile, useUpdateProfile } from '../services/graphqlUserHooks';
import { Box, Typography, TextField, Button } from '@mui/material';
import { SnackbarContext } from '../App';


export default function Profile() {
  const { loading, error, data } = useProfile();
  const [updateProfile, { loading: updating }] = useUpdateProfile();
  const [profile, setProfile] = React.useState({ full_name: '', email: '', phone_number: '', birth_date: '', no_nik: '' });
  const { showSnackbar } = React.useContext(SnackbarContext);

  React.useEffect(() => {
    if (data && data.profile) {
      setProfile(data.profile);
    }
  }, [data]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ variables: { input: profile } });
      showSnackbar('Profil berhasil diperbarui!', 'success');
    } catch (err) {
      showSnackbar('Gagal memperbarui profil: ' + (err.message || 'Terjadi kesalahan'), 'error');
    }
  };

  if (loading) return <Typography>Memuat profil...</Typography>;
  if (error) return <Typography color="error">Gagal memuat profil: {error.message}</Typography>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2} align="center">Profil Pengguna</Typography>
      <TextField label="Nama Lengkap" name="full_name" value={profile.full_name} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Email" name="email" value={profile.email} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Nomor HP" name="phone_number" value={profile.phone_number} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Tanggal Lahir" name="birth_date" value={profile.birth_date} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="NIK" name="no_nik" value={profile.no_nik} onChange={handleChange} fullWidth margin="normal" />
      <Button type="submit" variant="contained" color="primary" disabled={updating} fullWidth sx={{ mt: 3 }}>
        {updating ? 'Memperbarui...' : 'Perbarui Profil'}
      </Button>
    </Box>
  );
}
