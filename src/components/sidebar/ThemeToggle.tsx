import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, Monitor } from 'lucide-react';

const THEME_STORAGE_KEY = 'theme-preference';

type Theme = 'light' | 'dark' | 'system';

const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

const getInitialTheme = (): Theme => {
  // Priority: localStorage > system preference > default
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored;
  }
  return 'system';
};

const getThemeIcon = (theme: Theme) => {
  switch (theme) {
    case 'light':
      return <Sun className="h-4 w-4" />;
    case 'dark':
      return <Moon className="h-4 w-4" />;
    case 'system':
      return <Monitor className="h-4 w-4" />;
  }
};

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const { t } = useTranslations();

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system theme changes when using 'system' theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
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

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          data-testid="theme-toggle-trigger"
        >
          {getThemeIcon(theme)}
          <span className="flex-1 text-left">{t(`theme.${theme}`)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="theme-toggle-menu">
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          className={theme === 'light' ? 'bg-accent' : ''}
          data-testid="theme-option-light"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>{t('theme.light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          className={theme === 'dark' ? 'bg-accent' : ''}
          data-testid="theme-option-dark"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>{t('theme.dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          className={theme === 'system' ? 'bg-accent' : ''}
          data-testid="theme-option-system"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>{t('theme.system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
