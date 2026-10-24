import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { Add, Cancel, CheckCircle, Edit, Visibility } from '@mui/icons-material';
import { ApiError, api, toQuery } from '../api';
import { SingleSelect } from '../components/SelectFields';
import StatusChip from '../components/StatusChip';
import { useToast } from '../context/ToastContext';
import { useFetch } from '../hooks/useFetch';
import { STATUSES, type Reservation, type ReservationStatus, type Room, type User } from '../types';
import { endOfDay, formatDateTime, startOfDay } from '../utils/format';
import ReservationFormDialog from './ReservationFormDialog';

export default function ReservationsPage() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const [roomId, setRoomId] = useState<number | ''>('');
  const [organizerId, setOrganizerId] = useState<number | ''>('');
  const [status, setStatus] = useState<ReservationStatus | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [editing, setEditing] = useState<Reservation | 'new' | null>(null);

  const { data: rooms } = useFetch<Room[]>(() => api.get('/api/rooms'), [], []);
  const { data: users } = useFetch<User[]>(() => api.get('/api/users'), [], []);
  const { data: reservations, reload } = useFetch<Reservation[]>(
    () => api.get(`/api/reservations${toQuery({ roomId, organizerId, status, from: startOfDay(from), to: endOfDay(to) })}`),
    [roomId, organizerId, status, from, to], []);

  const run = async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action();
      showSuccess(successMessage);
      reload();
    } catch (error) {
      showError(error instanceof ApiError ? `${error.code}: ${error.message}` : (error as Error).message);
    }
  };

  const dateField = (text: string, value: string, set: (v: string) => void) => (
    <TextField size="small" type="date" label={text} value={value} onChange={e => set(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
  );

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Reservations</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setEditing('new')}>New reservation</Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" useFlexGap>
        <SingleSelect label="Room" value={roomId} onChange={setRoomId} options={rooms.map(r => ({ value: r.id, label: r.name }))} />
        <SingleSelect label="Organizer" value={organizerId} onChange={setOrganizerId} options={users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} />
        <SingleSelect label="Status" value={status} onChange={setStatus} options={STATUSES.map(s => ({ value: s, label: s }))} />
        {dateField('From', from, setFrom)}
        {dateField('To', to, setTo)}
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Room</TableCell><TableCell>Organizer</TableCell><TableCell>Title</TableCell><TableCell>Start</TableCell>
              <TableCell>End</TableCell><TableCell>Attendees</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.roomName}</TableCell>
                <TableCell>{r.organizerName}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>{formatDateTime(r.start)}</TableCell>
                <TableCell>{formatDateTime(r.end)}</TableCell>
                <TableCell>{r.attendees}</TableCell>
                <TableCell><StatusChip status={r.status} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Button size="small" startIcon={<Visibility />} onClick={() => navigate(`/reservations/${r.id}`)}>View</Button>
                  {r.status === 'Booked' && (
                    <>
                      <Tooltip title="Edit"><IconButton onClick={() => setEditing(r)}><Edit /></IconButton></Tooltip>
                      <Tooltip title={new Date(r.start) > new Date() ? 'Not started yet. Cancel it instead.' : 'Complete (end meeting now)'}>
                        <span>
                          <IconButton color="success" disabled={new Date(r.start) > new Date()}
                            onClick={() => run(() => api.post(`/api/reservations/${r.id}/complete`), 'Meeting completed')}>
                            <CheckCircle />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton color="warning" onClick={() => confirm('Cancel this reservation?') && run(() => api.post(`/api/reservations/${r.id}/cancel`), 'Reservation cancelled')}><Cancel /></IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {reservations.length === 0 && <TableRow><TableCell colSpan={8} align="center">No reservations found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>

      {editing && (
        <ReservationFormDialog reservation={editing === 'new' ? undefined : editing} rooms={rooms} users={users}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      )}
    </>
  );
}
