import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, type ThemeScheme } from '@/shared/design-system/colors';

export type ThemeMode = ThemeScheme | 'system';

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: ThemeScheme;
  colors: (typeof Colors)[ThemeScheme];
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type AppThemeProviderProps = {
  children: ReactNode;
  initialMode?: ThemeMode;
};

export function AppThemeProvider({ children, initialMode = 'system' }: AppThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const scheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const value = useMemo(
    () => ({ mode, scheme, colors: Colors[scheme], setMode }),
    [mode, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }

  return theme;
}
