/**
 * Mobile Navigation Component
 * Phase 3: Advanced Features - Mobile Experience
 * 
 * Provides bottom navigation bar for mobile devices
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Heart, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export function MobileNavigation() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      active: pathname === '/',
    },
    {
      href: '/listings',
      icon: Search,
      label: 'Browse',
      active: pathname.startsWith('/listings'),
    },
    ...(isAuthenticated
      ? [
          {
            href: '/listings/create',
            icon: Plus,
            label: 'Create',
            active: pathname === '/listings/create',
            requireAuth: true,
          },
        ]
      : []),
    ...(isAuthenticated
      ? [
          {
            href: '/favorites',
            icon: Heart,
            label: 'Favorites',
            active: pathname === '/favorites',
            requireAuth: true,
          },
        ]
      : []),
    {
      href: isAuthenticated ? `/profile/${user?.id}` : '/auth/login',
      icon: User,
      label: 'Profile',
      active: pathname.startsWith('/profile') || pathname.startsWith('/auth'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-grey-200 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'flex-1 h-full rounded-lg transition-all duration-200',
                'active:scale-95',
                item.active
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-grey-500 hover:text-primary-600 hover:bg-grey-50'
              )}
              aria-label={item.label}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}





























