import { useState, useEffect, useCallback } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '../types';
import { loadSettings, saveSettings } from '../services/storage';

interface UseSettingsReturn {
  settings: UserSettings;
  loading: boolean;
  update: (partial: Partial<UserSettings>) => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = useCallback(async (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);

  return { settings, loading, update };
}
