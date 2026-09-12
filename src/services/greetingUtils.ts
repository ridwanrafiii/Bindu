// ─── Time-aware personalized greetings for Bindu ──────────────────────────────

interface GreetingPool {
  withName: (name: string) => string[];
  withoutName: string[];
}

const GREETINGS: Record<'morning' | 'afternoon' | 'evening' | 'night', GreetingPool> = {
  // 5:00 AM – 11:59 AM
  morning: {
    withName: (name: string) => [
      `Good morning, ${name} ☀️`,
      `Good morning, ${name}! Ready for a hydrated day?`,
      `Hey ${name}, start your day with a glass of water 💧`,
      `Good morning, ${name}. Keep yourself hydrated today.`,
      `Rise and shine, ${name} ☀️`,
      `Hey ${name}! Time for morning hydration 💧`,
    ],
    withoutName: [
      'Good morning ☀️',
      'Good morning! Ready for a hydrated day?',
      'Start your day with a glass of water 💧',
      'Rise and shine ☀️',
      'Time for morning hydration 💧',
    ],
  },

  // 12:00 PM – 4:59 PM
  afternoon: {
    withName: (name: string) => [
      `Good afternoon, ${name} ☀️`,
      `Stay hydrated, ${name} 💧`,
      `Hey ${name}, don't forget your water 💧`,
      `Keep going, ${name} 💧`,
      `A little water goes a long way, ${name}.`,
      `Hey ${name}! Time for a little hydration.`,
    ],
    withoutName: [
      'Good afternoon ☀️',
      'Stay hydrated today 💧',
      'Don’t forget your water 💧',
      'Keep going 💧',
      'A little water goes a long way.',
      'Time for a little hydration 💧',
    ],
  },

  // 5:00 PM – 8:59 PM
  evening: {
    withName: (name: string) => [
      `Good evening, ${name} 🌙`,
      `Hey ${name}, how was your day? Keep hydrated 💧`,
      `Stay hydrated this evening, ${name}.`,
      `Almost done with the day, ${name} 💧`,
      `Keep it up, ${name}!`,
    ],
    withoutName: [
      'Good evening 🌙',
      'Stay hydrated this evening 💧',
      'Almost done with the day 💧',
      'A gentle hydration reminder 💧',
    ],
  },

  // 9:00 PM – 4:59 AM
  night: {
    withName: (name: string) => [
      `Hey ${name}, winding down? 🌙`,
      `Good night, ${name} 🌙`,
      `A sip of water before resting, ${name} 💧`,
      `Rest well, ${name} 🌙`,
      `Winding down for the day, ${name}?`,
    ],
    withoutName: [
      'Winding down? 🌙',
      'Good night 🌙',
      'A sip of water before resting 💧',
      'Rest well tonight 🌙',
    ],
  },
};

export function getGreetingPeriod(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getRandomGreeting(name?: string): string {
  const hour = new Date().getHours();
  const period = getGreetingPeriod(hour);
  const pool = GREETINGS[period];

  const trimmedName = name?.trim();
  const options = trimmedName ? pool.withName(trimmedName) : pool.withoutName;

  const index = Math.floor(Math.random() * options.length);
  return options[index];
}
