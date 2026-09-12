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

type Props = NativeStackScreenProps<SetupStackParamList, 'SetupInterval'>;

const OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '90 min', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];

export default function SetupIntervalScreen({ route, navigation }: Props) {
  const { name, dailyGoalMl } = route.params;
  const [intervalMinutes, setIntervalMinutes] = useState(60);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.top}>
        <Text style={styles.step}>Step 3 of 4</Text>
        <Text style={styles.heading}>Reminder interval</Text>
        <Text style={styles.sub}>
          How often should Bindu nudge you to drink water?
        </Text>
      </View>

      <View style={styles.grid}>
        {OPTIONS.map((o) => (
          <TouchableOpacity
            key={o.value}
            style={[styles.pill, intervalMinutes === o.value && styles.pillSelected]}
            onPress={() => setIntervalMinutes(o.value)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, intervalMinutes === o.value && styles.pillTextSelected]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('SetupHours', { name, dailyGoalMl, intervalMinutes })
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
