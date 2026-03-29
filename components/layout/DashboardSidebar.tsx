'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Home,
  User,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Search,
  Heart,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: user.role === 'landlord' ? '/landlord/dashboard' : user.role === 'student' ? '/dashboard' : '/admin/dashboard',
      },
      {
        icon: Search,
        label: 'Browse',
        href: '/listings',
      },
      {
        icon: MessageSquare,
        label: 'Messages',
        href: '/messages',
      },
      {
        icon: Heart,
        label: 'Favorites',
        href: '/favorites',
      },
    ];

    if (user.role === 'landlord') {
      return [
        ...baseItems,
        {
          icon: Home,
          label: 'My Listings',
          href: '/landlord/listings',
        },
        {
          icon: Plus,
          label: 'Create Listing',
          href: '/listings/create',
        },
        {
          icon: BarChart3,
          label: 'Analytics',
          href: '/landlord/analytics',
        },
        {
          icon: User,
          label: 'Profile',
          href: '/landlord/profile',
        },
        {
          icon: Settings,
          label: 'Settings',
          href: '/landlord/settings',
        },
      ];
    } else if (user.role === 'student') {
      return [
        ...baseItems,
        {
          icon: User,
          label: 'Profile',
          href: `/profile/${user.id}`,
        },
        {
          icon: Settings,
          label: 'Settings',
          href: '/settings',
        },
      ];
    } else if (['admin', 'super_admin', 'staff'].includes(user.role)) {
      return [
        ...baseItems,
        {
          icon: Home,
          label: 'Listings',
          href: '/admin/listings',
        },
        {
          icon: User,
          label: 'Users',
          href: '/admin/users',
        },
        {
          icon: Settings,
          label: 'Settings',
          href: '/admin/settings',
        },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();
  const roleLabel = user.role === 'landlord' ? 'LANDLORD' : user.role === 'student' ? 'STUDENT' : 'ADMIN';

  return (
    <>
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-grey-200 z-50 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-grey-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-grey-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} profileImage={user.profileImage} seed={user.id} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-grey-900 truncate">{user?.name}</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mt-1">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-medium'
                      : 'text-grey-700 hover:bg-grey-100 hover:text-primary-600'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-grey-200 bg-white flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-grey-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

