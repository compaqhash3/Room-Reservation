import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { api } from '../api';
import ImageField from '../components/ImageField';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { User, UserRequest } from '../types';

interface Props { user?: User; onClose: () => void; onSaved: () => void }

export default function UserFormDialog({ user, onClose, onSaved }: Props) {
  const { showError, showSuccess } = useToast();
  const auth = useAuth();
  const [form, setForm] = useState<UserRequest>({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' });
  const [file, setFile] = useState<File | null>(null);

  const save = async () => {
    try {
      const saved = user ? await api.put<User>(`/api/users/${user.id}`, form) : await api.post<User>('/api/users', form);
      const final = file ? await api.upload<User>(`/api/users/${saved.id}/image`, file) : saved;
      if (auth.user?.id === final.id) auth.login(final);
      showSuccess('User saved');
      onSaved();
    } catch (error) {
      showError((error as Error).message);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{user ? 'Edit user' : 'Add user'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <ImageField file={file} currentPath={user?.imageUrl} onChange={setFile} />
          <TextField label="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          <TextField label="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
