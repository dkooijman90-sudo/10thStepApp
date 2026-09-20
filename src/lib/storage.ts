import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------- Types ----------

export type QuestionType = 'bool_text' | 'text';

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  position: number;
  hidden: boolean;
  createdAt: string;
};

export type Answer = {
  questionId: string;
  questionText: string;
  valueBool: boolean | null;
  valueText: string | null;
};

export type Entry = {
  date: string;
  answers: Answer[];
  note: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

// ---------- Keys ----------

const QUESTIONS_KEY = 'inventarisatie:questions';
const ENTRIES_KEY = 'inventarisatie:entries';

// ---------- Helpers ----------

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function todayKey(): string {
  const d = new Date();
  if (d.getHours() < 4) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ---------- Standaardvragen ----------

const DEFAULT_QUESTIONS: Omit<Question, 'id' | 'createdAt'>[] = [
  { text: 'Heb ik vandaag iemand schade berokkend?', type: 'bool_text', position: 0, hidden: false },
  { text: 'Moet ik iets goedmaken?', type: 'bool_text', position: 1, hidden: false },
  { text: 'Was ik goed voor mezelf?', type: 'bool_text', position: 2, hidden: false },
  { text: 'Koester ik wrok of frustratie?', type: 'bool_text', position: 3, hidden: false },
  { text: 'Was ik ergens oneerlijk?', type: 'bool_text', position: 4, hidden: false },
  { text: 'Was ik egocentrisch of bang?', type: 'bool_text', position: 5, hidden: false },
  { text: 'Wat ging goed vandaag?', type: 'text', position: 6, hidden: false },
  { text: 'Waar liep ik vast?', type: 'text', position: 7, hidden: false },
  { text: 'Waarvoor ben ik dankbaar?', type: 'text', position: 8, hidden: false },
];

// ---------- Questions ----------

export async function getQuestions(): Promise<Question[]> {
  const raw = await AsyncStorage.getItem(QUESTIONS_KEY);
  if (!raw) {
    const seeded: Question[] = DEFAULT_QUESTIONS.map((q) => ({
      ...q,
      id: uid(),
      createdAt: new Date().toISOString(),
    }));
    await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(raw) as Question[];
}

export async function getVisibleQuestions(): Promise<Question[]> {
  const all = await getQuestions();
  return all
    .filter((q) => !q.hidden)
    .sort((a, b) => a.position - b.position);
}

export async function getHiddenQuestions(): Promise<Question[]> {
  const all = await getQuestions();
  return all.filter((q) => q.hidden).sort((a, b) => a.position - b.position);
}

export async function addQuestion(text: string, type: QuestionType): Promise<Question> {
  const all = await getQuestions();
  const maxPos = all.reduce((m, q) => Math.max(m, q.position), -1);
  const newQ: Question = {
    id: uid(),
    text,
    type,
    position: maxPos + 1,
    hidden: false,
    createdAt: new Date().toISOString(),
  };
  all.push(newQ);
  await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(all));
  return newQ;
}

export async function updateQuestion(
  id: string,
  patch: Partial<Pick<Question, 'text' | 'type' | 'position'>>
): Promise<void> {
  const all = await getQuestions();
  const idx = all.findIndex((q) => q.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...patch };
  await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(all));

  // Als de tekst is gewijzigd, vervalt het antwoord van vandaag op deze vraag
  if (patch.text !== undefined) {
    const today = todayKey();
    const entries = await getAllEntries();
    const entryIdx = entries.findIndex((e) => e.date === today);
    if (entryIdx !== -1) {
      const entry = entries[entryIdx];
      const filtered = entry.answers.filter((a) => a.questionId !== id);
      if (filtered.length !== entry.answers.length) {
        entries[entryIdx] = {
          ...entry,
          answers: filtered,
          updatedAt: new Date().toISOString(),
        };
        await saveAllEntries(entries);
      }
    }
  }
}

export async function hideQuestion(id: string): Promise<void> {
  const all = await getQuestions();
  const idx = all.findIndex((q) => q.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], hidden: true };
  await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(all));
}

export async function restoreQuestion(id: string): Promise<void> {
  const all = await getQuestions();
  const idx = all.findIndex((q) => q.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], hidden: false };
  await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(all));
}

export async function deleteQuestionCompletely(id: string): Promise<void> {
  const all = await getQuestions();
  const filtered = all.filter((q) => q.id !== id);
  await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(filtered));
}

export async function reorderQuestions(orderedIds: string[]): Promise<void> {
  const all = await getQuestions();
  const map = new Map(all.map((q) => [q.id, q]));
  const reordered: Question[] = [];
  orderedIds.forEach((id, i) => {
    const q = map.get(id);
    if (q) reordered.push({ ...q, position: i });
  });
  all.forEach((q) => {
    if (!orderedIds.includes(q.id)) reordered.push(q);
  });
  await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(reordered));
}

// ---------- Entries ----------

export async function getAllEntries(): Promise<Entry[]> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Entry[];
}

async function saveAllEntries(entries: Entry[]): Promise<void> {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export async function getEntry(date: string): Promise<Entry | null> {
  const all = await getAllEntries();
  return all.find((e) => e.date === date) ?? null;
}

export async function getOrCreateTodayEntry(): Promise<Entry> {
  const date = todayKey();
  const existing = await getEntry(date);
  if (existing) return existing;
  const entry: Entry = {
    date,
    answers: [],
    note: '',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const all = await getAllEntries();
  all.push(entry);
  await saveAllEntries(all);
  return entry;
}

export async function saveAnswer(
  date: string,
  questionId: string,
  value: { valueBool?: boolean | null; valueText?: string | null }
): Promise<void> {
  const allQuestions = await getQuestions();
  const question = allQuestions.find((q) => q.id === questionId);
  const questionText = question?.text ?? '';

  const all = await getAllEntries();
  let idx = all.findIndex((e) => e.date === date);
  if (idx === -1) {
    const entry: Entry = {
      date,
      answers: [],
      note: '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(entry);
    idx = all.length - 1;
  }
  const entry = all[idx];
  const aIdx = entry.answers.findIndex((a) => a.questionId === questionId);
  const base: Answer = aIdx === -1
    ? { questionId, questionText, valueBool: null, valueText: null }
    : entry.answers[aIdx];
  const updated: Answer = {
    ...base,
    questionText,
    ...(value.valueBool !== undefined ? { valueBool: value.valueBool } : {}),
    ...(value.valueText !== undefined ? { valueText: value.valueText } : {}),
  };
  if (aIdx === -1) entry.answers.push(updated);
  else entry.answers[aIdx] = updated;
  entry.updatedAt = new Date().toISOString();
  await saveAllEntries(all);
}

export async function setEntryCompleted(date: string, completed: boolean): Promise<void> {
  const all = await getAllEntries();
  const idx = all.findIndex((e) => e.date === date);
  if (idx === -1) return;
  all[idx] = { ...all[idx], completed, updatedAt: new Date().toISOString() };
  await saveAllEntries(all);
}