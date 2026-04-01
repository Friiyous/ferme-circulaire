'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import { farmTheme, farmThemeDark } from '@/lib/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('ferme_dark_mode');
    if (saved === 'true') setIsDarkMode(true);
    else if (saved === 'false') setIsDarkMode(false);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem('ferme_dark_mode', String(newValue));
  };

  const theme = isDarkMode ? farmThemeDark : farmTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <ConfigProvider theme={theme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}