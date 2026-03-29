'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { BookOpen, Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { BlogPostStatus } from '@/lib/blog/blog-constants';

interface AdminPostRow {
  id: string;
  title: string;
  slug: string;
  status: BlogPostStatus;
  publishedAt: string | null;
  updatedAt: string;
  author: { name: string | null; email: string };
  category: { name: string } | null;
}

export default function AdminBlogListPage() {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const canManage = hasPermission('manage_blog');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog-posts', page, search, status],
    enabled: canManage,
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await api.get('/admin/blog/posts', { params });
      return res.data.data as {
        posts: AdminPostRow[];
        pagination: { total: number; totalPages: number; page: number };
      };
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/blog/posts/${id}`);
    },
    onSuccess: async (_, deletedId) => {
      qc.setQueriesData<{ posts: AdminPostRow[]; pagination: { total: number; totalPages: number; page: number } }>(
        { queryKey: ['admin-blog-posts'] },
        (old) => {
          if (!old?.posts) return old;
          const posts = old.posts.filter((p) => p.id !== deletedId);
          const total = Math.max(0, old.pagination.total - 1);
          const limit = 20;
          const totalPages = Math.max(1, Math.ceil(total / limit));
          return { ...old, posts, pagination: { ...old.pagination, total, totalPages } };
        },
      );
      await qc.invalidateQueries({ queryKey: ['admin-blog-posts'], refetchType: 'active' });
    },
  });

  if (!canManage) {
    return (
      <div className="p-8 text-center text-gray-600">
        You do not have permission to manage the blog.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
            <p className="text-gray-600 text-sm">Articles, SEO, and categories</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/blog/categories">
            <Button variant="outline" size="sm">
              Categories
            </Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New article
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200"
            placeholder="Search title or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-200 px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.posts || []).map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.author?.name || p.author?.email}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {format(new Date(p.updatedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/blog/${p.id}/edit`}
                        className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        aria-label="Delete"
                        disabled={deleteMut.isPending}
                        onClick={() => {
                          if (!confirm('Delete this article permanently?')) return;
                          deleteMut.mutate(p.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && data.posts.length === 0 && !isLoading && (
          <p className="p-8 text-center text-gray-500">No posts yet. Create your first article.</p>
        )}
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
