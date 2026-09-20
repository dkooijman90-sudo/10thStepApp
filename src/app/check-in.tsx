import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
    Answer,
    Entry,
    Question,
    getEntry,
    getQuestions,
    getVisibleQuestions,
    saveAnswer,
    setEntryCompleted,
    todayKey,
} from '@/lib/storage';

function formatDate(date: string): string {
  const d = new Date(date + 'T12:00:00');
  const formatted = d.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function getAnswer(answers: Answer[], questionId: string): Answer | undefined {
  return answers.find((a) => a.questionId === questionId);
}

type DisplayItem =
  | { kind: 'question'; question: Question; answer?: Answer }
  | { kind: 'answer'; answer: Answer };

export default function CheckinScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const requestedDate =
    typeof params.date === 'string' ? params.date : todayKey();
  const readOnly = requestedDate !== todayKey();

  const [items, setItems] = useState<DisplayItem[]>([]);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const e = await getEntry(requestedDate);

    if (readOnly) {
      // Geschiedenis: toon de vragen zoals ze in de entry staan
      const entryForDisplay: Entry = e ?? {
        date: requestedDate,
        answers: [],
        note: '',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Fallback: voor oude antwoorden zonder questionText,
      // zoek de huidige vraagtekst op
      const allQuestions = await getQuestions();
      const questionTextMap = new Map(
        allQuestions.map((q) => [q.id, q.text])
      );

      const displayItems: DisplayItem[] = entryForDisplay.answers.map((a) => ({
        kind: 'answer',
        answer: {
          ...a,
          questionText:
            a.questionText ??
            questionTextMap.get(a.questionId) ??
            '(vraag niet meer beschikbaar)',
        },
      }));
      setItems(displayItems);
      setEntry(entryForDisplay);
    } else {
      // Vandaag: toon de huidige vragenlijst
      const qs = await getVisibleQuestions();
      const entryForDisplay: Entry = e ?? {
        date: requestedDate,
        answers: [],
        note: '',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const displayItems: DisplayItem[] = qs.map((q) => ({
        kind: 'question',
        question: q,
        answer: getAnswer(entryForDisplay.answers, q.id),
      }));
      setItems(displayItems);
      setEntry(entryForDisplay);
    }

    setLoading(false);
  }, [requestedDate, readOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const updateBool = async (questionId: string, value: boolean) => {
    if (readOnly) return;
    if (!entry) return;
    await saveAnswer(entry.date, questionId, { valueBool: value });
    const e = await getEntry(entry.date);
    if (e) setEntry({ ...e });
    await load();
  };

  const updateText = async (questionId: string, value: string) => {
    if (readOnly) return;
    if (!entry) return;
    await saveAnswer(entry.date, questionId, { valueText: value });
    const e = await getEntry(entry.date);
    if (e) setEntry({ ...e });
    await load();
  };

  const toggleCompleted = async () => {
    if (readOnly) return;
    if (!entry) return;
    await setEntryCompleted(entry.date, !entry.completed);
    const e = await getEntry(entry.date);
    if (e) setEntry({ ...e });
  };

  if (loading || !entry) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.loading, { color: c.textMuted }]}>Laden…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/')}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={c.text} />
        </Pressable>
        <Text style={[styles.headerDate, { color: c.text }]}>
          {formatDate(entry.date)}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {items.map((item, index) => {
            if (readOnly && item.kind === 'answer') {
              // Alleen-lezen weergave: vraagtekst en antwoord uit de entry
              const a = item.answer;
              return (
                <View
                  key={`${a.questionId}-${index}`}
                  style={[
                    styles.questionCard,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                >
                  <Text style={[styles.questionText, { color: c.text }]}>
                    {a.questionText}
                  </Text>

                  {a.valueBool !== null && a.valueBool !== undefined && (
                    <Text style={[styles.readOnlyAnswer, { color: c.text }]}>
                      {a.valueBool ? 'Ja' : 'Nee'}
                    </Text>
                  )}

                  {a.valueText ? (
                    <Text style={[styles.readOnlyText, { color: c.textMuted }]}>
                      {a.valueText}
                    </Text>
                  ) : null}
                </View>
              );
            }

            if (!readOnly && item.kind === 'question') {
              // Bewerkbare weergave
              const q = item.question;
              const answer = item.answer;
              return (
                <View
                  key={q.id}
                  style={[
                    styles.questionCard,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                >
                  <Text style={[styles.questionText, { color: c.text }]}>
                    {q.text}
                  </Text>

                  {q.type === 'bool_text' && (
                    <View style={styles.boolRow}>
                      <Pressable
                        onPress={() => updateBool(q.id, true)}
                        style={({ pressed }) => [
                          styles.boolButton,
                          {
                            borderColor:
                              answer?.valueBool === true ? c.primary : c.border,
                            backgroundColor:
                              answer?.valueBool === true
                                ? c.primary
                                : 'transparent',
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.boolButtonText,
                            {
                              color:
                                answer?.valueBool === true
                                  ? c.primaryText
                                  : c.text,
                            },
                          ]}
                        >
                          Ja
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => updateBool(q.id, false)}
                        style={({ pressed }) => [
                          styles.boolButton,
                          {
                            borderColor:
                              answer?.valueBool === false
                                ? c.primary
                                : c.border,
                            backgroundColor:
                              answer?.valueBool === false
                                ? c.primary
                                : 'transparent',
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.boolButtonText,
                            {
                              color:
                                answer?.valueBool === false
                                  ? c.primaryText
                                  : c.text,
                            },
                          ]}
                        >
                          Nee
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {(q.type === 'text' ||
                    (q.type === 'bool_text' &&
                      answer?.valueBool !== undefined &&
                      answer?.valueBool !== null)) && (
                    <TextInput
                      value={answer?.valueText ?? ''}
                      onChangeText={(v) => updateText(q.id, v)}
                      placeholder="Toelichting (optioneel)"
                      placeholderTextColor={c.textMuted}
                      multiline
                      style={[
                        styles.textInput,
                        {
                          color: c.text,
                          borderColor: c.border,
                          backgroundColor: c.surfaceHigh,
                        },
                      ]}
                    />
                  )}
                </View>
              );
            }

            return null;
          })}

          {!readOnly && (
            <Pressable
              onPress={toggleCompleted}
              style={({ pressed }) => [
                styles.completeButton,
                entry.completed
                  ? {
                      borderColor: c.border,
                      borderWidth: 1,
                      backgroundColor: 'transparent',
                    }
                  : { backgroundColor: c.primary },
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.completeButtonText,
                  { color: entry.completed ? c.textMuted : c.primaryText },
                ]}
              >
                {entry.completed ? 'Dag afgerond ✓' : 'Dag afronden'}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerDate: {
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
    gap: Spacing.md,
    paddingTop: Spacing.xl
  },
  questionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  boolRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  boolButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  boolButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  completeButton: {
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  readOnlyAnswer: {
    fontSize: 16,
    fontWeight: '600',
  },
  readOnlyText: {
    fontSize: 15,
    lineHeight: 21,
  },
});