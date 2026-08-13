import { useState, useEffect } from 'react';

type Settings = {
  tableMode: boolean;
  wakeLock: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  tableMode: false,
  wakeLock: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('catan-settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('catan-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<Settings>) => {
    const next = { ...settings, ...updates };
    localStorage.setItem('catan-settings', JSON.stringify(next));
    setSettings(next);
  };

  return { settings, updateSettings };
}
