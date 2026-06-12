export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage?: string | null;
  tag?: string | null;
  readMinutes: number;
  isPublished?: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: 'NEW' | 'READ';
  createdAt: string;
}
