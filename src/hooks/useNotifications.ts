import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  registerNotificationResponseListener,
  scheduleWaterReminders,
} from '../services/notifications';
import { UserSettings } from '../types';

/**
 * Hook to manage notification lifecycle:
 * - Register response listener (Drink / Snooze actions)
 * - Schedule reminders when settings change
 * - Re-schedule when app returns to foreground
 */
export function useNotifications(
  settings: UserSettings,
  onWaterLogged?: () => void
) {
  useEffect(() => {
    // Register listener for notification actions
    registerNotificationResponseListener(onWaterLogged);
  }, [onWaterLogged]);

  useEffect(() => {
    // Schedule reminders on settings change
    scheduleWaterReminders(settings);
  }, [
    settings.startHour,
    settings.endHour,
    settings.intervalMinutes,
    settings.defaultDrinkMl,
    settings.name,
  ]);

  useEffect(() => {
    // Re-schedule on app foreground (ensures schedules stay fresh)
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          scheduleWaterReminders(settings);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [settings]);
}
