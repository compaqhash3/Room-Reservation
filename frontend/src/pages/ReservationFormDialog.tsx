import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { ApiError, api } from '../api';
import { SingleSelect } from '../components/SelectFields';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Reservation, Room, User } from '../types';
import { toInputValue } from '../utils/format';

interface Props { reservation?: Reservation; rooms: Room[]; users: User[]; onClose: () => void; onSaved: () => void }

function defaultStart(): Date {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  start.setMinutes(0, 0, 0);
  return start;
}

export default function ReservationFormDialog({ reservation, rooms, users, onClose, onSaved }: Props) {
  const { user: currentUser } = useAuth();
  const { showSuccess } = useToast();
  const [error, setError] = useState('');

  const start = defaultStart();
  const [roomId, setRoomId] = useState<number | ''>(reservation?.roomId ?? '');
  const [organizerId, setOrganizerId] = useState<number | ''>(reservation?.organizerId ?? currentUser?.id ?? '');
  const [title, setTitle] = useState(reservation?.title ?? '');
  const [startText, setStartText] = useState(toInputValue(reservation?.start ?? start.toISOString()));
  const [endText, setEndText] = useState(toInputValue(reservation?.end ?? new Date(+start + 3600_000).toISOString()));
  const [attendees, setAttendees] = useState(reservation?.attendees ?? 2);

  const save = async () => {
    const body = {
      roomId: Number(roomId), organizerId: Number(organizerId), title, attendees,
      start: new Date(startText).toISOString(), end: new Date(endText).toISOString(),
    };
    try {
      if (reservation) await api.put(`/api/reservations/${reservation.id}`, body);
      else await api.post('/api/reservations', body);
      showSuccess('Reservation saved');
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? `${e.code}: ${e.message}` : (e as Error).message);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{reservation ? 'Edit reservation' : 'New reservation'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          <SingleSelect allowAll={false} label="Room" value={roomId} onChange={setRoomId}
            options={rooms.map(r => ({ value: r.id, label: `${r.name} (${r.capacity} seats)${r.isActive ? '' : ' - inactive'}` }))} />
          <SingleSelect allowAll={false} label="Organizer" value={organizerId} onChange={setOrganizerId}
            options={users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} />
          <TextField label="Meeting title" value={title} onChange={e => setTitle(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <TextField fullWidth type="datetime-local" label="Start" value={startText} onChange={e => setStartText(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth type="datetime-local" label="End" value={endText} onChange={e => setEndText(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          </Stack>
          <TextField type="number" label="Attendees" value={attendees} onChange={e => setAttendees(Number(e.target.value))} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
