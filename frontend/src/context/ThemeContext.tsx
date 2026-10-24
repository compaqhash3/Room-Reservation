import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from '@mui/material';

type Mode = 'light' | 'dark';
const ModeContext = createContext<{ mode: Mode; toggle: () => void }>({ mode: 'light', toggle: () => {} });
export const useThemeMode = () => useContext(ModeContext);

function initialMode(): Mode {
  const saved = localStorage.getItem('mode');
  if (saved === 'light' || saved === 'dark') return saved;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mode', next);
    setMode(next);
  };

  return (
    <ModeContext.Provider value={{ mode, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />       
        <GlobalStyles styles={{
          ':root': {
            '--fc-page-bg-color': theme.palette.background.paper,
            '--fc-neutral-bg-color': theme.palette.action.hover,
            '--fc-border-color': theme.palette.divider,
            '--fc-today-bg-color': mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,220,40,0.15)',
          },
          '.fc': { color: theme.palette.text.primary },
          '.fc a': { color: 'inherit' },
        }} />
        {children}
      </ThemeProvider>
    </ModeContext.Provider>
  );
}
