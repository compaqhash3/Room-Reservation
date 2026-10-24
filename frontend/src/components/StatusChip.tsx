import { Chip } from '@mui/material';

const colors = { Booked: 'primary', Completed: 'success', Cancelled: 'default', Active: 'success', Inactive: 'error' } as const;

export default function StatusChip({ status }: { status: keyof typeof colors }) {
  return <Chip size="small" label={status} color={colors[status]} />;
}
