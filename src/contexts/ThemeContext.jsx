import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'theme';
const ThemeContext = createContext(null);

const getSystemTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return 'system';
};

const applyResolvedTheme = (theme) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.setAttribute('data-theme', theme);
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(getStoredTheme);

  useEffect(() => {
    const resolvedTheme = themeMode === 'system' ? getSystemTheme() : themeMode;
    applyResolvedTheme(resolvedTheme);

    if (themeMode !== 'system') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyResolvedTheme(getSystemTheme());

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [themeMode]);

  const setThemeMode = (nextMode) => {
    if (!['light', 'dark', 'system'].includes(nextMode)) {
      return;
    }

    setThemeModeState(nextMode);
    if (nextMode === 'system') {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, nextMode);
  };

  const resolvedTheme = themeMode === 'system' ? getSystemTheme() : themeMode;

  const value = useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode,
      toggleTheme: () => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark'),
    }),
    [themeMode, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

