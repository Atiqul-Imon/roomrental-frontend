export type { BlogPostStatus } from './blog-constants';

export interface BlogAuthorPublic {
  id: string;
  name: string | null;
  profileImage: string | null;
}

export interface BlogCategoryPublic {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTagPublic {
  name: string;
  slug: string;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: import('./blog-constants').BlogPostStatus;
  publishedAt: string | null;
  scheduledFor: string | null;
  coverImageUrl: string | null;
  readingTimeMinutes: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  author: BlogAuthorPublic;
  category: BlogCategoryPublic | null;
  tags: BlogTagPublic[];
}

export interface BlogPostDetail extends BlogPostListItem {
  contentHtml: string;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  focusKeyword: string | null;
  keywords: string[];
  robotsIndex: boolean;
  robotsFollow: boolean;
  viewCount: number;
}

export interface BlogCategoryWithCount extends BlogCategoryPublic {
  description: string | null;
  _count?: { posts: number };
}
