'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Home, Search, Heart, Plus, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-grey-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
            <Link 
              href="/" 
              className="text-2xl font-bold text-gradient transition-smooth hover:opacity-90"
              aria-label="RoomRentalUSA Home"
            >
              RoomRentalUSA
            </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/listings"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/listings')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
              }`}
              aria-label="Browse listings"
              aria-current={isActive('/listings') ? 'page' : undefined}
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4" aria-hidden="true" />
                Browse
              </span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/favorites"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/favorites')
                      ? 'bg-secondary-50 text-secondary-600'
                      : 'text-grey-700 hover:text-secondary-600 hover:bg-grey-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    Favorites
                  </span>
                </Link>
                {user?.role === 'landlord' && (
                  <>
                    <Link
                      href="/listings/create"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive('/listings/create')
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Plus className="w-4 h-4" />
                        Create
                      </span>
                    </Link>
                    <Link
                      href="/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive('/dashboard')
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </span>
                    </Link>
                  </>
                )}
                <Link
                  href={`/profile/${user?.id}`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname?.startsWith('/profile')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    Profile
                  </span>
                </Link>
                <Link
                  href="/settings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/settings')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Settings className="w-4 h-4" />
                    Settings
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-grey-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-grey-700 hover:text-primary-600 transition-all duration-200 rounded-lg hover:bg-grey-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium btn-gradient text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button - simplified for now */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

