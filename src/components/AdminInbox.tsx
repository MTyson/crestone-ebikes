import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Inbox, RefreshCw, Reply, Undo2 } from 'lucide-react';
import { Question } from '../types/question';
import { fetchInbox, setQuestionAnswered } from '../services/questionsService';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

/** Admin-only inbox of "Ask Wade" questions. Rendered only for admin users. */
export const AdminInbox: React.FC = () => {
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswered, setShowAnswered] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchInbox());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the inbox.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (q: Question) => {
    try {
      const updated = await setQuestionAnswered(q.id, !q.answered_at);
      setItems((prev) => prev.map((i) => (i.id === q.id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update.');
    }
  };

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
        <p className="text-xs text-stone-600 mt-1">Only visible to admins. Hit Reply to answer by email.</p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-sm text-stone-600">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="text-sm text-stone-600">No questions waiting. 🎉</p>
          ) : (
            shown.map((q) => (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-4 ${
                  q.answered_at ? 'border-stone-200 opacity-70' : 'border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="text-xs text-stone-500">
                    <strong className="text-stone-900 text-sm">{q.asker_email}</strong>
                    <span className="ml-2">{formatDate(q.created_at)}</span>
                    {q.updated_at && q.updated_at !== q.created_at && q.updated_at.slice(0, 19) !== q.created_at.slice(0, 19) && (
                      <span className="ml-2 italic">(edited)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${q.asker_email}?subject=${encodeURIComponent(
                        'Re: your Crestone E-Bike question'
                      )}&body=${encodeURIComponent(`> ${q.question.replace(/\n/g, '\n> ')}\n\n`)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply
                    </a>
                    <button
                      type="button"
                      onClick={() => void toggle(q)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      {q.answered_at ? (
                        <>
                          <Undo2 className="w-3.5 h-3.5" /> Reopen
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark answered
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-stone-800 whitespace-pre-wrap">{q.question}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

