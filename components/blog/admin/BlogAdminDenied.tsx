'use client';

import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function BlogAdminDenied() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200/80">
        <ShieldOff className="h-8 w-8 text-slate-500" aria-hidden />
      </div>
      <h1 className="font-heading text-xl font-semibold text-slate-900">No access</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Your account doesn&apos;t have permission to manage the blog. Ask a super admin to grant
        the <span className="font-mono text-xs text-slate-800">manage_blog</span> permission.
      </p>
      <Link href="/admin/dashboard" className="mt-8">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  );
}
