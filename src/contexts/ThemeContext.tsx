import { useState, useEffect, type ReactNode } from 'react';
import {
  THEME_STORAGE_KEY,
  type Theme,
  getSystemTheme,
  applyTheme,
  getInitialTheme,
} from '@/lib/theme';
import { ThemeContext } from './ThemeContextValue';

// Re-export ThemeContext for convenience
export { ThemeContext };

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Update isDark based on current theme
    if (theme === 'system') {
      setIsDark(getSystemTheme() === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme]);

  // Listen for system theme changes when using 'system' theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
        setIsDark(getSystemTheme() === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    const root = window.document.documentElement;
    if (!root.classList.contains('light') && !root.classList.contains('dark')) {
      applyTheme(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
