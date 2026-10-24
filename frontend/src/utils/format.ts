import { API_URL } from '../api';

export const label = (text: string) => text.replace(/([a-z])([A-Z])/g, '$1 $2');

export const imageUrl = (path?: string | null) => (path ? API_URL + path : undefined);

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export function toInputValue(iso: string): string {
  const date = new Date(iso);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export const startOfDay = (day: string) => (day ? new Date(`${day}T00:00:00`).toISOString() : '');
export const endOfDay = (day: string) => (day ? new Date(`${day}T23:59:59`).toISOString() : '');
