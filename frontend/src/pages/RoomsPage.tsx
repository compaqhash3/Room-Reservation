import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { api, toQuery } from '../api';
import { MultiSelect } from '../components/SelectFields';
import StatusChip from '../components/StatusChip';
import { useToast } from '../context/ToastContext';
import { useFetch } from '../hooks/useFetch';
import { EQUIPMENT, type Equipment, type Room } from '../types';
import { imageUrl, label } from '../utils/format';
import RoomFormDialog from './RoomFormDialog';

export default function RoomsPage() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [minCapacity, setMinCapacity] = useState('');
  const [floor, setFloor] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [editing, setEditing] = useState<Room | 'new' | null>(null);

  const { data: rooms, reload } = useFetch<Room[]>(
    () => api.get(`/api/rooms${toQuery({ minCapacity, floor, equipment })}`),
    [minCapacity, floor, equipment.join()], []);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Rooms</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setEditing('new')}>Add room</Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField size="small" type="number" label="Min capacity" value={minCapacity} onChange={e => setMinCapacity(e.target.value)} />
        <TextField size="small" type="number" label="Floor" value={floor} onChange={e => setFloor(e.target.value)} />
        <MultiSelect label="Equipment" value={equipment} onChange={setEquipment} options={EQUIPMENT.map(e => ({ value: e, label: label(e) }))} />
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell /><TableCell>Number</TableCell><TableCell>Name</TableCell><TableCell>Capacity</TableCell>
              <TableCell>Floor</TableCell><TableCell>Equipment</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map(room => (
              <TableRow key={room.id} hover>
                <TableCell><Avatar variant="rounded" src={imageUrl(room.imageUrl)}>{room.name[0]}</Avatar></TableCell>
                <TableCell>{room.number}</TableCell>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>{room.floor}</TableCell>
                <TableCell>{room.equipment.map(e => <Chip key={e} size="small" label={label(e)} sx={{ mr: 0.5 }} />)}</TableCell>
                <TableCell><StatusChip status={room.isActive ? 'Active' : 'Inactive'} /></TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<Visibility />} onClick={() => navigate(`/rooms/${room.id}`)}>View</Button>
                  <IconButton onClick={() => setEditing(room)}><Edit /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rooms.length === 0 && <TableRow><TableCell colSpan={8} align="center">No rooms found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>

      {editing && (
        <RoomFormDialog room={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }} />
      )}
    </>
  );
}
