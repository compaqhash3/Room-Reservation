import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Autocomplete, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import type { User } from '../types';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { data: users } = useFetch<User[]>(() => api.get('/api/users'), [], []);
  const [selected, setSelected] = useState<User | null>(null);

  if (user) return <Navigate to="/rooms" replace />;

  const handleLogin = () => {
    if (!selected) return;
    login(selected);
    navigate('/rooms');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Paper sx={{ p: 4, width: 380 }}>
        <Typography variant="h5" gutterBottom>Room Reservation System</Typography>
        <Autocomplete
          options={users}
          value={selected}
          onChange={(_, value) => setSelected(value)}
          getOptionLabel={u => `${u.firstName} ${u.lastName}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={params => <TextField {...params} label="Select user" margin="normal" />}
        />
        <Button fullWidth variant="contained" sx={{ mt: 2 }} disabled={!selected} onClick={handleLogin}>Login</Button>
      </Paper>
    </Box>
  );
}
