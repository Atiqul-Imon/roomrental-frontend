export type BlogPostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export const BLOG_POST_STATUSES: { value: BlogPostStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];
