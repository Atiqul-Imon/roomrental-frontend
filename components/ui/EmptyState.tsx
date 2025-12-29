'use client';

import { Home, Search, Heart, Inbox, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: 'home' | 'search' | 'heart' | 'inbox' | 'plus';
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}

const iconMap = {
  home: Home,
  search: Search,
  heart: Heart,
  inbox: Inbox,
  plus: Plus,
};

export function EmptyState({
  icon = 'inbox',
  title,
  message,
  actionLabel,
  actionHref,
  actionOnClick,
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4 text-center fade-in-up-delayed">
      <div className="mb-6 sm:mb-8 p-5 sm:p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl shadow-soft">
        <IconComponent className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-accent-600" />
      </div>
      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-grey-900 mb-3 sm:mb-4 leading-tight">{title}</h3>
      <p className="text-sm sm:text-base md:text-lg text-grey-600 mb-6 sm:mb-8 max-w-md leading-relaxed">{message}</p>
      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref} className="px-6 sm:px-8 py-3 sm:py-4 btn-gradient text-white rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-medium hover:shadow-hover-medium inline-block text-sm sm:text-base min-h-[44px] flex items-center justify-center">
              {actionLabel}
            </Link>
          ) : actionOnClick ? (
            <Button variant="primary" onClick={actionOnClick} className="min-h-[44px]">
              {actionLabel}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

