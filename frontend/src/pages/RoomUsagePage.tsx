import { useState } from 'react';
import { Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { api, toQuery } from '../api';
import { MultiSelect } from '../components/SelectFields';
import { useFetch } from '../hooks/useFetch';
import { STATUSES, type ReservationStatus, type Room, type RoomUsage } from '../types';
import { endOfDay, startOfDay } from '../utils/format';

const COLUMNS = ['Room', 'Reservations', 'Booked', 'Completed', 'Cancelled', 'Booked hours', 'Used hours', 'Utilization'];

export default function RoomUsagePage() {
  const [roomIds, setRoomIds] = useState<number[]>([]);
  const [statuses, setStatuses] = useState<ReservationStatus[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: rooms } = useFetch<Room[]>(() => api.get('/api/rooms'), [], []);
  const { data: rows } = useFetch<RoomUsage[]>(
    () => api.get(`/api/reports/room-usage${toQuery({ roomIds, status: statuses, from: startOfDay(from), to: endOfDay(to) })}`),
    [roomIds.join(), statuses.join(), from, to], []);

  const toCells = (r: RoomUsage) => [
    `${r.number} ${r.name}`, r.reservations, r.booked, r.completed, r.cancelled, r.bookedHours, r.usedHours, `${r.utilizationPercent}%`,
  ];

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Room usage report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Period: ${from || 'any'} to ${to || 'any'}   |   Status: ${statuses.join(', ') || 'All'}   |   Generated: ${new Date().toLocaleString()}`, 14, 23);
    autoTable(doc, { startY: 28, head: [COLUMNS], body: rows.map(toCells) });
    doc.save('room-usage-report.pdf');
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Room usage</Typography>
        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={exportPdf} disabled={rows.length === 0}>Export to PDF</Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" useFlexGap>
        <MultiSelect label="Rooms (empty = All)" value={roomIds} onChange={setRoomIds} options={rooms.map(r => ({ value: r.id, label: `${r.number} ${r.name}` }))} />
        <MultiSelect label="Reservation status" value={statuses} onChange={setStatuses} options={STATUSES.map(s => ({ value: s, label: s }))} />
        <TextField size="small" type="date" label="From" value={from} onChange={e => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField size="small" type="date" label="To" value={to} onChange={e => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>{COLUMNS.map((c, i) => <TableCell key={c} align={i === 0 ? 'left' : 'right'}>{c}</TableCell>)}</TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.roomId} hover>
                {toCells(row).map((cell, i) => <TableCell key={i} align={i === 0 ? 'left' : 'right'}>{cell}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
