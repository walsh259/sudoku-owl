import React, { createContext, useContext, useMemo } from 'react';
import { useSettingsStore } from '../store';
import { getColors, ThemeColors, lightColors } from '../constants/theme';

interface ThemeContextType {
  colors: ThemeColors;
  nightMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  nightMode: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const nightMode = useSettingsStore((state) => state.nightMode);

  const value = useMemo(() => ({
    colors: getColors(nightMode),
    nightMode,
  }), [nightMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
