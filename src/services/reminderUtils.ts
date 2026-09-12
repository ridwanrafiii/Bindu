import { UserSettings } from '../types';

export function formatTime12h(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute < 10 ? `0${minute}` : `${minute}`;
  return `${h}:${m} ${period}`;
}

export function getNextReminderTime(settings: UserSettings, isGoalMet: boolean = false): {
  label: string;
  sublabel: string;
  isPaused: boolean;
} {
  if (isGoalMet && settings.stopRemindersOnGoal) {
    return {
      label: 'Reminders paused',
      sublabel: 'Goal reached for today',
      isPaused: true,
    };
  }

  const now = new Date();
  const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();
  const startMinutesOfDay = settings.startHour * 60;
  const endMinutesOfDay = settings.endHour * 60;

  // Before active hours today
  if (currentMinutesOfDay < startMinutesOfDay) {
    return {
      label: 'Next reminder',
      sublabel: formatTime12h(settings.startHour, 0),
      isPaused: false,
    };
  }

  // During active hours today
  if (currentMinutesOfDay < endMinutesOfDay) {
    const elapsedMinutes = currentMinutesOfDay - startMinutesOfDay;
    const nextSlotIndex = Math.floor(elapsedMinutes / settings.intervalMinutes) + 1;
    const nextMinutesOfDay = startMinutesOfDay + nextSlotIndex * settings.intervalMinutes;

    if (nextMinutesOfDay <= endMinutesOfDay) {
      const h = Math.floor(nextMinutesOfDay / 60);
      const m = nextMinutesOfDay % 60;
      return {
        label: 'Next reminder',
        sublabel: formatTime12h(h, m),
        isPaused: false,
      };
    }
  }

  // After active hours today
  return {
    label: 'Next reminder',
    sublabel: `Tomorrow at ${formatTime12h(settings.startHour, 0)}`,
    isPaused: false,
  };
}
