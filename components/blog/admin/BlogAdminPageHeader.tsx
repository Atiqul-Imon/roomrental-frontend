'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BlogAdminBreadcrumb {
  label: string;
  href?: string;
}

interface BlogAdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs: BlogAdminBreadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

export function BlogAdminPageHeader({
  eyebrow = 'Editorial',
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: BlogAdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6 sm:p-8 shadow-sm ring-1 ring-slate-900/5',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-slate-400/10 blur-3xl" />

      <nav aria-label="Breadcrumb" className="relative mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        {breadcrumbs.map((crumb, i) => (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="font-medium text-slate-600 transition-colors hover:text-emerald-700"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-800">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/90">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
