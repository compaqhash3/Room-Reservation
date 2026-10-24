import { Avatar, Button, Stack } from '@mui/material';
import { imageUrl } from '../utils/format';

interface Props { file: File | null; currentPath?: string; onChange: (file: File | null) => void }

export default function ImageField({ file, currentPath, onChange }: Props) {
  const preview = file ? URL.createObjectURL(file) : imageUrl(currentPath);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar variant="rounded" src={preview} sx={{ width: 72, height: 72 }} />
      <Button component="label" variant="outlined">
        Choose image
        <input hidden type="file" accept="image/*" onChange={e => onChange(e.target.files?.[0] ?? null)} />
      </Button>
    </Stack>
  );
}
