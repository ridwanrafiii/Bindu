import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserSettings } from '../types';
import { addWaterEntry, todayString, loadSettings } from './storage';

// ─── Notification Channel & Categories ────────────────────────────────────────

const CHANNEL_ID = 'water-reminders';
const CATEGORY_ID = 'WATER_REMINDER_CATEGORY';

const DRINK_ACTION = 'DRINK_ACTION';
const SNOOZE_ACTION = 'SNOOZE_ACTION';

const FRIENDLY_MESSAGES = [
  (name: string) => (name ? `Hey ${name}! Time to drink some water 💧` : 'Time to drink some water 💧'),
  (name: string) => (name ? `Take a sip, ${name} 💧` : 'Take a sip of water 💧'),
  (name: string) => (name ? `Stay hydrated, ${name} 💧` : 'Stay hydrated today 💧'),
  (name: string) => (name ? `${name}, pani kheyechen? 💧` : 'A quick water break 💧'),
  (name: string) => (name ? `A little water break, ${name}.` : 'A little water goes a long way 💧'),
  (name: string) => (name ? `Keep up your hydration streak, ${name}! 💧` : 'Keep up your hydration streak! 💧'),
];

// Configure foreground notification presentation
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Graceful fallback for non-native environments
}

// ─── Setup Notification System ────────────────────────────────────────────────

export async function setupNotificationCategories(defaultMl: number = 250): Promise<void> {
  try {
    // Define notification actions: Drink and Snooze (10m)
    await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
      {
        identifier: DRINK_ACTION,
        buttonTitle: `💧 Drink (+${defaultMl}ml)`,
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: SNOOZE_ACTION,
        buttonTitle: '⏱️ Snooze (10m)',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    // Android notification channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Water Reminders',
        description: 'Periodic reminders to drink water during active hours',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1A73E8',
        sound: 'default',
        enableVibrate: true,
        showBadge: false,
      });
    }
  } catch {
    // Non-fatal if unsupported in current environment
  }
}

// ─── Response Listener (Handles Drink / Snooze background actions) ─────────────

let responseSubscription: Notifications.Subscription | null = null;

export function registerNotificationResponseListener(onDrinkLogged?: () => void): void {
  try {
    if (responseSubscription) {
      responseSubscription.remove();
    }

    responseSubscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const actionId = response.actionIdentifier;
      const settings = await loadSettings();

      if (actionId === DRINK_ACTION) {
        // User tapped "Drink"
        await addWaterEntry(todayString(), settings.defaultDrinkMl);
        if (onDrinkLogged) onDrinkLogged();
      } else if (actionId === SNOOZE_ACTION) {
        // User tapped "Snooze" -> Schedule reminder 10 minutes from now
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💧 Snoozed reminder',
            body: `Time for your ${settings.defaultDrinkMl}ml water break!`,
            sound: 'default',
            categoryIdentifier: CATEGORY_ID,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { type: 'snooze-reminder' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 600, // 10 minutes
          },
        });
      }
    });
  } catch {
    // Ignored in unsupported environments
  }
}

// ─── Permission Handling ──────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  try {
    const { status: existingStatus, canAskAgain } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted' && canAskAgain) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const isGranted = finalStatus === 'granted';

    if (isGranted) {
      await setupNotificationCategories();
    }

    return {
      granted: isGranted,
      canAskAgain,
    };
  } catch {
    return {
      granted: false,
      canAskAgain: false,
    };
  }
}

// ─── Reminder Scheduling (Clean Rebuild to Prevent Duplicates) ────────────────

export async function scheduleWaterReminders(settings: UserSettings): Promise<boolean> {
  try {
    // 1. Always cancel all prior scheduled reminders first to prevent duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const { granted } = await requestNotificationPermission();
    if (!granted) {
      return false;
    }

    await setupNotificationCategories(settings.defaultDrinkMl);

    const { startHour, endHour, intervalMinutes, name } = settings;

    // Calculate total active minutes in the window
    const totalActiveMinutes = (endHour - startHour) * 60;
    if (totalActiveMinutes <= 0 || intervalMinutes <= 0) {
      return false;
    }

    const reminderCount = Math.floor(totalActiveMinutes / intervalMinutes);

    for (let i = 0; i < reminderCount; i++) {
      const minuteOffset = startHour * 60 + i * intervalMinutes;
      const reminderHour = Math.floor(minuteOffset / 60);
      const reminderMinute = minuteOffset % 60;

      // Pick a personalized message from the pool
      const messageFn = FRIENDLY_MESSAGES[i % FRIENDLY_MESSAGES.length];
      const bodyText = messageFn(name);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Bindu Water Reminder',
          body: bodyText,
          sound: 'default',
          categoryIdentifier: CATEGORY_ID,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            type: 'scheduled-reminder',
            slotIndex: i,
            amountMl: settings.defaultDrinkMl,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminderHour,
          minute: reminderMinute,
          channelId: CHANNEL_ID,
        },
      });
    }

    return true;
  } catch {
    return false;
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Ignored in unsupported environments
  }
}

export async function getScheduledRemindersCount(): Promise<number> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length;
  } catch {
    return 0;
  }
}
