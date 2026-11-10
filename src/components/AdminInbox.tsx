import React, { useCallback, useEffect, useState } from 'react';
import { BookOpenText, CheckCircle2, Inbox, RefreshCw, Reply, Undo2 } from 'lucide-react';
import { Question } from '../types/question';
import {
  fetchInbox,
  setQuestionAnswer,
  setQuestionAnswered,
} from '../services/questionsService';
import { createPost } from '../services/postsService';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

interface AdminInboxProps {
  /** Called after an answer is published to the public Q&A. */
  onPublished: () => void;
}

/** Admin-only inbox of "Ask Wade" questions. Rendered only for admin users. */
export const AdminInbox: React.FC<AdminInboxProps> = ({ onPublished }) => {
  const [items, setItems] = useState<Question[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showAnswered, setShowAnswered] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInbox();
      setItems(data);
      setDrafts(Object.fromEntries(data.map((q) => [q.id, q.answer ?? ''])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the inbox.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = (updated: Question) =>
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    setInfo(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusyId(null);
    }
  };

  const saveAnswer = (q: Question) =>
    run(q.id, async () => {
      replace(await setQuestionAnswer(q.id, drafts[q.id] ?? ''));
      setInfo('Answer saved. The asker sees it under “Your questions” when they sign in.');
    });

  const toggleAnswered = (q: Question) =>
    run(q.id, async () => replace(await setQuestionAnswered(q.id, !q.answered_at)));

  const publish = (q: Question) =>
    run(q.id, async () => {
      const answer = (drafts[q.id] ?? '').trim();
      if (!answer) throw new Error('Write an answer first, then publish.');
      if (answer !== (q.answer ?? '')) replace(await setQuestionAnswer(q.id, answer));
      // Question text only — the asker's email is never published.
      await createPost({ question: q.question, body: answer });
      setInfo('Published to the Q&A section (without the asker’s email).');
      onPublished();
    });

  const open = items.filter((i) => !i.answered_at);
  const shown = showAnswered ? items : open;

  return (
    <section id="inbox" className="py-12 bg-amber-50 border-b border-amber-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-serif-display text-2xl font-bold text-stone-900 inline-flex items-center gap-2">
            <Inbox className="w-6 h-6 text-amber-700" />
            Wade’s Inbox
            <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
              {open.length} open
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showAnswered}
                onChange={(e) => setShowAnswered(e.target.checked)}
              />
              Show answered
            </label>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-xs font-semibold text-stone-800 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
        <p className="text-xs text-stone-600 mt-1">
          Only visible to admins. Write an answer to show it to the asker on the site. Use Reply to
          also email it, and Publish to add it to the public Q&amp;A.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
            {error}
          </div>
        )}
        {info && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm">
            {info}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-sm text-stone-600">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="text-sm text-stone-600">No questions waiting. 🎉</p>
          ) : (
            shown.map((q) => {
              const draft = drafts[q.id] ?? '';
              const busy = busyId === q.id;
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border p-4 ${
                    q.answered_at ? 'border-stone-200' : 'border-amber-300'
                  }`}
                >
                  <div className="text-xs text-stone-500">
                    <strong className="text-stone-900 text-sm">{q.asker_email}</strong>
                    <span className="ml-2">{formatDate(q.created_at)}</span>
                    {q.answered_at && (
                      <span className="ml-2 text-emerald-700 font-semibold">answered</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-stone-800 whitespace-pre-wrap">{q.question}</p>

                  <textarea
                    rows={3}
                    value={draft}
                    onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                    maxLength={4000}
                    placeholder="Write Wade’s answer…"
                    className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  />

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void saveAnswer(q)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Save answer
                    </button>
                    <a
                      href={`mailto:${q.asker_email}?subject=${encodeURIComponent(
                        'Re: your Crestone E-Bike question'
                      )}&body=${encodeURIComponent(
                        `${draft ? draft + '\n\n' : ''}> ${q.question.replace(/\n/g, '\n> ')}\n`
                      )}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply by email
                    </a>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void publish(q)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400 bg-amber-100 hover:bg-amber-200 disabled:opacity-60 text-amber-950 text-xs font-semibold cursor-pointer"
                    >
                      <BookOpenText className="w-3.5 h-3.5" />
                      Publish to Q&amp;A
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void toggleAnswered(q)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                    >
                      {q.answered_at ? (
                        <>
                          <Undo2 className="w-3.5 h-3.5" /> Reopen
                        </>
                      ) : (
                        'Mark answered'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
