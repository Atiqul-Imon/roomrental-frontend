'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Home, Search, Plus, LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react';
import { SavedSearchesDropdown } from '@/components/search/SavedSearchesDropdown';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-grey-200 bg-white/95 backdrop-blur-md shadow-sm transition-shadow duration-200">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link 
            href="/" 
            className="text-xl sm:text-2xl font-bold text-gradient transition-smooth hover:opacity-90"
          >
            <span className="hidden sm:inline">RoomRentalUSA</span>
            <span className="sm:hidden">RoomRental</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/listings"
              className={`px-3 py-2 rounded-lg text-sm font-medium color-transition relative ${
                isActive('/listings')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
              }`}
            >
              {isActive('/listings') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                Browse
              </span>
            </Link>
            
            {isAuthenticated && (
              <>
                <SavedSearchesDropdown />
              </>
            )}

            {isAuthenticated ? (
              <>
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
                      href="/landlord/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        pathname?.startsWith('/landlord/dashboard')
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium color-transition relative ${
                    pathname?.startsWith('/profile')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
                  }`}
                >
                  {pathname?.startsWith('/profile') && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                  )}
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    Profile
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-grey-200 bg-white">
            <nav className="flex flex-col py-4 space-y-2">
              <Link
                href="/listings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/listings')
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Browse
                </span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'landlord' && (
                    <>
                      <Link
                        href="/listings/create"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive('/listings/create')
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Create Listing
                        </span>
                      </Link>
                      <Link
                        href="/landlord/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          pathname?.startsWith('/landlord/dashboard')
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </span>
                      </Link>
                    </>
                  )}
                  <Link
                    href={`/profile/${user?.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname?.startsWith('/profile')
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-grey-700 hover:text-primary-600 hover:bg-grey-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-grey-700 hover:text-red-600 hover:bg-grey-50 transition-all duration-200 text-left flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-grey-700 hover:text-primary-600 transition-all duration-200 rounded-lg hover:bg-grey-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium bg-gradient-primary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

