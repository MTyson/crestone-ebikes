import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, MailCheck, MessageCircleQuestion, Pencil, Send, X } from 'lucide-react';
import { AppUser } from '../types/listing';
import { Question } from '../types/question';
import { sendMagicLinkEmail } from '../services/listingsService';
import {
  MAX_QUESTION_LENGTH,
  clearPendingQuestion,
  createQuestion,
  fetchMyQuestions,
  peekPendingQuestion,
  savePendingQuestion,
  updateQuestion,
} from '../services/questionsService';

interface AskWadeSectionProps {
  currentUser: AppUser | null;
  onSignedIn: (user: AppUser) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const AskWadeSection: React.FC<AskWadeSectionProps> = ({ currentUser, onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const handlingPending = useRef(false);

  const userId = currentUser?.id ?? null;

  const loadQuestions = useCallback(async () => {
    if (!currentUser) {
      setQuestions([]);
      return;
    }
    try {
      setQuestions(await fetchMyQuestions(currentUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your questions.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  // After the email link brings the user back, submit the question they typed.
  useEffect(() => {
    if (!currentUser || handlingPending.current) return;
    const pending = peekPendingQuestion();
    if (!pending) return;
    handlingPending.current = true;
    clearPendingQuestion();
    (async () => {
      try {
        const question = await createQuestion(pending.question, currentUser);
        setQuestions((prev) => [question, ...prev]);
        setNotice(
          'You’re verified and your question was sent to Wade. He’ll reply to your email. You can edit it below if you spot a typo.'
        );
        document.getElementById('ask-wade')?.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not submit your question.');
      } finally {
        handlingPending.current = false;
      }
    })();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const clean = text.trim();
    if (clean.length < 5) {
      setError('Please write a little more so Wade can help.');
      return;
    }
    setBusy(true);
    try {
      if (currentUser) {
        const question = await createQuestion(clean, currentUser);
        setQuestions((prev) => [question, ...prev]);
        setText('');
        setNotice('Sent! Wade will reply to your email.');
      } else {
        const cleanEmail = email.trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
          setError('Please enter a valid email address.');
          return;
        }
        savePendingQuestion(cleanEmail, clean);
        const result = await sendMagicLinkEmail(cleanEmail);
        setText('');
        if (result.mode === 'supabase') {
          setNotice(
            `Check your inbox at ${cleanEmail}! Click the confirmation link to verify your email. Your question will then be sent to Wade, and you can edit it afterward.`
          );
        } else if (result.user) {
          onSignedIn(result.user);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your question.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditText(q.question);
    setError(null);
    setNotice(null);
  };

  const saveEdit = async (id: string) => {
    if (editText.trim().length < 5) {
      setError('Your question is too short.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const question = await updateQuestion(id, editText);
      setQuestions((prev) => prev.map((q) => (q.id === id ? question : q)));
      setEditingId(null);
      setNotice('Updated. Wade will see the corrected version.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your edit.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="ask-wade" className="py-16 bg-stone-50 border-b border-stone-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            Ask Wade
          </span>
          <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-3">
            Got an e-bike question?
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
            Ask Wade directly. Confirm your email with a one-click link, and your question goes
            straight to Wade, who replies to you privately. This is not a public forum, so nothing
            you write is posted on the site.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-4"
        >
          {currentUser ? (
            <p className="text-sm text-stone-600">
              Asking as <strong className="text-stone-900">{currentUser.email}</strong>
            </p>
          ) : (
            <div>
              <label htmlFor="ask-email" className="block text-sm font-semibold text-stone-800">
                Your email
              </label>
              <input
                id="ask-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-700"
              />
            </div>
          )}

          <div>
            <label htmlFor="ask-question" className="block text-sm font-semibold text-stone-800">
              Your question
            </label>
            <textarea
              id="ask-question"
              required
              rows={4}
              maxLength={MAX_QUESTION_LENGTH}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. My throttle cuts out on hills. Is that something you can fix?"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-700"
            />
            <div className="text-[11px] text-stone-500 text-right mt-0.5">
              {text.length}/{MAX_QUESTION_LENGTH}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
              {error}
            </div>
          )}
          {notice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm flex items-start gap-2.5">
              <MailCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {busy ? 'Sending…' : currentUser ? 'Send to Wade' : 'Verify email & send to Wade'}
            </span>
          </button>
        </form>

        {currentUser && questions.length > 0 && (
          <div className="mt-8 space-y-3">
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Your questions
            </h3>
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-2xl border border-stone-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs text-stone-500">{formatDate(q.created_at)}</span>
                  {editingId !== q.id && (
                    <button
                      type="button"
                      onClick={() => startEdit(q)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                {editingId === q.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={4}
                      maxLength={MAX_QUESTION_LENGTH}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void saveEdit(q.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm text-stone-800 whitespace-pre-wrap">{q.question}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

