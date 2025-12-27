'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { Home, Search, Heart, MessageSquare, User } from 'lucide-react';
import { chatApi } from '@/lib/chat-api';

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Get unread message count
  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => chatApi.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = unreadData ?? 0;

  // Determine active route
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  // Navigation items
  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      show: true,
    },
    {
      href: '/listings',
      label: 'Browse',
      icon: Search,
      show: true,
    },
    {
      href: '/favorites',
      label: 'Favorites',
      icon: Heart,
      show: isAuthenticated,
    },
    {
      href: '/chat',
      label: 'Messages',
      icon: MessageSquare,
      show: isAuthenticated,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      href: isAuthenticated && user ? `/profile/${user.id}` : '/auth/login',
      label: 'Profile',
      icon: User,
      show: true,
    },
  ].filter(item => item.show);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-grey-200 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center 
                flex-1 h-full min-h-[44px]
                transition-all duration-200
                ${active 
                  ? 'text-primary-600' 
                  : 'text-grey-600 hover:text-primary-600'
                }
              `}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'scale-110' : ''
                  }`}
                  aria-hidden="true"
                />
                {item.badge && item.badge > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    aria-label={`${item.badge} unread messages`}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span 
                className={`
                  text-[10px] font-medium mt-0.5
                  transition-all duration-200
                  ${active ? 'scale-105' : ''}
                `}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

