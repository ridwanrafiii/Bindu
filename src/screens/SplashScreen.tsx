import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { palette } from '../theme/colors';
import { textStyles } from '../theme/typography';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

// Water drop drawn with pure View shapes — no SVG library needed
function WaterDrop() {
  return (
    <View style={styles.dropContainer}>
      {/* Circular bottom of the drop */}
      <View style={styles.dropCircle} />
      {/* Triangle tip at top */}
      <View style={styles.dropTip} />
      {/* Inner highlight for depth */}
      <View style={styles.dropHighlight} />
    </View>
  );
}

export default function SplashScreen({ onFinish }: Props) {
  const dropOpacity    = useSharedValue(0);
  const dropScale      = useSharedValue(0.6);
  const titleOpacity   = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const screenOpacity  = useSharedValue(1);

  useEffect(() => {
    const EASE_OUT = Easing.out(Easing.cubic);
    const EASE_IN  = Easing.in(Easing.cubic);

    // Step 1: Drop appears (0ms)
    dropOpacity.value = withTiming(1, { duration: 600, easing: EASE_OUT });
    dropScale.value   = withTiming(1, { duration: 700, easing: EASE_OUT });

    // Step 2: "Bindu" slides up (400ms delay)
    titleOpacity.value    = withDelay(400, withTiming(1, { duration: 500, easing: EASE_OUT }));
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 500, easing: EASE_OUT }));

    // Step 3: Tagline fades in (900ms delay)
    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 500, easing: EASE_OUT }));

    // Step 4: Hold then fade entire screen out (1800ms delay)
    screenOpacity.value = withDelay(
      1800,
      withTiming(0, { duration: 400, easing: EASE_IN }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, []);

  const dropStyle = useAnimatedStyle(() => ({
    opacity:   dropOpacity.value,
    transform: [{ scale: dropScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity:   titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      {/* Water drop icon */}
      <Animated.View style={[styles.iconWrapper, dropStyle]}>
        <WaterDrop />
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[styles.title, titleStyle]}>
        Bindu
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        YOUR DAILY HYDRATION COMPANION
      </Animated.Text>
    </Animated.View>
  );
}

const DROP_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.navy900,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapper: {
    marginBottom: 32,
  },

  // Water drop shape
  dropContainer: {
    width: DROP_SIZE,
    height: DROP_SIZE * 1.3,
    alignItems: 'center',
  },
  dropCircle: {
    position: 'absolute',
    bottom: 0,
    width: DROP_SIZE,
    height: DROP_SIZE,
    borderRadius: DROP_SIZE / 2,
    backgroundColor: palette.blue400,
  },
  // The tip is a rotated square (diamond) clipped by the circle
  dropTip: {
    position: 'absolute',
    top: 0,
    width: DROP_SIZE * 0.52,
    height: DROP_SIZE * 0.52,
    borderRadius: 6,
    backgroundColor: palette.blue400,
    transform: [{ rotate: '45deg' }],
  },
  dropHighlight: {
    position: 'absolute',
    bottom: DROP_SIZE * 0.3,
    left: DROP_SIZE * 0.2,
    width: DROP_SIZE * 0.22,
    height: DROP_SIZE * 0.32,
    borderRadius: DROP_SIZE * 0.11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '-20deg' }],
  },

  title: {
    ...textStyles.displayLarge,
    color: palette.white,
    marginBottom: 16,
  },

  tagline: {
    ...textStyles.tagline,
    color: palette.white60,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
