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
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${listingId}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${listingId}`);
        setIsFavorite(true);
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
        className={`p-2.5 border-2 border-grey-300 rounded-lg hover:bg-grey-50 hover:border-primary-400 transition-all duration-200 active:scale-95 ${className}`}
        title="Sign in to save favorites"
      >
        <Heart className="w-5 h-5 text-grey-400" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2.5 border-2 rounded-lg transition-all duration-200 disabled:opacity-50 active:scale-95 ${
        isFavorite
          ? 'bg-secondary-50 border-secondary-400 hover:bg-secondary-100'
          : 'border-grey-300 hover:bg-grey-50 hover:border-primary-400'
      } ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`w-5 h-5 transition-all duration-200 ${
          isFavorite
            ? 'fill-secondary-500 text-secondary-500 scale-110'
            : 'text-grey-400 hover:text-secondary-400'
        } ${isLoading ? 'animate-pulse' : ''}`}
      />
    </button>
  );
}

