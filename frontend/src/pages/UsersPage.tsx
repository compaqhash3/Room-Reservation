import { useState } from 'react';
import { Avatar, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFetch } from '../hooks/useFetch';
import type { User } from '../types';
import { imageUrl } from '../utils/format';
import UserFormDialog from './UserFormDialog';

export default function UsersPage() {
  const { showError } = useToast();
  const auth = useAuth();
  const { data: users, reload } = useFetch<User[]>(() => api.get('/api/users'), [], []);
  const [editing, setEditing] = useState<User | 'new' | null>(null); 

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Users</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setEditing('new')}>Add user</Button>
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell /><TableCell>ID</TableCell><TableCell>First name</TableCell><TableCell>Last name</TableCell>
              <TableCell>Active reservations</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id} hover>
                <TableCell><Avatar src={imageUrl(user.imageUrl)}>{user.firstName[0]}</Avatar></TableCell>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.activeReservations}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => setEditing(user)}><Edit /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {editing && (
        <UserFormDialog user={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }} />
      )}
    </>
  );
}
