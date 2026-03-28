'use client';

export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import {
  FolderTree,
  Loader2,
  Trash2,
  Plus,
  Hash,
  FileText,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { BlogAdminPageHeader } from '@/components/blog/admin/BlogAdminPageHeader';
import { BlogAdminDenied } from '@/components/blog/admin/BlogAdminDenied';
import { cn } from '@/lib/utils';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export default function AdminBlogCategoriesPage() {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const canManage = hasPermission('manage_blog');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog-categories'],
    enabled: canManage,
    queryFn: async () => {
      const res = await api.get('/admin/blog/categories');
      return (res.data.data.categories || []) as CategoryRow[];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      await api.post('/admin/blog/categories', {
        name,
        slug: slug.trim() || undefined,
      });
    },
    onSuccess: () => {
      setName('');
      setSlug('');
      qc.invalidateQueries({ queryKey: ['admin-blog-categories'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/blog/categories/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog-categories'] }),
  });

  const stats = useMemo(() => {
    const rows = data || [];
    const totalPosts = rows.reduce((acc, c) => acc + (c._count?.posts ?? 0), 0);
    return { count: rows.length, totalPosts };
  }, [data]);

  if (!canManage) {
    return <BlogAdminDenied />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      <BlogAdminPageHeader
        eyebrow="Taxonomy"
        title="Sections & categories"
        description="Group stories into clear sections for readers, navigation, and SEO. Slugs power URLs like /blog?category=guides."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Blog', href: '/admin/blog' },
          { label: 'Categories' },
        ]}
        actions={
          <Link href="/admin/blog">
            <Button variant="outline" size="sm" className="border-slate-200 bg-white/80">
              <ArrowLeft className="mr-1.5 h-4 w-4 opacity-70" />
              Posts
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</p>
              <p className="font-heading text-2xl font-bold tabular-nums text-slate-900">{stats.count}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-emerald-50/30 p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stories tagged</p>
              <p className="font-heading text-2xl font-bold tabular-nums text-slate-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create */}
      <div className="overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 via-white to-white shadow-md ring-1 ring-emerald-900/[0.04]">
        <div className="border-b border-emerald-100/80 bg-emerald-50/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h2 className="font-heading text-base font-semibold text-slate-900">Add a section</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Use a short, recognizable name. The slug appears in URLs—keep it lowercase and hyphenated.
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Display name
              </label>
              <input
                className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                placeholder="e.g. Renter guides"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Hash className="h-3 w-3" />
                Slug (optional)
              </label>
              <input
                className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 font-mono text-sm shadow-sm transition focus:border-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                placeholder="auto from name"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <Button
              type="button"
              className="h-11 gap-2 shadow-md lg:min-w-[140px]"
              disabled={!name.trim() || createMut.isPending}
              onClick={() => createMut.mutate()}
            >
              {createMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md ring-1 ring-slate-900/[0.02]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="font-heading text-sm font-semibold text-slate-900">All sections</h3>
          <span className="text-xs text-slate-500">{stats.count} total</span>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Loading taxonomy…</p>
          </div>
        ) : (data || []).length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FolderTree className="h-7 w-7 text-slate-400" />
            </div>
            <p className="font-medium text-slate-900">No sections yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
              Create your first category above—stories can be filed under it from the composer.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5 text-right">Stories</th>
                  <th className="w-16 px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data || []).map((c, i) => (
                  <tr
                    key={c.id}
                    className={cn(
                      'group transition-colors hover:bg-emerald-50/30',
                      i % 2 === 0 ? 'bg-white' : 'bg-slate-50/20',
                    )}
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{c.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {c.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-slate-700">
                      {c._count?.posts ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="inline-flex rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        title="Delete section"
                        onClick={() => {
                          if (
                            !confirm(
                              'Delete this section? Stories will become uncategorized—they are not deleted.',
                            )
                          )
                            return;
                          deleteMut.mutate(c.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
