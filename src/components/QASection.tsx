import React, { useCallback, useEffect, useState } from 'react';
import { BookOpenText, Plus, Trash2 } from 'lucide-react';
import { AppUser } from '../types/listing';
import { Post } from '../types/post';
import { createPost, deletePost, fetchPosts } from '../services/postsService';
import { isAdminUser } from '../services/questionsService';

interface QASectionProps {
  currentUser: AppUser | null;
  /** Bump to reload (e.g. after the inbox publishes an answer). */
  refreshToken: number;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const QASection: React.FC<QASectionProps> = ({ currentUser, refreshToken }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const admin = isAdminUser(currentUser);

  const load = useCallback(async () => {
    try {
      setPosts(await fetchPosts());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const post = await createPost({ title, body });
      setPosts((prev) => [post, ...prev]);
      setTitle('');
      setBody('');
      setComposing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.');
    }
  };

  // Hide the whole section from visitors until there is something to read.
  if (!loading && posts.length === 0 && !admin) return null;

  return (
    <section id="qa" className="py-16 bg-white border-b border-stone-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 flex-wrap mb-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <BookOpenText className="w-3.5 h-3.5" />
              Q&amp;A &amp; Updates
            </span>
            <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-3">
              From Wade’s bench
            </h2>
          </div>
          {admin && !composing && (
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New post
            </button>
          )}
        </div>

        {admin && composing && (
          <form
            onSubmit={handlePublish}
            className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3"
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              placeholder="Title (optional)"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm bg-white"
            />
            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={6000}
              placeholder="Tip, announcement, or FAQ answer…"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm bg-white"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold cursor-pointer"
              >
                {busy ? 'Publishing…' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => setComposing(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-stone-600">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-stone-600">Nothing posted yet. Use “New post” to start.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs text-stone-500">
                    {post.author_name} · {formatDate(post.created_at)}
                  </div>
                  {admin && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(post)}
                      title="Delete post"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {post.question ? (
                  <>
                    <h3 className="font-serif-display text-lg font-bold text-stone-900 mt-1.5">
                      Q: {post.question}
                    </h3>
                    <p className="text-sm text-stone-700 mt-2 whitespace-pre-wrap leading-relaxed">
                      <strong className="text-emerald-800">Wade:</strong> {post.body}
                    </p>
                  </>
                ) : (
                  <>
                    {post.title && (
                      <h3 className="font-serif-display text-lg font-bold text-stone-900 mt-1.5">
                        {post.title}
                      </h3>
                    )}
                    <p className="text-sm text-stone-700 mt-2 whitespace-pre-wrap leading-relaxed">
                      {post.body}
                    </p>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

