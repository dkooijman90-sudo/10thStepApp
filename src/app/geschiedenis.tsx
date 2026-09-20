import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Entry, getAllEntries, todayKey } from '@/lib/storage';

function formatDate(date: string): string {
  const d = new Date(date + 'T12:00:00');
  const formatted = d.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function sortByDateDesc(a: Entry, b: Entry): number {
  return b.date.localeCompare(a.date);
}

export default function GeschiedenisScreen() {
  const c = useThemeColors();
  const router = useRouter();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllEntries().then((all) => {
        if (!active) return;
        const past = all
          .filter((e) => e.date !== todayKey())
          .filter((e) => e.answers.length > 0)
          .sort(sortByDateDesc);
        setEntries(past);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/')}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={c.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.text }]}>Geschiedenis</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {loading ? (
            <Text style={[styles.empty, { color: c.textMuted }]}>Laden…</Text>
          ) : entries.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={44}
                color={c.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: c.text }]}>
                Nog geen eerdere dagen
              </Text>
              <Text style={[styles.empty, { color: c.textMuted }]}>
                Zodra je een dag hebt afgerond, verschijnt die hier.
              </Text>
            </View>
          ) : (
            entries.map((entry) => (
              <Pressable
                key={entry.date}
                onPress={() =>
                  router.push(`/check-in?date=${entry.date}`)
                }
                style={({ pressed }) => [
                  styles.dayCard,
                  {
                    backgroundColor: c.surface,
                    borderColor: c.border,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <View style={styles.dayLeft}>
                  <Text style={[styles.dayDate, { color: c.text }]}>
                    {formatDate(entry.date)}
                  </Text>
                  <Text style={[styles.dayStatus, { color: c.textMuted }]}>
                    {entry.completed ? 'Afgerond' : 'Niet afgerond'}
                  </Text>
                </View>

                {entry.completed ? (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={22}
                    color={c.primary}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color={c.textMuted}
                  />
                )}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingTop: Spacing.xl
  },
  emptyBox: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  empty: {
    fontSize: 15,
    textAlign: 'center',
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  dayLeft: {
    gap: 2,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayStatus: {
    fontSize: 13,
  },
});