/**
 * Server-side blog API helpers (RSC, sitemap, RSS).
 * Uses public /api/blog/* routes — no auth.
 */

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://api.roomrentalusa.com' : 'http://localhost:5000');

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase}/api${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init?.headers },
      next: init?.next ?? { revalidate: 120 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (body?.success && body?.data) return body.data as T;
    return null;
  } catch {
    return null;
  }
}

export interface BlogPostsPayload {
  posts: import('./types').BlogPostListItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export async function serverFetchBlogPosts(params: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
}): Promise<BlogPostsPayload | null> {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.category) sp.set('category', params.category);
  if (params.tag) sp.set('tag', params.tag);
  if (params.search) sp.set('search', params.search);
  if (params.featured) sp.set('featured', '1');
  const q = sp.toString();
  return fetchJson<BlogPostsPayload>(`/blog/posts${q ? `?${q}` : ''}`);
}

export async function serverFetchBlogPostBySlug(slug: string) {
  const data = await fetchJson<{ post: import('./types').BlogPostDetail }>(
    `/blog/posts/${encodeURIComponent(slug)}`,
    { next: { revalidate: 300 } },
  );
  return data?.post ?? null;
}

export async function serverFetchBlogCategories() {
  return fetchJson<{ categories: import('./types').BlogCategoryWithCount[] }>('/blog/categories');
}

export async function serverFetchBlogSlugsForSitemap(limit = 2000): Promise<
  { slug: string; updatedAt: string }[]
> {
  const out: { slug: string; updatedAt: string }[] = [];
  let page = 1;
  const pageSize = 100;
  while (out.length < limit) {
    const batch = await fetchJson<BlogPostsPayload>(
      `/blog/posts?page=${page}&limit=${pageSize}`,
      { next: { revalidate: 3600 } },
    );
    if (!batch?.posts?.length) break;
    for (const p of batch.posts) {
      out.push({ slug: p.slug, updatedAt: p.updatedAt });
    }
    if (batch.posts.length < pageSize || page >= batch.pagination.totalPages) break;
    page += 1;
  }
  return out;
}
