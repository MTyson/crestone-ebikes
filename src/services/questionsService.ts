import { supabase } from '../lib/supabase';
import { AppUser } from '../types/listing';
import { Question } from '../types/question';

/**
 * "Ask Wade" data layer.
 *
 * Questions are private to the asker. Admins (Wade + Matthew) read them all in
 * the in-app inbox and reply by email. Without Supabase (prototype mode) they
 * live in localStorage only.
 */

const LOCAL_KEY = 'crestone_questions_v1';
const PENDING_KEY = 'crestone_pending_question_v1';
const COLUMNS =
  'id, created_at, updated_at, user_id, asker_email, question, answered_at, answer';

export const MAX_QUESTION_LENGTH = 1500;

/**
 * UI-only hint for showing the inbox. Real access control is enforced by the
 * is_admin() function + RLS in supabase/schema.sql (keep the two lists in sync).
 */
const ADMIN_EMAILS = ['lockiew@yahoo.com', 'matthewcarltyson@gmail.com'];

export function isAdminUser(user: AppUser | null): boolean {
  return Boolean(user && ADMIN_EMAILS.includes(user.email.toLowerCase()));
}

// --- Pending question (survives the magic-link round trip) ------------------

export function savePendingQuestion(email: string, question: string): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify({ email, question }));
}

export function peekPendingQuestion(): { email: string; question: string } | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as { email: string; question: string }) : null;
  } catch {
    return null;
  }
}

export function clearPendingQuestion(): void {
  localStorage.removeItem(PENDING_KEY);
}

// --- Local (prototype) helpers ----------------------------------------------

function readLocal(): Question[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Question[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: Question[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

// --- Public API ---------------------------------------------------------------

/** The signed-in user's own questions. */
export async function fetchMyQuestions(user: AppUser): Promise<Question[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('questions')
      .select(COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Question[];
  }
  return readLocal().filter((q) => q.user_id === user.id);
}

/** Admin inbox: every question (RLS returns nothing for non-admins' other rows). */
export async function fetchInbox(): Promise<Question[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('questions')
      .select(COLUMNS)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Question[];
  }
  return readLocal();
}

export async function setQuestionAnswered(id: string, answered: boolean): Promise<Question> {
  const answered_at = answered ? new Date().toISOString() : null;
  if (supabase) {
    const { data, error } = await supabase
      .from('questions')
      .update({ answered_at })
      .eq('id', id)
      .select(COLUMNS);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Only admins can do that.');
    return data[0] as Question;
  }
  const items = readLocal().map((q) => (q.id === id ? { ...q, answered_at } : q));
  writeLocal(items);
  return items.find((q) => q.id === id)!;
}

/** Saves Wade's written answer (marks answered; clearing it reopens the question). */
export async function setQuestionAnswer(id: string, answer: string): Promise<Question> {
  const clean = answer.trim();
  const patch = { answer: clean || null, answered_at: clean ? new Date().toISOString() : null };
  if (supabase) {
    const { data, error } = await supabase
      .from('questions')
      .update(patch)
      .eq('id', id)
      .select(COLUMNS);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Only admins can do that.');
    return data[0] as Question;
  }
  const items = readLocal().map((q) => (q.id === id ? { ...q, ...patch } : q));
  writeLocal(items);
  return items.find((q) => q.id === id)!;
}

export async function createQuestion(text: string, user: AppUser): Promise<Question> {
  const clean = text.trim();
  if (supabase) {
    const { data, error } = await supabase
      .from('questions')
      .insert({ question: clean, user_id: user.id, asker_email: user.email })
      .select(COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return data as Question;
  }
  const question: Question = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: user.id,
    asker_email: user.email,
    question: clean,
    answered_at: null,
  };
  writeLocal([question, ...readLocal()]);
  return question;
}

export async function updateQuestion(id: string, text: string): Promise<Question> {
  const clean = text.trim();
  if (supabase) {
    const { data, error } = await supabase
      .from('questions')
      .update({ question: clean })
      .eq('id', id)
      .select(COLUMNS);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('You can only edit your own questions.');
    return data[0] as Question;
  }
  const items = readLocal().map((q) =>
    q.id === id ? { ...q, question: clean, answered_at: null } : q
  );
  writeLocal(items);
  return items.find((q) => q.id === id)!;
}
