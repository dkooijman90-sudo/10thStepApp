import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Entry, getEntry, todayKey } from '@/lib/storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

function getTime(): string {
  return new Date().toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFormattedDate(): string {
  const date = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return date.charAt(0).toUpperCase() + date.slice(1);
}

function getDayPeriod(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default function LandingScreen() {
  const c = useThemeColors();
  const router = useRouter();

  const [entry, setEntry] = useState<Entry | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getEntry(todayKey()).then((e) => {
        if (active) setEntry(e);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const timeOpacity = useSharedValue(0);
  const timeTranslate = useSharedValue(8);

  useEffect(() => {
    timeOpacity.value = withTiming(1, { duration: 1200 });
    timeTranslate.value = withTiming(0, { duration: 1200 });
  }, []);

  const timeStyle = useAnimatedStyle(() => ({
    opacity: timeOpacity.value,
    transform: [{ translateY: timeTranslate.value }],
  }));

  const period = getDayPeriod();
  const dayIcon =
    period === 'morning'
      ? 'weather-sunset-up'
      : period === 'afternoon'
        ? 'white-balance-sunny'
        : 'weather-night';
  const hasAnswers = entry?.answers && entry.answers.length > 0;
  const isCompleted = entry?.completed === true;

  const statusLabel = !hasAnswers
    ? 'Nog niet begonnen'
    : isCompleted
      ? 'Afgerond'
      : 'Nog niet afgerond';

  const buttonLabel = !hasAnswers ? 'Start' : isCompleted ? 'Bekijk vandaag' : 'Ga verder';
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[c.background, c.surfaceHigh, c.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.top}>
          <View style={styles.iconsRow}>
            <MaterialCommunityIcons
              name={dayIcon}
              size={20}
              color={c.textMuted}
            />
          </View>

          <Animated.View style={timeStyle}>
            <Text style={[styles.greeting, { color: c.textMuted }]}>
              {getGreeting()} · {getTime()}
            </Text>
          </Animated.View>

          <Text style={[styles.date, { color: c.text }]}>
            {getFormattedDate()}
          </Text>

          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            Even stilstaan bij vandaag
          </Text>
        </View>
        <View style={styles.meditationWrap}>
          <MaterialCommunityIcons
            name="meditation"
            size={64}
            color={c.primary}
          />
        </View>
        <View style={styles.middle}>
<View
  style={[
    styles.statusCard,
    { backgroundColor: c.surface, borderColor: c.border },
  ]}
>
  <Text style={[styles.statusLabel, { color: c.textMuted }]}>
    VANDAAG
  </Text>
  <View style={styles.statusRow}>
    <Text style={[styles.statusText, { color: c.text }]}>
      {statusLabel}
    </Text>
    {isCompleted && (
      <MaterialCommunityIcons
        name="check-circle"
        size={22}
        color={c.primary}
      />
    )}
  </View>

  <Pressable
    onPress={() => router.push('/check-in')}
    style={({ pressed }) => [
      styles.primaryButton,
      {
        backgroundColor: c.primary,
        opacity: pressed ? 0.85 : 1,
      },
    ]}
  >
    <Text style={[styles.primaryButtonText, { color: c.primaryText }]}>
      {buttonLabel}
    </Text>
  </Pressable>
</View>

          <Pressable
            onPress={() => router.push('/geschiedenis')}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: c.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: c.text }]}>
              Geschiedenis
            </Text>
          </Pressable>
        </View>

        <View style={styles.bottom}>
          <Pressable
            onPress={() => router.push('/instellingen')}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.settingsLink, { color: c.textMuted }]}>
              Instellingen
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: Spacing.md,
},
  meditationWrap: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.lg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  top: {
    gap: Spacing.sm,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  greeting: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  middle: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: Spacing.md,
    paddingTop: Spacing.xxl,
  },
  statusCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  statusLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottom: {
    alignItems: 'center',
  },
  settingsLink: {
    fontSize: 14,
  },
});