export interface Question {
  id: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  asker_email: string;
  question: string;
  answered_at?: string | null;
}
