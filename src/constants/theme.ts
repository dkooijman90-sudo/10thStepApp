import { Platform } from 'react-native';

export const Colors = {
  dark: {
    background: '#1A1614',
    surface: '#262120',
    surfaceHigh: '#332B29',
    primary: '#C9A227',
    primaryText: '#1A1614',
    text: '#F5F0E8',
    textMuted: '#A89F94',
    border: '#3A3330',
  },
  light: {
    background: '#FAF6F0',
    surface: '#FFFFFF',
    surfaceHigh: '#F0EAE0',
    primary: '#8B6F47',
    primaryText: '#FFFFFF',
    text: '#1A1614',
    textMuted: '#6B6259',
    border: '#E5DDD0',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 72,
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
  },
  default: {
    sans: 'System',
    serif: 'Georgia',
  },
});