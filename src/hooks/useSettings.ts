import { useState, useEffect, useCallback } from 'react';
import type { AppSettings, Theme } from '../types';

const defaultSettings: AppSettings = {
  theme: 'system',
  fontSize: 14,
  fontFamily: 'SF Mono, Monaco, monospace',
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
  autoSave: true,
  autoCheckUpdate: true,
  sidebarWidth: 220,
  sidebarTools: ['json', 'excel', 'diff', 'sql', 'markdown', 'case', 'converter', 'prompt'],
};

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function loadInitialSettings(): AppSettings {
  const stored = localStorage.getItem('cjie-toolbox-settings');
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
      console.error('Failed to parse settings');
    }
  }
  return defaultSettings;
}

function applyThemeToDocument(theme: Theme) {
  const actualTheme = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', actualTheme);
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadInitialSettings);

  useEffect(() => {
    applyThemeToDocument(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyThemeToDocument('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  useEffect(() => {
    applyThemeToDocument(settings.theme);
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('cjie-toolbox-settings', JSON.stringify(newSettings));
    if (updates.theme !== undefined) {
      applyThemeToDocument(updates.theme);
    }
  }, [settings]);

  return { settings, updateSettings };
}
