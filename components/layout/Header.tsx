'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  Home, 
  Search, 
  Plus, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Menu, 
  X, 
  MessageCircle,
  Settings,
  ChevronDown,
  Heart,
  Bell
} from 'lucide-react';
import { SavedSearchesDropdown } from '@/components/search/SavedSearchesDropdown';
import { useChat } from '@/lib/chat-context';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/chat-api';
import { useSocket } from '@/lib/socket-context';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { openChat } = useChat();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { onMessage, offMessage, socket, isConnected } = useSocket();

  // Fetch unread count for chat - always fetch when authenticated
  const { data: unreadCount = 0, error: unreadCountError, isLoading: isLoadingUnreadCount } = useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: async () => {
      try {
        const count = await chatApi.getUnreadCount();
        // Ensure we return a number
        const numCount = typeof count === 'number' ? count : parseInt(String(count), 10) || 0;
        return numCount;
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0, // Always consider stale to get fresh data
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
    gcTime: 0, // Don't cache
    retry: 2, // Retry on failure
  });

  // Log unread count for debugging
  useEffect(() => {
    if (unreadCountError) {
      console.error('Unread count query error:', unreadCountError);
    }
    if (isAuthenticated && !isLoadingUnreadCount) {
      console.log('Unread count:', unreadCount);
    }
  }, [unreadCount, unreadCountError, isLoadingUnreadCount, isAuthenticated]);


  // Listen for new messages via socket to update unread count in real-time
  useEffect(() => {
    if (!isAuthenticated || !onMessage || !offMessage) {
      return;
    }

    const handleNewMessage = (message: any) => {
      console.log('New message received in header:', message);
      // Only update if the message is not from the current user
      if (message?.senderId && message.senderId !== user?.id) {
        console.log('Updating unread count for message from:', message.senderId);
        // Immediately invalidate and refetch unread count
        queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
        // Also force a refetch immediately with a small delay to ensure backend has updated
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['chat-unread-count'] });
        }, 500);
      }
    };

    // Add listener
    onMessage(handleNewMessage);

    return () => {
      offMessage(handleNewMessage);
    };
  }, [isAuthenticated, onMessage, offMessage, user?.id, queryClient]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleChatClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      router.push('/messages');
    } else {
      openChat();
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;
  const isActiveStartsWith = (path: string) => pathname?.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Text-only logo for both mobile and desktop */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-all duration-200 hover:opacity-90 group"
            aria-label="Go to homepage"
          >
            <span className="font-heading text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-tight">
              RoomRentalUSA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Browse Link */}
            <Link
              href="/listings"
              className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/listings')
                  ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 shadow-sm'
                  : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Browse
              </span>
              {isActive('/listings') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
              )}
            </Link>
            
            {/* Authenticated User Actions */}
            {isAuthenticated ? (
              <>
                <div className="h-6 w-px bg-grey-200 mx-1" />
                
                <SavedSearchesDropdown />
                
                <NotificationDropdown />
                
                <button
                  onClick={handleChatClick}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    pathname === '/messages' || pathname === '/chat'
                      ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 shadow-sm'
                      : Number(unreadCount) > 0
                      ? 'text-pink-600 bg-pink-50/30'
                      : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                  }`}
                  aria-label={`Open messages${Number(unreadCount) > 0 ? ` (${Number(unreadCount)} unread)` : ''}`}
                >
                  <div className="relative flex items-center">
                    <MessageCircle className={`w-5 h-5 ${Number(unreadCount) > 0 ? 'text-pink-600' : ''}`} />
                    {Number(unreadCount) > 0 && (
                      <>
                        <span className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full min-w-[26px] h-6 px-2 flex items-center justify-center font-bold shadow-xl ring-2 ring-white animate-pulse z-20">
                          {Number(unreadCount) > 9 ? '9+' : Number(unreadCount)}
                        </span>
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75 z-10"></span>
                      </>
                    )}
                  </div>
                </button>

                {/* Role Switcher - Show for students and landlords */}
                {(user?.role === 'student' || user?.role === 'landlord') && (
                  <>
                    <div className="h-6 w-px bg-grey-200 mx-1" />
                    <RoleSwitcher variant="compact" />
                  </>
                )}

                {user?.role === 'landlord' && (
                  <>
                    <div className="h-6 w-px bg-grey-200 mx-1" />
                    <Link
                      href="/listings/create"
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive('/listings/create')
                          ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 shadow-sm'
                          : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create
                      </span>
                    </Link>
                    <Link
                      href="/landlord/dashboard"
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActiveStartsWith('/landlord/dashboard')
                          ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 shadow-sm'
                          : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </span>
                    </Link>
                  </>
                )}

                <div className="h-6 w-px bg-grey-200 mx-1" />

                {/* User Profile Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                      isUserMenuOpen || isActiveStartsWith('/profile')
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 shadow-sm'
                        : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                    }`}
                    aria-label="User menu"
                  >
                    <UserAvatar
                      name={user?.name}
                      profileImage={user?.profileImage}
                      seed={user?.id}
                      size="sm"
                      className="ring-2 ring-pink-200"
                    />
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-pink-100 overflow-hidden animate-fade-in">
                      <div className="p-3 border-b border-pink-50 bg-gradient-to-r from-pink-50/50 to-rose-50/50">
                        <p className="text-sm font-semibold text-grey-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-grey-600 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href={`/profile/${user?.id}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-grey-700 hover:bg-pink-50 hover:text-pink-700 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        {user?.role === 'student' && (
                          <Link
                            href="/favorites"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-grey-700 hover:bg-pink-50 hover:text-pink-700 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            Saved Listings
                          </Link>
                        )}
                        <Link
                          href="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-grey-700 hover:bg-pink-50 hover:text-pink-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <div className="h-px bg-pink-100 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="h-6 w-px bg-grey-200 mx-1" />
                <Link
                  href="/auth/login"
                  className="px-4 py-2.5 text-sm font-semibold text-grey-700 hover:text-pink-600 transition-all duration-200 rounded-xl hover:bg-pink-50/50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={handleChatClick}
                  className={`relative p-2.5 rounded-lg transition-all ${
                    Number(unreadCount) > 0
                      ? 'text-pink-600 bg-pink-50/30'
                      : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                  }`}
                  aria-label={`Open messages${Number(unreadCount) > 0 ? ` (${Number(unreadCount)} unread)` : ''}`}
                >
                  <div className="relative flex items-center">
                    <MessageCircle className={`w-6 h-6 ${Number(unreadCount) > 0 ? 'text-pink-600' : ''}`} />
                    {Number(unreadCount) > 0 && (
                      <>
                        <span className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full min-w-[26px] h-6 px-2 flex items-center justify-center font-bold shadow-xl ring-2 ring-white animate-pulse z-20">
                          {Number(unreadCount) > 9 ? '9+' : Number(unreadCount)}
                        </span>
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75 z-10"></span>
                      </>
                    )}
                  </div>
                </button>
              </>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-grey-700 hover:text-pink-600 hover:bg-pink-50/50 transition-all"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-pink-100 bg-white py-4">
            <nav className="flex flex-col space-y-1">
              <Link
                href="/listings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/listings')
                    ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700'
                    : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                }`}
              >
                <Search className="w-5 h-5" />
                Browse Listings
              </Link>
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'landlord' && (
                    <>
                      <Link
                        href="/listings/create"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive('/listings/create')
                            ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700'
                            : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                        }`}
                      >
                        <Plus className="w-5 h-5" />
                        Create Listing
                      </Link>
                      <Link
                        href="/landlord/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActiveStartsWith('/landlord/dashboard')
                            ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700'
                            : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                        }`}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Link>
                    </>
                  )}
                  
                  {/* Role Switcher for Mobile */}
                  {(user?.role === 'student' || user?.role === 'landlord') && (
                    <div className="px-4 py-2">
                      <RoleSwitcher 
                        variant="full" 
                        onSwitchComplete={() => setIsMobileMenuOpen(false)}
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      handleChatClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left w-full ${
                      pathname === '/messages' || pathname === '/chat'
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700'
                        : Number(unreadCount) > 0
                        ? 'bg-pink-50/40 text-pink-700 border border-pink-200'
                        : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                    }`}
                  >
                    <div className="relative flex items-center">
                      <MessageCircle className={`w-5 h-5 ${Number(unreadCount) > 0 ? 'text-pink-600' : ''}`} />
                      {Number(unreadCount) > 0 && (
                        <>
                          <span className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full min-w-[26px] h-6 px-2 flex items-center justify-center font-bold shadow-xl ring-2 ring-white animate-pulse z-20">
                            {Number(unreadCount) > 9 ? '9+' : Number(unreadCount)}
                          </span>
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75 z-10"></span>
                        </>
                      )}
                    </div>
                    <span className={`flex-1 font-semibold ${Number(unreadCount) > 0 ? 'text-pink-600' : ''}`}>Messages</span>
                    {Number(unreadCount) > 0 && (
                      <span className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full px-3 py-1.5 min-w-[28px] h-7 flex items-center justify-center shadow-lg animate-pulse">
                        {Number(unreadCount) > 9 ? '9+' : Number(unreadCount)}
                      </span>
                    )}
                  </button>
                  <Link
                    href={`/profile/${user?.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActiveStartsWith('/profile')
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700'
                        : 'text-grey-700 hover:text-pink-600 hover:bg-pink-50/50'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  {user?.role === 'student' && (
                    <Link
                      href="/favorites"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-grey-700 hover:text-pink-600 hover:bg-pink-50/50 transition-all duration-200"
                    >
                      <Heart className="w-5 h-5" />
                      Saved Listings
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-grey-700 hover:text-pink-600 hover:bg-pink-50/50 transition-all duration-200"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <div className="h-px bg-pink-100 my-2 mx-4" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-semibold text-grey-700 hover:text-pink-600 transition-all duration-200 rounded-xl hover:bg-pink-50/50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-md text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
