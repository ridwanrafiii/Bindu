import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSettings } from '../hooks/useSettings';
import { useWaterLog } from '../hooks/useWaterLog';
import { useNotifications } from '../hooks/useNotifications';
import { getRandomGreeting } from '../services/greetingUtils';
import { getNextReminderTime } from '../services/reminderUtils';
import { textStyles, fontSize } from '../theme/typography';
import { palette } from '../theme/colors';

const { width } = Dimensions.get('window');
const RING_SIZE = Math.min(width * 0.70, 260);
const STROKE = 14;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── SVG Progress Ring ────────────────────────────────────────────────────────
function ProgressRing({ progress }: { progress: number }) {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Visual progress is capped at 100% (1.0)
    const capped = Math.min(Math.max(progress, 0), 1);
    Animated.spring(animatedProgress, {
      toValue: capped,
      useNativeDriver: false,
      tension: 35,
      friction: 8,
    }).start();
  }, [progress]);

  const p = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const exceeded = progress >= 1;
  const strokeColor = exceeded ? '#22C55E' : '#1A73E8';

  const dashOffset = p.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress Arc */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={strokeColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
    </View>
  );
}

// ─── Animated Press Button ────────────────────────────────────────────────────
function AnimatedButton({
  onPress,
  style,
  children,
  fullWidth,
  flex,
}: {
  onPress: () => void;
  style?: object;
  children: React.ReactNode;
  fullWidth?: boolean;
  flex?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  const touchStyle = fullWidth
    ? { width: '100%' as const }
    : flex !== undefined
    ? { flex }
    : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      style={touchStyle}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { settings, loading: settingsLoading } = useSettings();
  const { totalMl, loading: logLoading, logWater, refresh } = useWaterLog();
  const [greetingText, setGreetingText] = useState('');

  // Register notification actions and background scheduling
  useNotifications(settings, refresh);

  const ringScale = useRef(new Animated.Value(1)).current;
  const numberOpacity = useRef(new Animated.Value(1)).current;

  // Initialize randomized time-appropriate greeting on mount / settings load
  useEffect(() => {
    if (!settingsLoading) {
      setGreetingText(getRandomGreeting(settings.name));
    }
  }, [settingsLoading, settings.name]);

  const handleLog = useCallback(
    async (amount: number) => {
      // Subtle pulse and number micro-interaction
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, { toValue: 1.04, duration: 150, useNativeDriver: true }),
          Animated.spring(ringScale, { toValue: 1, useNativeDriver: true, tension: 70, friction: 7 }),
        ]),
        Animated.sequence([
          Animated.timing(numberOpacity, { toValue: 0.4, duration: 100, useNativeDriver: true }),
          Animated.timing(numberOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();

      await logWater(amount);
    },
    [logWater, ringScale, numberOpacity]
  );

  if (settingsLoading || logLoading) {
    return <View style={styles.container} />;
  }

  const progress = settings.dailyGoalMl > 0 ? totalMl / settings.dailyGoalMl : 0;
  const exceeded = totalMl >= settings.dailyGoalMl;
  const remainingMl = Math.max(settings.dailyGoalMl - totalMl, 0);

  const reminderInfo = getNextReminderTime(settings, exceeded);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Personalized Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting} numberOfLines={2}>
            {greetingText || 'Welcome back 💧'}
          </Text>
        </View>

        {/* 2. Progress Ring & Inner Info */}
        <Animated.View style={[styles.ringWrapper, { transform: [{ scale: ringScale }] }]}>
          <ProgressRing progress={progress} />

          {/* Absolute Center Content */}
          <Animated.View style={[styles.ringCenterAbs, { opacity: numberOpacity }]} pointerEvents="none">
            <Text style={styles.bigLitres}>
              {(totalMl / 1000).toFixed(1)}
              <Text style={styles.bigUnit}> L</Text>
            </Text>
            <Text style={styles.goalLabel}>
              of {(settings.dailyGoalMl / 1000).toFixed(1)} L
            </Text>
          </Animated.View>
        </Animated.View>

        {/* 3. Progress Subtitle */}
        <View style={styles.statusRow}>
          {exceeded ? (
            <Text style={styles.exceededText}>🎉 Daily goal reached!</Text>
          ) : (
            <Text style={styles.remainingText}>{remainingMl} ml remaining</Text>
          )}
        </View>

        {/* 4. Next Reminder Banner (Small & Unobtrusive) */}
        <View style={styles.reminderBanner}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="2" />
            <Path d="M12 7v5l3 3" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={styles.reminderLabel}>{reminderInfo.label}:</Text>
          <Text style={styles.reminderTime}>{reminderInfo.sublabel}</Text>
        </View>

        {/* 5. Primary Water Logging Button (Reduced height) */}
        <AnimatedButton
          onPress={() => handleLog(settings.defaultDrinkMl)}
          style={styles.logButton}
          fullWidth
        >
          <View style={styles.logButtonInner}>
            <Text style={styles.logButtonAmount}>+ {settings.defaultDrinkMl} ml</Text>
            <Text style={styles.logButtonSub}>Tap to log a drink</Text>
          </View>
        </AnimatedButton>

        {/* 6. Quick-Add Secondary Buttons */}
        <View style={styles.quickRow}>
          {[150, 250, 350, 500].map((ml) => (
            <AnimatedButton
              key={ml}
              onPress={() => handleLog(ml)}
              style={styles.quickPill}
              flex={1}
            >
              <Text style={styles.quickPillText}>{ml} ml</Text>
            </AnimatedButton>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.navy900,
  },
  container: {
    flex: 1,
    backgroundColor: palette.navy900,
  },
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 110, // Avoid overlap with floating bottom nav
    gap: 14,
  },

  // Greeting
  greetingContainer: {
    width: '100%',
    paddingVertical: 4,
  },
  greeting: {
    ...textStyles.headingLarge,
    color: palette.white,
    lineHeight: 32,
  },

  // Ring
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    position: 'relative',
  },
  ringCenterAbs: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  bigLitres: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: palette.white,
    lineHeight: 46,
  },
  bigUnit: {
    fontSize: fontSize.xl,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  goalLabel: {
    ...textStyles.bodySmall,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
    fontWeight: '500',
  },

  // Status
  statusRow: {
    alignItems: 'center',
    marginTop: -4,
  },
  remainingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.2,
  },
  exceededText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: 0.2,
  },

  // Next Reminder Banner
  reminderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 4,
  },
  reminderLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
  },
  reminderTime: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: palette.white,
  },

  // Primary Button (Refined & Compact)
  logButton: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#1A73E8',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 6,
  },
  logButtonInner: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  logButtonAmount: {
    fontSize: fontSize['2xl'],
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  logButtonSub: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Secondary Quick Pills
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 2,
  },
  quickPill: {
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
