'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  UserCog,
  FileText,
  Search,
  Home,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, hasPermission } = useAuth();
  const commandPalette = useCommandPalette();

  if (!isAdmin()) {
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
      href: '/admin/dashboard',
      permission: 'view_analytics',
    },
    {
      icon: Shield,
      label: 'Admins',
      href: '/admin/admins',
      permission: 'view_admins',
    },
    {
      icon: Users,
      label: 'Users',
      href: '/admin/users',
      permission: 'view_users',
    },
    {
      icon: Home,
      label: 'Landlords',
      href: '/admin/landlords',
      permission: 'view_users',
    },
    {
      icon: Building2,
      label: 'Listings',
      href: '/admin/listings',
      permission: 'view_listings',
    },
    {
      icon: MessageSquare,
      label: 'Reviews',
      href: '/admin/reviews',
      permission: 'view_reviews',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/admin/analytics',
      permission: 'view_analytics',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/admin/settings',
      permission: 'system_settings',
      superAdminOnly: true,
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'admin':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'staff':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-dark-bg-tertiary text-dark-text-secondary border-dark-border-default';
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-dark-bg-secondary border-r border-dark-border-default z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-dark-border-default">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gradient">Admin Panel</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-dark-text-muted hover:text-dark-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold shadow-glow-primary">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-dark-text-primary truncate">{user?.name}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${getRoleBadgeColor(user?.role || '')}`}>
                  {user?.role?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              // Check permissions
              if (item.permission && !hasPermission(item.permission)) {
                return null;
              }
              
              // Check super admin only
              if (item.superAdminOnly && user?.role !== 'super_admin') {
                return null;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-glow-primary'
                      : 'text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-primary-400'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full animate-pulse" />
                  )}
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-dark-border-default">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-dark-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
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
        <header className="sticky top-0 z-30 bg-dark-bg-secondary/80 backdrop-blur-md border-b border-dark-border-default shadow-dark-medium">
          <div className="flex items-center justify-between px-6 h-16 gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <button
              onClick={commandPalette.open}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-secondary hover:text-primary-400 hover:border-primary-500/50 transition-colors text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
              <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-xs bg-dark-bg-elevated rounded border border-dark-border-default">
                ⌘K
              </kbd>
            </button>
            <Link
              href="/"
              className="text-sm text-dark-text-secondary hover:text-primary-400 font-medium transition-colors"
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 bg-dark-bg-primary min-h-screen">{children}</main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
      />
    </div>
  );
}

