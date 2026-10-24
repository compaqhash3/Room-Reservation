import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, TextField } from '@mui/material';
import { api } from '../api';
import ImageField from '../components/ImageField';
import { MultiSelect } from '../components/SelectFields';
import { useToast } from '../context/ToastContext';
import { EQUIPMENT, type Room, type RoomRequest } from '../types';
import { label } from '../utils/format';

interface Props { room?: Room; onClose: () => void; onSaved: () => void }

export default function RoomFormDialog({ room, onClose, onSaved }: Props) {
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState<RoomRequest>({
    number: room?.number ?? '', name: room?.name ?? '', capacity: room?.capacity ?? 4, floor: room?.floor ?? 1,
    description: room?.description ?? '', equipment: room?.equipment ?? [], isActive: room?.isActive ?? true,
  });
  const [file, setFile] = useState<File | null>(null);

  const update = <K extends keyof RoomRequest>(key: K, value: RoomRequest[K]) => setForm(prev => ({ ...prev, [key]: value }));

  const save = async () => {
    try {
      const saved = room ? await api.put<Room>(`/api/rooms/${room.id}`, form) : await api.post<Room>('/api/rooms', form);
      if (file) await api.upload(`/api/rooms/${saved.id}/image`, file);
      showSuccess('Room saved');
      onSaved();
    } catch (error) {
      showError((error as Error).message);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{room ? 'Edit room' : 'Add room'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <ImageField file={file} currentPath={room?.imageUrl} onChange={setFile} />
          <Stack direction="row" spacing={2}>
            <TextField fullWidth label="Number" value={form.number} onChange={e => update('number', e.target.value)} />
            <TextField fullWidth label="Name" value={form.name} onChange={e => update('name', e.target.value)} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField fullWidth type="number" label="Capacity" value={form.capacity} onChange={e => update('capacity', Number(e.target.value))} />
            <TextField fullWidth type="number" label="Floor" value={form.floor} onChange={e => update('floor', Number(e.target.value))} />
          </Stack>
          <TextField label="Description / location" multiline rows={2} value={form.description} onChange={e => update('description', e.target.value)} />
          <MultiSelect label="Equipment" value={form.equipment} onChange={v => update('equipment', v)}
            options={EQUIPMENT.map(e => ({ value: e, label: label(e) }))} />
          <FormControlLabel label="Active (inactive rooms cannot be booked)"
            control={<Switch checked={form.isActive} onChange={e => update('isActive', e.target.checked)} />} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
