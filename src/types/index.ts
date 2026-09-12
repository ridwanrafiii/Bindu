export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  name: string;
  dailyGoalMl: number;
  intervalMinutes: number;
  startHour: number;
  endHour: number;
  defaultDrinkMl: number;
  stopRemindersOnGoal: boolean;
  theme: Theme;
}

export interface DayLog {
  date: string;       // "YYYY-MM-DD"
  entries: number[];  // each tap value in ml
}

export const DEFAULT_SETTINGS: UserSettings = {
  name: '',
  dailyGoalMl: 2000,
  intervalMinutes: 60,
  startHour: 8,
  endHour: 22,
  defaultDrinkMl: 250,
  stopRemindersOnGoal: false,
  theme: 'system',
};
