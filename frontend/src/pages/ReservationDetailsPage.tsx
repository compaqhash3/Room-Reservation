import { useNavigate, useParams } from 'react-router-dom';
import { Button, Grid, Paper, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { api } from '../api';
import Calendar from '../components/Calendar';
import StatusChip from '../components/StatusChip';
import { useFetch } from '../hooks/useFetch';
import type { Reservation } from '../types';
import { formatDateTime } from '../utils/format';

export default function ReservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: reservation } = useFetch<Reservation | null>(() => api.get(`/api/reservations/${id}`), [id], null);

  const details = reservation && [
    ['Room', reservation.roomName],
    ['Organizer', reservation.organizerName],
    ['Meeting title', reservation.title],
    ['Start', formatDateTime(reservation.start)],
    ['End', formatDateTime(reservation.end)],
    ['Attendees', reservation.attendees],
  ];

  return (
    <>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/reservations')} sx={{ mb: 2 }}>Back</Button>
      {reservation && details && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              {details.map(([name, value]) => (
                <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">{name}</Typography>
                  <Typography>{value}</Typography>
                </Grid>
              ))}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <div><StatusChip status={reservation.status} /></div>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Calendar roomId={reservation.roomId} initialDate={reservation.start} highlightId={reservation.id} />
          </Paper>
        </>
      )}
    </>
  );
}
