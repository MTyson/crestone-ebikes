import { supabase } from '../lib/supabase';
import { NewPostInput, Post } from '../types/post';

/** Public Q&A / updates log. Admin-only writes are enforced by RLS in schema.sql. */

const LOCAL_KEY = 'crestone_posts_v1';
const COLUMNS = 'id, created_at, title, question, body, author_name';

function readLocal(): Post[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Post[]) : [];
  } catch {
    return [];
  }
}

export async function fetchPosts(): Promise<Post[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select(COLUMNS)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Post[];
  }
  return readLocal();
}

export async function createPost(input: NewPostInput): Promise<Post> {
  const row = {
    title: input.title?.trim() || null,
    question: input.question?.trim() || null,
    body: input.body.trim(),
  };
  if (supabase) {
    const { data, error } = await supabase.from('posts').insert(row).select(COLUMNS).single();
    if (error) throw new Error(error.message);
    return data as Post;
  }
  const post: Post = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    author_name: 'Wade',
    ...row,
  };
  localStorage.setItem(LOCAL_KEY, JSON.stringify([post, ...readLocal()]));
  return post;
}

export async function deletePost(id: string): Promise<void> {
  if (supabase) {
    const { data, error } = await supabase.from('posts').delete().eq('id', id).select('id');
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Only admins can delete posts.');
    return;
  }
  localStorage.setItem(LOCAL_KEY, JSON.stringify(readLocal().filter((p) => p.id !== id)));
}

