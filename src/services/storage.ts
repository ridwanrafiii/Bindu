import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, DayLog, DEFAULT_SETTINGS } from '../types';

const KEYS = {
  SETTINGS:  'bindu:settings',
  SETUP_DONE: 'bindu:setup_done',
  intake: (date: string) => `bindu:intake:${date}`,
};

// ─── Settings ────────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<UserSettings> {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  if (!raw) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function updateSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  const current = await loadSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return updated;
}

// ─── Setup flag ──────────────────────────────────────────────────────────────

export async function isSetupDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.SETUP_DONE);
  return val === 'true';
}

export async function markSetupDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETUP_DONE, 'true');
}

// ─── Water intake ─────────────────────────────────────────────────────────────

export async function loadDayLog(date: string): Promise<DayLog> {
  const raw = await AsyncStorage.getItem(KEYS.intake(date));
  if (!raw) return { date, entries: [] };
  try {
    const parsed = JSON.parse(raw);
    const validEntries = Array.isArray(parsed?.entries)
      ? parsed.entries.filter((n: any) => typeof n === 'number' && !isNaN(n) && n > 0)
      : [];
    return { date, entries: validEntries };
  } catch {
    return { date, entries: [] };
  }
}

export async function addWaterEntry(date: string, amountMl: number): Promise<DayLog> {
  console.log('[storage] addWaterEntry called:', { date, amountMl });
  if (typeof amountMl !== 'number' || isNaN(amountMl) || amountMl <= 0) {
    console.log('[storage] Invalid amount, returning existing log');
    return loadDayLog(date);
  }
  const log = await loadDayLog(date);
  console.log('[storage] Current log:', log);
  const updated: DayLog = { ...log, entries: [...log.entries, amountMl] };
  console.log('[storage] Updated log before save:', updated);
  await AsyncStorage.setItem(KEYS.intake(date), JSON.stringify(updated));
  console.log('[storage] Saved to AsyncStorage with key:', KEYS.intake(date));

  // Verify it was saved
  const verification = await AsyncStorage.getItem(KEYS.intake(date));
  console.log('[storage] Verification read:', verification);

  return updated;
}

export async function loadRecentLogs(days: number): Promise<DayLog[]> {
  const logs: DayLog[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = toDateString(d);
    const log = await loadDayLog(dateStr);
    logs.push(log);
  }
  return logs;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayString(): string {
  return toDateString(new Date());
}
