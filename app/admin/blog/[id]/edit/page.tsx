'use client';

export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { BlogPostForm } from '@/components/blog/admin/BlogPostForm';
import { useAuth } from '@/lib/auth-context';

export default function AdminBlogEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const { hasPermission } = useAuth();

  if (!hasPermission('manage_blog')) {
    return (
      <div className="p-8 text-center text-gray-600">
        You do not have permission to manage the blog.
      </div>
    );
  }

  if (!id) return null;

  return <BlogPostForm postId={id} />;
}
