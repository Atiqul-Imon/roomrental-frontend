'use client';

export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { BlogPostForm } from '@/components/blog/admin/BlogPostForm';
import { BlogAdminDenied } from '@/components/blog/admin/BlogAdminDenied';
import { useAuth } from '@/lib/auth-context';

export default function AdminBlogEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const { hasPermission } = useAuth();

  if (!hasPermission('manage_blog')) {
    return <BlogAdminDenied />;
  }

  if (!id) return null;

  return <BlogPostForm postId={id} />;
}
