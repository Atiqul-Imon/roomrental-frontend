'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Home, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Haptic feedback helper
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      };
      navigator.vibrate(patterns[type]);
    }
  };

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
      href: isAuthenticated && user ? `/profile/${user.id}` : '/auth/login',
      label: 'Profile',
      icon: User,
      show: true,
    },
  ];

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-grey-200 md:hidden',
        'shadow-lg'
      )}
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
              onClick={() => triggerHaptic('light')}
              className={cn(
                'flex flex-col items-center justify-center',
                'flex-1 h-full min-h-[44px]',
                'color-transition',
                'active:scale-95',
                'relative',
                active 
                  ? 'text-primary-600' 
                  : 'text-grey-600 hover:text-primary-600'
              )}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'scale-110' : ''
                  }`}
                  aria-hidden="true"
                />
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
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary-600 rounded-t-full transition-all duration-200" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

