'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
}

export function FavoriteButton({ listingId, className = '' }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const response = await api.get(`/favorites/${listingId}`);
      if (response.data.success) {
        setIsFavorite(response.data.data.isFavorite || false);
      }
    } catch (error) {
      // Silently fail if not authenticated or other error
      setIsFavorite(false);
    }
  }, [listingId]);

  useEffect(() => {
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, checkFavoriteStatus]);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    const wasFavorite = isFavorite;
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${listingId}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${listingId}`);
        setIsFavorite(true);
        // Trigger heart fill animation
        if (!wasFavorite) {
          const heartElement = document.querySelector(`[data-listing-id="${listingId}"] .heart-icon`);
          if (heartElement) {
            heartElement.classList.add('heart-fill');
            setTimeout(() => {
              heartElement.classList.remove('heart-fill');
            }, 300);
          }
        }
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      if (error.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleToggle}
        className={`p-2.5 border-2 border-grey-300 rounded-lg hover:bg-grey-50 hover:border-primary-400 transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:outline-none ${className}`}
        title="Sign in to save favorites"
        aria-label="Sign in to save favorites"
      >
        <Heart className="w-5 h-5 text-grey-400" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2.5 border-2 rounded-lg transition-all duration-200 disabled:opacity-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:outline-none ${
        isFavorite
          ? 'bg-secondary-50 border-secondary-400 hover:bg-secondary-100'
          : 'border-grey-300 hover:bg-grey-50 hover:border-primary-400'
      } ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
    >
      <Heart
        data-listing-id={listingId}
        className={`w-5 h-5 transition-all duration-200 heart-icon ${
          isFavorite
            ? 'fill-secondary-500 text-secondary-500 scale-110'
            : 'text-grey-400 hover:text-secondary-400'
        } ${isLoading ? 'animate-pulse' : ''}`}
      />
    </button>
  );
}

