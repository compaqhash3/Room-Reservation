import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { api } from '../api';
import Calendar from '../components/Calendar';
import StatusChip from '../components/StatusChip';
import { useFetch } from '../hooks/useFetch';
import type { Room } from '../types';
import { imageUrl, label } from '../utils/format';

export default function RoomDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: room } = useFetch<Room | null>(() => api.get(`/api/rooms/${id}`), [id], null);

  return (
    <>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/rooms')} sx={{ mb: 2 }}>Back</Button>
      {room && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box component="img" src={imageUrl(room.imageUrl)} alt="" sx={{ width: 280, height: 190, objectFit: 'cover', borderRadius: 1, bgcolor: 'action.hover' }} />
              <Stack spacing={0.5}>
                <Typography variant="h5">{room.name} <StatusChip status={room.isActive ? 'Active' : 'Inactive'} /></Typography>
                <Typography>Number: {room.number}</Typography>
                <Typography>Capacity: {room.capacity}</Typography>
                <Typography>Floor: {room.floor}</Typography>
                <Typography>Location: {room.description || '-'}</Typography>
                <Stack direction="row" spacing={0.5}>
                  {room.equipment.length > 0
                    ? room.equipment.map(e => <Chip key={e} size="small" label={label(e)} />)
                    : <Typography>No equipment</Typography>}
                </Stack>
              </Stack>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2 }}><Calendar roomId={room.id} /></Paper>
        </>
      )}
    </>
  );
}
