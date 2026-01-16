'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Home,
  User,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  Plus,
  FileText,
  BarChart3,
} from 'lucide-react';
import { MobileBottomNav } from './MobileBottomNav';

interface LandlordLayoutProps {
  children: ReactNode;
}

export function LandlordLayout({ children }: LandlordLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user || user.role !== 'landlord') {
    router.push('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/landlord/dashboard',
    },
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
      icon: MessageSquare,
      label: 'Messages',
      href: '/chat',
    },
    {
      icon: User,
      label: 'Profile',
      href: '/landlord/profile',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/landlord/analytics',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/landlord/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-grey-200 z-[60] transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full pb-20 lg:pb-0">
          {/* Header */}
          <div className="p-6 border-b border-grey-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-grey-900">Landlord Panel</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-grey-600 hover:text-grey-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-grey-900 truncate">{user?.name}</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mt-1">
                  LANDLORD
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
                  onClick={() => setSidebarOpen(false)}
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
          <div className="p-4 border-t border-grey-200 bg-white">
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

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-grey-200 shadow-sm">
          <div className="flex items-center justify-between px-6 h-16 gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-grey-600 hover:text-grey-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <Link
              href="/"
              className="text-sm text-grey-600 hover:text-primary-600 font-medium transition-colors"
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 bg-grey-50 min-h-screen pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

