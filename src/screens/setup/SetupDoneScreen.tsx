import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupStackParamList } from '../../navigation/AppNavigator';
import { textStyles } from '../../theme/typography';
import { saveSettings, markSetupDone } from '../../services/storage';
import { scheduleWaterReminders } from '../../services/notifications';
import { UserSettings, DEFAULT_SETTINGS } from '../../types';

type Props = NativeStackScreenProps<SetupStackParamList, 'SetupDone'> & {
  onSetupComplete: () => void;
};

export default function SetupDoneScreen({ route, onSetupComplete }: Props) {
  const { name, dailyGoalMl, intervalMinutes, startHour, endHour } = route.params;
  const [saving, setSaving] = useState(false);

  async function handleStart() {
    if (saving) return;
    setSaving(true);
    const settings: UserSettings = {
      ...DEFAULT_SETTINGS,
      name,
      dailyGoalMl,
      intervalMinutes,
      startHour,
      endHour,
    };
    await saveSettings(settings);
    await markSetupDone();

    // Schedule initial water reminders
    await scheduleWaterReminders(settings);

    onSetupComplete();
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconArea}>
        {/* Water drop decoration */}
        <View style={styles.dropOuter}>
          <View style={styles.dropCircle} />
          <View style={styles.dropTip} />
        </View>
      </View>

      <View style={styles.textArea}>
        <Text style={styles.heading}>You're all set,{'\n'}{name}!</Text>
        <Text style={styles.sub}>
          Bindu will remind you every {intervalMinutes} minute{intervalMinutes !== 1 ? 's' : ''} between{' '}
          {formatH(startHour)} and {formatH(endHour)} to reach your{' '}
          {(dailyGoalMl / 1000).toFixed(1)} L goal.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleStart}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Start drinking 💧</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function formatH(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

const DROP = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 80,
    justifyContent: 'space-between',
  },

  iconArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  dropOuter: {
    width: DROP,
    height: DROP * 1.3,
    alignItems: 'center',
  },

  dropCircle: {
    position: 'absolute',
    bottom: 0,
    width: DROP,
    height: DROP,
    borderRadius: DROP / 2,
    backgroundColor: '#1A73E8',
  },

  dropTip: {
    position: 'absolute',
    top: 0,
    width: DROP * 0.52,
    height: DROP * 0.52,
    borderRadius: 5,
    backgroundColor: '#1A73E8',
    transform: [{ rotate: '45deg' }],
  },

  textArea: {
    gap: 16,
    flex: 1,
    justifyContent: 'center',
  },

  heading: {
    ...textStyles.displayMedium,
    color: '#FFFFFF',
  },

  sub: {
    ...textStyles.body,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 24,
  },

  button: {
    backgroundColor: '#1A73E8',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    ...textStyles.headingMedium,
    color: '#FFFFFF',
  },
});
