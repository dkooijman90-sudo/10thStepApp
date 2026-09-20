import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function InstellingenScreen() {
  const c = useThemeColors();
  const router = useRouter();

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
        <Text style={[styles.headerTitle, { color: c.text }]}>Instellingen</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Pressable
            onPress={() => router.push('/vragen')}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={22}
                color={c.primary}
              />
              <Text style={[styles.rowText, { color: c.text }]}>
                Vragen beheren
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={c.textMuted}
            />
          </Pressable>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
  },
});