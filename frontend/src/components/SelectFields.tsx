import { Checkbox, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

export interface Option<T> { value: T; label: string }

interface SingleProps<T> {
  label: string; value: T | ''; options: Option<T>[]; onChange: (value: T | '') => void; allowAll?: boolean;
}

export function SingleSelect<T extends string | number>({ label, value, options, onChange, allowAll = true }: SingleProps<T>) {
  return (
    <TextField select size="small" label={label} value={value} sx={{ minWidth: 170 }}
      onChange={e => onChange(e.target.value as T | '')}>
      {allowAll && <MenuItem value="">All</MenuItem>}
      {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </TextField>
  );
}

interface MultiProps<T> { label: string; value: T[]; options: Option<T>[]; onChange: (value: T[]) => void }

export function MultiSelect<T extends string | number>({ label, value, options, onChange }: MultiProps<T>) {
  const selectedLabels = options.filter(o => value.includes(o.value)).map(o => o.label).join(', ');

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{label}</InputLabel>
      <Select multiple label={label} value={value} onChange={e => onChange(e.target.value as T[])} renderValue={() => selectedLabels || 'All'}>
        {options.map(o => (
          <MenuItem key={o.value} value={o.value}>
            <Checkbox checked={value.includes(o.value)} />{o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
