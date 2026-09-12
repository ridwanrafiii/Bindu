import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupStackParamList } from '../../navigation/AppNavigator';
import { textStyles, fontSize } from '../../theme/typography';

type Props = NativeStackScreenProps<SetupStackParamList, 'SetupHours'>;

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export default function SetupHoursScreen({ route, navigation }: Props) {
  const { name, dailyGoalMl, intervalMinutes } = route.params;
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(22);
  const [picking, setPicking] = useState<'start' | 'end'>('start');

  function selectHour(h: number) {
    if (picking === 'start') {
      setStartHour(h);
      if (h >= endHour) setEndHour(Math.min(h + 1, 23));
    } else {
      setEndHour(h);
      if (h <= startHour) setStartHour(Math.max(h - 1, 0));
    }
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.top}>
        <Text style={styles.step}>Step 4 of 4</Text>
        <Text style={styles.heading}>Reminder hours</Text>
        <Text style={styles.sub}>
          When should Bindu send you reminders? Pick start and end time.
        </Text>
      </View>

      {/* Picker toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, picking === 'start' && styles.toggleBtnActive]}
          onPress={() => setPicking('start')}
        >
          <Text style={styles.toggleLabel}>Start</Text>
          <Text style={[styles.toggleValue, picking === 'start' && styles.toggleValueActive]}>
            {formatHour(startHour)}
          </Text>
        </TouchableOpacity>

        <View style={styles.toggleDivider} />

        <TouchableOpacity
          style={[styles.toggleBtn, picking === 'end' && styles.toggleBtnActive]}
          onPress={() => setPicking('end')}
        >
          <Text style={styles.toggleLabel}>End</Text>
          <Text style={[styles.toggleValue, picking === 'end' && styles.toggleValueActive]}>
            {formatHour(endHour)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hour grid */}
      <View style={styles.hourGrid}>
        {HOURS.map((h) => {
          const isStart = h === startHour;
          const isEnd = h === endHour;
          const inRange = h > startHour && h < endHour;
          const active = isStart || isEnd;
          return (
            <TouchableOpacity
              key={h}
              style={[
                styles.hourPill,
                active && styles.hourPillActive,
                inRange && styles.hourPillInRange,
              ]}
              onPress={() => selectHour(h)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.hourText, active && styles.hourTextActive]}
                numberOfLines={1}
              >
                {formatHour(h)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('SetupDone', {
            name,
            dailyGoalMl,
            intervalMinutes,
            startHour,
            endHour,
          })
        }
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0A1628' },

  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
    gap: 24,
  },

  top: { gap: 12 },

  step: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  heading: {
    ...textStyles.displayMedium,
    color: '#FFFFFF',
  },

  sub: {
    ...textStyles.body,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },

  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    overflow: 'hidden',
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },

  toggleBtnActive: {
    backgroundColor: 'rgba(26,115,232,0.2)',
    borderRadius: 16,
  },

  toggleDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },

  toggleLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '500',
  },

  toggleValue: {
    ...textStyles.headingMedium,
    color: 'rgba(255,255,255,0.5)',
  },

  toggleValueActive: {
    color: '#FFFFFF',
  },

  hourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },

  hourPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 68,
    alignItems: 'center',
  },

  hourPillActive: {
    borderColor: '#1A73E8',
    backgroundColor: '#1A73E8',
  },

  hourPillInRange: {
    backgroundColor: 'rgba(26,115,232,0.15)',
    borderColor: 'rgba(26,115,232,0.3)',
  },

  hourText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },

  hourTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  button: {
    backgroundColor: '#1A73E8',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonText: {
    ...textStyles.headingMedium,
    color: '#FFFFFF',
  },
});
