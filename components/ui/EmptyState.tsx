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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 p-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full">
        <IconComponent className="w-12 h-12 text-primary-600" />
      </div>
      <h3 className="text-2xl font-bold text-grey-900 mb-2">{title}</h3>
      <p className="text-grey-600 mb-6 max-w-md">{message}</p>
      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref} className="px-6 py-3 btn-gradient text-white rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-medium inline-block">
              {actionLabel}
            </Link>
          ) : actionOnClick ? (
            <Button variant="primary" onClick={actionOnClick}>
              {actionLabel}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

