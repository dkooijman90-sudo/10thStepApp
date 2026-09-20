import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Modal,
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
    Question,
    QuestionType,
    addQuestion,
    deleteQuestionCompletely,
    getHiddenQuestions,
    getVisibleQuestions,
    hideQuestion,
    reorderQuestions,
    restoreQuestion,
    updateQuestion,
} from '@/lib/storage';

function typeLabel(type: Question['type']): string {
  return type === 'bool_text' ? 'Ja/nee' : 'Tekst';
}

export default function VragenScreen() {
  const c = useThemeColors();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<QuestionType>('bool_text');
  const [editing, setEditing] = useState<Question | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [hiddenModalOpen, setHiddenModalOpen] = useState(false);
  const [hiddenQuestions, setHiddenQuestions] = useState<Question[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getVisibleQuestions().then((qs) => {
        if (!active) return;
        setQuestions(qs);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const openNew = () => {
    setEditing(null);
    setNewText('');
    setNewType('bool_text');
    setModalOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditing(q);
    setNewText(q.text);
    setNewType(q.type);
    setMenuOpenFor(null);
    setModalOpen(true);
  };

  const saveQuestion = async () => {
    const text = newText.trim();
    if (!text) return;
    if (editing) {
      await updateQuestion(editing.id, { text, type: newType });
    } else {
      await addQuestion(text, newType);
    }
    setNewText('');
    setNewType('bool_text');
    setEditing(null);
    setModalOpen(false);
    const qs = await getVisibleQuestions();
    setQuestions(qs);
  };

  const closeModal = () => {
    setNewText('');
    setNewType('bool_text');
    setEditing(null);
    setModalOpen(false);
  };

  const hideQuestionById = async (q: Question) => {
    setMenuOpenFor(null);
    await hideQuestion(q.id);
    const qs = await getVisibleQuestions();
    setQuestions(qs);
  };

  const moveQuestion = async (q: Question, direction: 'up' | 'down') => {
    const idx = questions.findIndex((x) => x.id === q.id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const reordered = [...questions];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    setQuestions(reordered);
    await reorderQuestions(reordered.map((x) => x.id));
  };

  const openHiddenModal = async () => {
    const qs = await getHiddenQuestions();
    setHiddenQuestions(qs);
    setHiddenModalOpen(true);
  };

  const restoreHiddenQuestion = async (q: Question) => {
    await restoreQuestion(q.id);
    const hidden = await getHiddenQuestions();
    setHiddenQuestions(hidden);
    const visible = await getVisibleQuestions();
    setQuestions(visible);
  };

  const deleteHiddenQuestion = async (q: Question) => {
    await deleteQuestionCompletely(q.id);
    const hidden = await getHiddenQuestions();
    setHiddenQuestions(hidden);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/instellingen')}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={c.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.text }]}>Vragen</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {loading ? (
            <Text style={[styles.empty, { color: c.textMuted }]}>Laden…</Text>
          ) : (
            questions.map((q) => (
              <View key={q.id} style={styles.questionWrapper}>
                <View
                  style={[
                    styles.questionRow,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                >
                  <View style={styles.questionLeft}>
                    <Text style={[styles.questionText, { color: c.text }]}>
                      {q.text}
                    </Text>
                    <Text style={[styles.questionType, { color: c.textMuted }]}>
                      {typeLabel(q.type)}
                    </Text>
                  </View>

                  <View style={styles.rowActions}>
                    <Pressable
                      onPress={() => moveQuestion(q, 'up')}
                      hitSlop={8}
                      disabled={questions.findIndex((x) => x.id === q.id) === 0}
                      style={({ pressed }) => [
                        {
                          opacity:
                            questions.findIndex((x) => x.id === q.id) === 0
                              ? 0.25
                              : pressed
                                ? 0.6
                                : 1,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="chevron-up"
                        size={22}
                        color={c.textMuted}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => moveQuestion(q, 'down')}
                      hitSlop={8}
                      disabled={
                        questions.findIndex((x) => x.id === q.id) ===
                        questions.length - 1
                      }
                      style={({ pressed }) => [
                        {
                          opacity:
                            questions.findIndex((x) => x.id === q.id) ===
                            questions.length - 1
                              ? 0.25
                              : pressed
                                ? 0.6
                                : 1,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={22}
                        color={c.textMuted}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        setMenuOpenFor(menuOpenFor === q.id ? null : q.id)
                      }
                      hitSlop={10}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                      <MaterialCommunityIcons
                        name="dots-horizontal"
                        size={22}
                        color={c.textMuted}
                      />
                    </Pressable>
                  </View>
                </View>

                {menuOpenFor === q.id && (
                  <View
                    style={[
                      styles.menuBox,
                      { backgroundColor: c.surfaceHigh, borderColor: c.border },
                    ]}
                  >
                    <Pressable
                      onPress={() => openEdit(q)}
                      style={({ pressed }) => [
                        styles.menuItem,
                        { opacity: pressed ? 0.6 : 1 },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="pencil-outline"
                        size={18}
                        color={c.text}
                      />
                      <Text style={[styles.menuItemText, { color: c.text }]}>
                        Wijzigen
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => hideQuestionById(q)}
                      style={({ pressed }) => [
                        styles.menuItem,
                        { opacity: pressed ? 0.6 : 1 },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="eye-off-outline"
                        size={18}
                        color={c.text}
                      />
                      <Text style={[styles.menuItemText, { color: c.text }]}>
                        Verwijderen
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))
          )}

          <Pressable
            onPress={openNew}
            style={({ pressed }) => [
              styles.addButton,
              { borderColor: c.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="plus" size={20} color={c.primary} />
            <Text style={[styles.addButtonText, { color: c.primary }]}>
              Nieuwe vraag
            </Text>
          </Pressable>

          <Pressable
            onPress={openHiddenModal}
            style={({ pressed }) => [
              styles.hiddenLink,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.hiddenLinkText, { color: c.textMuted }]}>
              Bekijk verborgen vragen
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeModal}>
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: c.text }]}>
              {editing ? 'Wijzigen' : 'Nieuwe vraag'}
            </Text>

            <TextInput
              value={newText}
              onChangeText={setNewText}
              placeholder="Wat wil je jezelf vragen?"
              placeholderTextColor={c.textMuted}
              multiline
              style={[
                styles.modalInput,
                {
                  color: c.text,
                  borderColor: c.border,
                  backgroundColor: c.surfaceHigh,
                },
              ]}
            />

            <Text style={[styles.modalLabel, { color: c.textMuted }]}>TYPE</Text>

            <View style={styles.typeRow}>
              <Pressable
                onPress={() => setNewType('bool_text')}
                style={({ pressed }) => [
                  styles.typeButton,
                  {
                    borderColor: newType === 'bool_text' ? c.primary : c.border,
                    backgroundColor:
                      newType === 'bool_text' ? c.primary : 'transparent',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color:
                        newType === 'bool_text' ? c.primaryText : c.text,
                    },
                  ]}
                >
                  Ja/nee
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setNewType('text')}
                style={({ pressed }) => [
                  styles.typeButton,
                  {
                    borderColor: newType === 'text' ? c.primary : c.border,
                    backgroundColor:
                      newType === 'text' ? c.primary : 'transparent',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color: newType === 'text' ? c.primaryText : c.text,
                    },
                  ]}
                >
                  Tekst
                </Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={closeModal}
                style={({ pressed }) => [
                  styles.modalCancel,
                  { borderColor: c.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.modalCancelText, { color: c.text }]}>
                  Annuleren
                </Text>
              </Pressable>

              <Pressable
                onPress={saveQuestion}
                style={({ pressed }) => [
                  styles.modalSave,
                  { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={[styles.modalSaveText, { color: c.primaryText }]}>
                  {editing ? 'Opslaan' : 'Toevoegen'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={hiddenModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setHiddenModalOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setHiddenModalOpen(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: c.text }]}>
              Verborgen vragen
            </Text>

            {hiddenQuestions.length === 0 ? (
              <Text style={[styles.empty, { color: c.textMuted }]}>
                Geen verborgen vragen.
              </Text>
            ) : (
              hiddenQuestions.map((q) => (
                <View
                  key={q.id}
                  style={[
                    styles.hiddenRow,
                    { borderColor: c.border, backgroundColor: c.surfaceHigh },
                  ]}
                >
                  <Text style={[styles.hiddenRowText, { color: c.text }]}>
                    {q.text}
                  </Text>
                  <View style={styles.hiddenActions}>
                    <Pressable
                      onPress={() => restoreHiddenQuestion(q)}
                      style={({ pressed }) => [
                        styles.hiddenActionButton,
                        {
                          borderColor: c.primary,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text style={[styles.hiddenActionText, { color: c.primary }]}>
                        Terugzetten
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => deleteHiddenQuestion(q)}
                      style={({ pressed }) => [
                        styles.hiddenActionButton,
                        {
                          borderColor: c.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.hiddenActionText, { color: c.textMuted }]}
                      >
                        Definitief wissen
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            <Pressable
              onPress={() => setHiddenModalOpen(false)}
              style={({ pressed }) => [
                styles.modalCancel,
                {
                  borderColor: c.border,
                  opacity: pressed ? 0.7 : 1,
                  marginTop: Spacing.md,
                },
              ]}
            >
              <Text style={[styles.modalCancelText, { color: c.text }]}>
                Sluiten
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  empty: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
  questionWrapper: {
    gap: Spacing.xs,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  questionLeft: {
    flex: 1,
    gap: 2,
    paddingRight: Spacing.md,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
  },
  questionType: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  menuBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.xs,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  menuItemText: {
    fontSize: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  hiddenLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  hiddenLinkText: {
    fontSize: 14,
  },
  hiddenRow: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  hiddenRowText: {
    fontSize: 15,
    lineHeight: 21,
  },
  hiddenActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  hiddenActionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  hiddenActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalInput: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalSave: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
  },
});