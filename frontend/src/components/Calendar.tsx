import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { api, toQuery } from '../api';
import type { Reservation } from '../types';

interface Props { roomId: number; initialDate?: string; highlightId?: number }

export default function Calendar({ roomId, initialDate, highlightId }: Props) {
  const loadEvents = async (range: { start: Date; end: Date }) => {
    const query = toQuery({ roomId, from: range.start.toISOString(), to: range.end.toISOString() });
    const reservations = await api.get<Reservation[]>(`/api/reservations${query}`);

    return reservations
      .filter(r => r.status !== 'Cancelled')
      .map(r => ({
        id: String(r.id),
        title: `${r.title} (${r.organizerName})`,
        start: r.start,
        end: r.end,
        color: r.status === 'Completed' ? '#2e7d32' : '#1976d2',
        borderColor: r.id === highlightId ? '#000' : undefined,
      }));
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="timeGridWeek"
      initialDate={initialDate}
      height={720}
      nowIndicator
      headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
      events={loadEvents}
    />
  );
}
