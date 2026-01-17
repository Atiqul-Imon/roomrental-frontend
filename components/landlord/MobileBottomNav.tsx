'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  User,
  MessageSquare,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function MobileBottomNav() {
  const pathname = usePathname();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      try {
        const response = await api.get('/chat/unread-count');
        return response.data.count || 0;
      } catch {
        return 0;
      }
    },
    refetchInterval: 30000,
  });

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/landlord/dashboard',
    },
    {
      icon: Home,
      label: 'Listings',
      href: '/landlord/listings',
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      href: '/chat',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      icon: User,
      label: 'Profile',
      href: '/landlord/profile',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/landlord/dashboard') {
      return pathname === '/landlord/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-grey-200 shadow-lg lg:hidden">
        <div className="flex items-center justify-around h-16 px-2 relative overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-colors ${
                  active
                    ? 'text-primary-600'
                    : 'text-grey-500 hover:text-grey-700'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-transform ${
                      active ? 'scale-110' : ''
                    }`}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    active ? 'text-primary-600' : 'text-grey-500'
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      {/* Safe area for devices with home indicator - separate layer to ensure coverage */}
      <div className="fixed bottom-0 left-0 right-0 h-[env(safe-area-inset-bottom,0px)] bg-white z-[101] lg:hidden pointer-events-none" />
    </>
  );
}

