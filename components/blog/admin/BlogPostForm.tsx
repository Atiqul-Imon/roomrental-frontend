'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { JSONContent } from '@tiptap/core';
import { api } from '@/lib/api';
import { BlogRichTextEditor } from '@/components/blog/editor/BlogRichTextEditor';
import { emptyDoc } from '@/lib/blog/default-doc';
import { BLOG_POST_STATUSES, type BlogPostStatus } from '@/lib/blog/blog-constants';
import { Button } from '@/components/ui/Button';
import { ImagePlus, Loader2, Save } from 'lucide-react';

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentJson: JSONContent;
  status: BlogPostStatus;
  publishedAt: string | null;
  scheduledFor: string | null;
  categoryId: string | null;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  focusKeyword: string | null;
  keywords: string[];
  robotsIndex: boolean;
  robotsFollow: boolean;
  isFeatured: boolean;
  tags?: { name: string; slug: string }[];
}

export function BlogPostForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = Boolean(postId);

  const { data: loaded, isLoading: loadingPost } = useQuery({
    queryKey: ['admin-blog-post', postId],
    enabled: isEdit,
    queryFn: async () => {
      const res = await api.get(`/admin/blog/posts/${postId}`);
      return res.data.data.post as AdminPost;
    },
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: async () => {
      const res = await api.get('/admin/blog/categories');
      return (res.data.data.categories || []) as AdminCategory[];
    },
  });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentJson, setContentJson] = useState<JSONContent>(emptyDoc());
  const [status, setStatus] = useState<BlogPostStatus>('draft');
  const [publishedAt, setPublishedAt] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    if (!loaded) return;
    setTitle(loaded.title);
    setSlug(loaded.slug);
    setExcerpt(loaded.excerpt || '');
    setContentJson(loaded.contentJson || emptyDoc());
    setStatus(loaded.status);
    setPublishedAt(
      loaded.publishedAt ? loaded.publishedAt.slice(0, 16) : '',
    );
    setScheduledFor(
      loaded.scheduledFor ? loaded.scheduledFor.slice(0, 16) : '',
    );
    setCategoryId(loaded.categoryId || '');
    setCoverImageUrl(loaded.coverImageUrl || '');
    setMetaTitle(loaded.metaTitle || '');
    setMetaDescription(loaded.metaDescription || '');
    setCanonicalUrl(loaded.canonicalUrl || '');
    setOgImageUrl(loaded.ogImageUrl || '');
    setFocusKeyword(loaded.focusKeyword || '');
    setKeywordsText((loaded.keywords || []).join(', '));
    setRobotsIndex(loaded.robotsIndex);
    setRobotsFollow(loaded.robotsFollow);
    setIsFeatured(loaded.isFeatured);
    setTagsText((loaded.tags || []).map((t) => t.name).join(', '));
  }, [loaded]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const keywords = keywordsText
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      const payload = {
        title,
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        contentJson,
        status,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        categoryId: categoryId || null,
        coverImageUrl: coverImageUrl.trim() || null,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        canonicalUrl: canonicalUrl.trim() || null,
        ogImageUrl: ogImageUrl.trim() || null,
        focusKeyword: focusKeyword.trim() || null,
        keywords,
        robotsIndex,
        robotsFollow,
        isFeatured,
        tags,
      };

      if (isEdit) {
        const res = await api.patch(`/admin/blog/posts/${postId}`, payload);
        return res.data.data.post as AdminPost;
      }
      const res = await api.post('/admin/blog/posts', {
        ...payload,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      });
      return res.data.data.post as AdminPost;
    },
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      qc.invalidateQueries({ queryKey: ['admin-blog-post', post.id] });
      if (!isEdit) router.push(`/admin/blog/${post.id}/edit`);
    },
  });

  const uploadCover = async (file: File) => {
    const form = new FormData();
    form.append('image', file);
    const res = await api.post('/upload/image', form);
    const url = res.data?.data?.url;
    if (url) setCoverImageUrl(url);
  };

  const fieldClass = useMemo(
    () =>
      'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
    [],
  );

  if (isEdit && loadingPost) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading editor…
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit article' : 'New article'}
        </h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/blog')}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !title.trim()}
            className="gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? 'Save changes' : 'Create draft'}
          </Button>
        </div>
      </div>

      {saveMutation.isError && (
        <p className="text-red-600 text-sm">
          {(saveMutation.error as Error)?.message || 'Save failed'}
        </p>
      )}

      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Content
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            className={fieldClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (optional)
          </label>
          <input
            className={fieldClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-slug"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className={fieldClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as BlogPostStatus)}
            >
              {BLOG_POST_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className={fieldClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">— None —</option>
              {(categoriesRes || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {status === 'scheduled' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publish after (scheduled)
            </label>
            <input
              type="datetime-local"
              className={fieldClass}
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Published at (optional override)
          </label>
          <input
            type="datetime-local"
            className={fieldClass}
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <textarea
            className={`${fieldClass} min-h-[88px]`}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary for cards and meta"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
          <BlogRichTextEditor value={contentJson} onChange={setContentJson} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            className={fieldClass}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="Comma-separated, e.g. housing, students, guides"
          />
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Featured image
        </h2>
        <div className="flex flex-wrap gap-3 items-start">
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt=""
              className="w-40 h-28 object-cover rounded-lg border border-gray-100"
            />
          )}
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
            <ImagePlus className="w-4 h-4" />
            Upload cover
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadCover(f);
              }}
            />
          </label>
          <input
            className={`${fieldClass} flex-1 min-w-[200px]`}
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="Or paste image URL"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Featured on blog index
        </label>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          SEO
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta title</label>
          <input
            className={fieldClass}
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Defaults to article title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta description
          </label>
          <textarea
            className={`${fieldClass} min-h-[80px]`}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            maxLength={320}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Canonical URL
          </label>
          <input
            className={fieldClass}
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Open Graph image</label>
          <input
            className={fieldClass}
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
            placeholder="Defaults to cover image"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Focus keyword
          </label>
          <input
            className={fieldClass}
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extra keywords (comma-separated)
          </label>
          <input
            className={fieldClass}
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={robotsIndex}
              onChange={(e) => setRobotsIndex(e.target.checked)}
            />
            Index (allow search engines)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={robotsFollow}
              onChange={(e) => setRobotsFollow(e.target.checked)}
            />
            Follow links
          </label>
        </div>
      </section>
    </div>
  );
}
