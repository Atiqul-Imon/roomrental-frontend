'use client';

export const dynamic = 'force-dynamic';

import { BlogPostForm } from '@/components/blog/admin/BlogPostForm';
import { BlogAdminDenied } from '@/components/blog/admin/BlogAdminDenied';
import { useAuth } from '@/lib/auth-context';

export default function AdminBlogNewPage() {
  const { hasPermission } = useAuth();

  if (!hasPermission('manage_blog')) {
    return <BlogAdminDenied />;
  }

  return <BlogPostForm />;
}
