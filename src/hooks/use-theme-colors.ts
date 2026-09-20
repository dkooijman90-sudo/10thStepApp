import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}