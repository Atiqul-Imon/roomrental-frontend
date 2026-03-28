'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { FolderOpen, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';

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

  if (!canManage) {
    return (
      <div className="p-8 text-center text-gray-600">
        You do not have permission to manage the blog.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <FolderOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog categories</h1>
            <p className="text-gray-600 text-sm">Organize articles for readers and SEO</p>
          </div>
        </div>
        <Link href="/admin/blog">
          <Button variant="outline" size="sm">
            Back to posts
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-900">Add category</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            className="rounded-lg border border-gray-200 px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2"
            placeholder="Slug (optional)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          disabled={!name.trim() || createMut.isPending}
          onClick={() => createMut.mutate()}
        >
          {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 flex justify-center text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Posts</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {(data || []).map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.slug}</td>
                  <td className="px-4 py-3">{c._count?.posts ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => {
                        if (!confirm('Delete this category? Posts will become uncategorized.')) return;
                        deleteMut.mutate(c.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
