import { TextStyle } from 'react-native';

export const fontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 38,
  '5xl': 48,
};

export const fontWeight: Record<string, TextStyle['fontWeight']> = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
};

export const lineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
};

// Pre-built text style objects for common patterns
export const textStyles = {
  displayLarge: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -1,
  } as TextStyle,

  displayMedium: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  } as TextStyle,

  headingLarge: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.3,
  } as TextStyle,

  headingMedium: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
  } as TextStyle,

  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
  } as TextStyle,

  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
  } as TextStyle,

  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.3,
  } as TextStyle,

  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    letterSpacing: 0.2,
  } as TextStyle,

  tagline: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    letterSpacing: 2.5,
  } as TextStyle,
};
