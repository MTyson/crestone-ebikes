export interface Post {
  id: string;
  created_at: string;
  title?: string | null;
  /** Set for published Q&A entries (never includes the asker's email). */
  question?: string | null;
  body: string;
  author_name: string;
}

export interface NewPostInput {
  title?: string;
  question?: string;
  body: string;
}

