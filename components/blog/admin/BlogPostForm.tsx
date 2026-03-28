'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { JSONContent } from '@tiptap/core';
import axios from 'axios';
import { api } from '@/lib/api';
import { BlogRichTextEditor } from '@/components/blog/editor/BlogRichTextEditor';
import { emptyDoc } from '@/lib/blog/default-doc';
import { BLOG_POST_STATUSES, type BlogPostStatus } from '@/lib/blog/blog-constants';
import { Button } from '@/components/ui/Button';
import { BlogAdminPageHeader } from '@/components/blog/admin/BlogAdminPageHeader';
import {
  ImagePlus,
  Loader2,
  Save,
  FileText,
  Image as ImageIcon,
  Search,
  Sparkles,
  ExternalLink,
  LayoutList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatSaveError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data) {
    const msg = (err.response.data as { message?: string | string[] }).message;
    if (Array.isArray(msg)) return msg.filter(Boolean).join(' ');
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  if (err instanceof Error) return err.message;
  return 'Save failed. Try again.';
}

type ComposerTab = 'content' | 'media' | 'seo';

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

const inputBase =
  'w-full rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/15';

const labelBase = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';

export function BlogPostForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = Boolean(postId);
  const [tab, setTab] = useState<ComposerTab>('content');

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
    setPublishedAt(loaded.publishedAt ? loaded.publishedAt.slice(0, 16) : '');
    setScheduledFor(loaded.scheduledFor ? loaded.scheduledFor.slice(0, 16) : '');
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

  const metaDescLen = metaDescription.length;
  const tabs: { id: ComposerTab; label: string; icon: typeof FileText }[] = [
    { id: 'content', label: 'Story', icon: FileText },
    { id: 'media', label: 'Media & spotlight', icon: ImageIcon },
    { id: 'seo', label: 'Discovery & SEO', icon: Search },
  ];

  const publicPreviewSlug = slug.trim() || title.toLowerCase().replace(/\s+/g, '-') || 'draft';

  const breadcrumbs = useMemo(() => {
    const base = [
      { label: 'Admin', href: '/admin/dashboard' },
      { label: 'Blog', href: '/admin/blog' },
    ];
    if (isEdit && loaded) {
      return [...base, { label: loaded.title.slice(0, 42) + (loaded.title.length > 42 ? '…' : '') }];
    }
    return [...base, { label: isEdit ? 'Edit' : 'New article' }];
  }, [isEdit, loaded]);

  if (isEdit && loadingPost) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Loading composer…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-24 lg:pb-8">
      <BlogAdminPageHeader
        eyebrow="RoomRentalUSA Editorial"
        title={isEdit ? 'Edit story' : 'Compose a new story'}
        description={
          isEdit
            ? 'Update copy, schedule, and search metadata. Changes save to your newsroom instantly.'
            : 'Draft with a distraction-free flow—structure your story, add media, then tune how it appears in search and social.'
        }
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-200 bg-white/80"
              onClick={() => router.push('/admin/blog')}
            >
              <LayoutList className="mr-1.5 h-4 w-4 opacity-70" />
              All posts
            </Button>
            <a
              href={`/blog/${encodeURIComponent(publicPreviewSlug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-800"
            >
              <ExternalLink className="mr-1.5 h-4 w-4" />
              View live
            </a>
          </div>
        }
      />

      {saveMutation.isError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
          {formatSaveError(saveMutation.error)}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Main column */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Tab switcher */}
          <div className="flex gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 shadow-inner ring-1 ring-slate-900/5">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                    active
                      ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-slate-200/80'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900',
                  )}
                >
                  <Icon className={cn('h-4 w-4', active ? 'text-emerald-600' : 'text-slate-400')} />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Story */}
          {tab === 'content' && (
            <section className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.02] sm:p-8">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                  01
                </span>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Story & workflow</h2>
                  <p className="text-xs text-slate-500">Headline, URL, scheduling, and body copy</p>
                </div>
              </div>

              <div>
                <label className={labelBase}>Headline</label>
                <input
                  className={cn(inputBase, 'text-lg font-semibold tracking-tight')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Compelling headline readers will remember"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelBase}>URL slug</label>
                  <div className="flex rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-sm ring-1 ring-slate-900/5">
                    <span className="flex shrink-0 items-center border-r border-slate-200/80 px-3 text-xs text-slate-400">
                      /blog/
                    </span>
                    <input
                      className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm focus:ring-0"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="your-story-slug"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelBase}>Section</label>
                  <select
                    className={inputBase}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Uncategorized</option>
                    {(categoriesRes || []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelBase}>Workflow status</label>
                  <select
                    className={inputBase}
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
                {status === 'scheduled' && (
                  <div>
                    <label className={labelBase}>Go live at</label>
                    <input
                      type="datetime-local"
                      className={inputBase}
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelBase}>Publish timestamp (override)</label>
                <input
                  type="datetime-local"
                  className={inputBase}
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
              </div>

              <div>
                <label className={labelBase}>Deck / excerpt</label>
                <textarea
                  className={cn(inputBase, 'min-h-[100px] resize-y leading-relaxed')}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="One or two sentences for cards, listings, and social previews."
                />
              </div>

              <div>
                <label className={labelBase}>Body</label>
                <p className="mb-2 text-xs text-slate-500">
                  Rich text with headings, lists, links, and inline images—optimized for long-form reading.
                </p>
                <BlogRichTextEditor
                  value={contentJson}
                  onChange={setContentJson}
                  className="rounded-2xl border-slate-200/90 shadow-inner"
                />
              </div>

              <div>
                <label className={labelBase}>Topics & tags</label>
                <input
                  className={inputBase}
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="e.g. student housing, Boston, budgeting — comma separated"
                />
              </div>
            </section>
          )}

          {/* Media */}
          {tab === 'media' && (
            <section className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.02] sm:p-8">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-800">
                  02
                </span>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Lead art & spotlight</h2>
                  <p className="text-xs text-slate-500">Hero image and homepage featuring</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <label className={labelBase}>Hero image</label>
                  <div className="overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                    {coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverImageUrl}
                        alt=""
                        className="mx-auto max-h-56 w-full rounded-xl object-cover shadow-md"
                      />
                    ) : (
                      <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-slate-100/80 text-slate-400">
                        <ImageIcon className="mb-2 h-10 w-10 opacity-50" />
                        <span className="text-xs font-medium">No image yet</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/50">
                      <ImagePlus className="h-4 w-4 text-emerald-600" />
                      Upload
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
                  </div>
                  <div>
                    <label className={labelBase}>Or image URL</label>
                    <input
                      className={inputBase}
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-5 ring-1 ring-emerald-900/5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="font-semibold text-slate-900">Editor&apos;s pick</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Surface this story on the blog index as a featured card when space allows.
                      </p>
                      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-200/60 bg-white/80 px-4 py-3 shadow-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                        <span className="text-sm font-medium text-slate-800">Feature on blog home</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SEO */}
          {tab === 'seo' && (
            <section className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.02] sm:p-8">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-900">
                  03
                </span>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Discovery & SEO</h2>
                  <p className="text-xs text-slate-500">How this story appears in search and when shared</p>
                </div>
              </div>

              <div>
                <label className={labelBase}>Search title</label>
                <input
                  className={inputBase}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Overrides headline in Google—keep under ~60 characters"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className={labelBase}>Meta description</label>
                  <span
                    className={cn(
                      'text-xs font-medium tabular-nums',
                      metaDescLen > 160 ? 'text-amber-600' : 'text-slate-400',
                    )}
                  >
                    {metaDescLen} / 160
                  </span>
                </div>
                <textarea
                  className={cn(inputBase, 'min-h-[100px]')}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={320}
                  placeholder="Search snippet—aim for ~150–160 characters for best display."
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelBase}>Canonical URL</label>
                  <input
                    className={inputBase}
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://www.roomrentalusa.com/blog/…"
                  />
                </div>
                <div>
                  <label className={labelBase}>Open Graph image</label>
                  <input
                    className={inputBase}
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    placeholder="Defaults to hero if empty"
                  />
                </div>
              </div>

              <div>
                <label className={labelBase}>Focus keyword</label>
                <input
                  className={inputBase}
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="Primary phrase you want this story to rank for"
                />
              </div>

              <div>
                <label className={labelBase}>Additional keywords</label>
                <input
                  className={inputBase}
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="Comma-separated supporting phrases"
                />
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="mb-3 text-xs font-semibold text-slate-800">Crawler policy</p>
                <div className="flex flex-wrap gap-6">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={robotsIndex}
                      onChange={(e) => setRobotsIndex(e.target.checked)}
                    />
                    Allow indexing
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={robotsFollow}
                      onChange={(e) => setRobotsFollow(e.target.checked)}
                    />
                    Follow links
                  </label>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar — publishing rail */}
        <aside className="w-full shrink-0 lg:w-[300px]">
          <div className="lg:sticky lg:top-4 space-y-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md ring-1 ring-slate-900/[0.03]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Publishing</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                  <select
                    className={inputBase}
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
                  <label className="mb-1 block text-xs font-medium text-slate-600">Section</label>
                  <select
                    className={inputBase}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Uncategorized</option>
                    {(categoriesRes || []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                type="button"
                className="mt-5 w-full gap-2 shadow-md"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !title.trim()}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEdit ? 'Save changes' : 'Create draft'}
              </Button>
              <p className="mt-3 text-center text-[11px] leading-snug text-slate-400">
                Autosave isn&apos;t enabled—tap save before you leave this page.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Newsroom tips</p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 text-slate-600">
                <li>Use a clear deck so cards and social previews stay compelling.</li>
                <li>Fill SEO fields for high-intent guides and evergreen stories.</li>
                <li>Featured stories rotate on the blog index—use sparingly.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <span className="truncate text-xs text-slate-500">
            {title.trim() ? title : 'Untitled draft'}
          </span>
          <Button
            type="button"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !title.trim()}
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
