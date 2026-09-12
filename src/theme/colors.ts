export const palette = {
  // Brand blues
  navy900: '#0A1628',
  navy800: '#0D1F3C',
  navy700: '#122347',
  navy600: '#1A3A6B',
  blue500: '#1A73E8',
  blue400: '#4A90E2',
  blue300: '#7AB3F0',
  blue100: '#D6E8FB',

  // Neutrals
  white:   '#FFFFFF',
  gray50:  '#F8FAFC',
  gray100: '#EEF2F7',
  gray300: '#CBD5E1',
  gray500: '#64748B',
  gray700: '#334155',
  gray900: '#0F172A',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',

  // Transparency helpers
  white10: 'rgba(255,255,255,0.10)',
  white20: 'rgba(255,255,255,0.20)',
  white60: 'rgba(255,255,255,0.60)',
  black20: 'rgba(0,0,0,0.20)',
  black40: 'rgba(0,0,0,0.40)',
};

export const lightColors = {
  background:       palette.gray50,
  surface:          palette.white,
  surfaceElevated:  palette.white,
  border:           palette.gray100,

  primary:          palette.blue500,
  primaryLight:     palette.blue100,
  primaryDark:      palette.navy600,

  textPrimary:      palette.gray900,
  textSecondary:    palette.gray500,
  textOnPrimary:    palette.white,

  ringTrack:        palette.gray100,
  ringFill:         palette.blue500,
  ringFillExceeded: palette.success,

  tabBar:           palette.white,
  tabBarBorder:     palette.gray100,
  tabIconActive:    palette.blue500,
  tabIconInactive:  palette.gray300,

  splashBackground: palette.navy900,
  splashText:       palette.white,
};

export const darkColors: typeof lightColors = {
  background:       palette.navy900,
  surface:          palette.navy800,
  surfaceElevated:  palette.navy700,
  border:           palette.navy600,

  primary:          palette.blue400,
  primaryLight:     palette.navy700,
  primaryDark:      palette.blue500,

  textPrimary:      palette.white,
  textSecondary:    palette.white60,
  textOnPrimary:    palette.white,

  ringTrack:        palette.navy700,
  ringFill:         palette.blue400,
  ringFillExceeded: palette.success,

  tabBar:           palette.navy800,
  tabBarBorder:     palette.navy700,
  tabIconActive:    palette.blue400,
  tabIconInactive:  palette.gray500,

  splashBackground: palette.navy900,
  splashText:       palette.white,
};

export type AppColors = typeof lightColors;
