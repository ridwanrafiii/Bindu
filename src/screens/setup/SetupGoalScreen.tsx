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

type Props = NativeStackScreenProps<SetupStackParamList, 'SetupGoal'>;

const PRESETS = [
  { label: '1.5 L', value: 1500 },
  { label: '2.0 L', value: 2000 },
  { label: '2.5 L', value: 2500 },
  { label: '3.0 L', value: 3000 },
  { label: '3.5 L', value: 3500 },
  { label: '4.0 L', value: 4000 },
];

export default function SetupGoalScreen({ route, navigation }: Props) {
  const { name } = route.params;
  const [goalMl, setGoalMl] = useState(2000);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.top}>
        <Text style={styles.step}>Step 2 of 4</Text>
        <Text style={styles.heading}>Daily water goal</Text>
        <Text style={styles.sub}>
          Most adults need 2–3 litres per day. Pick what's right for you.
        </Text>
      </View>

      <View style={styles.grid}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.pill, goalMl === p.value && styles.pillSelected]}
            onPress={() => setGoalMl(p.value)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, goalMl === p.value && styles.pillTextSelected]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.currentLabel}>
        {(goalMl / 1000).toFixed(1)} L per day
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SetupInterval', { name, dailyGoalMl: goalMl })}
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
    justifyContent: 'space-between',
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

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 40,
  },

  pill: {
    width: '44%',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },

  pillSelected: {
    borderColor: '#1A73E8',
    backgroundColor: 'rgba(26,115,232,0.15)',
  },

  pillText: {
    ...textStyles.headingMedium,
    color: 'rgba(255,255,255,0.5)',
  },

  pillTextSelected: {
    color: '#FFFFFF',
  },

  currentLabel: {
    ...textStyles.headingLarge,
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 32,
  },

  button: {
    backgroundColor: '#1A73E8',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },

  buttonText: {
    ...textStyles.headingMedium,
    color: '#FFFFFF',
  },
});
