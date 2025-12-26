'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { savedSearchesApi } from '@/lib/saved-searches-api';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export function SaveSearchButton() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Build search params object from URL
  const buildSearchParams = () => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page') {
        // Handle arrays (amenities)
        if (key === 'amenities' && value.includes(',')) {
          params[key] = value.split(',');
        } else {
          params[key] = value;
        }
      }
    });
    return params;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const searchParams = buildSearchParams();
      return savedSearchesApi.create(searchName, searchParams, emailAlerts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      setIsModalOpen(false);
      setSearchName('');
      // Show success message (you can use toast here)
      alert('Search saved successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to save search');
    },
  });

  const handleSave = () => {
    if (!searchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }
    createMutation.mutate();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Bookmark className="w-4 h-4" />
        Save Search
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-grey-900 mb-4">Save Search</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Search Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g., 'Apartments in Brooklyn under $1000'"
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="emailAlerts"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-grey-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="emailAlerts" className="text-sm text-grey-700 cursor-pointer">
                Email me when new listings match this search
              </label>
            </div>

            <div className="bg-grey-50 rounded-lg p-3 text-sm text-grey-600">
              <p className="font-medium mb-1">Current filters:</p>
              <ul className="list-disc list-inside space-y-1">
                {searchParams.get('city') && (
                  <li>City: {searchParams.get('city')}</li>
                )}
                {searchParams.get('state') && (
                  <li>State: {searchParams.get('state')}</li>
                )}
                {searchParams.get('minPrice') && (
                  <li>Min Price: ${searchParams.get('minPrice')}</li>
                )}
                {searchParams.get('maxPrice') && (
                  <li>Max Price: ${searchParams.get('maxPrice')}</li>
                )}
                {searchParams.get('minBedrooms') && (
                  <li>Min Bedrooms: {searchParams.get('minBedrooms')}</li>
                )}
                {searchParams.get('petFriendly') === 'true' && (
                  <li>Pet Friendly</li>
                )}
                {!searchParams.get('city') && !searchParams.get('state') && 
                 !searchParams.get('minPrice') && !searchParams.get('maxPrice') &&
                 !searchParams.get('minBedrooms') && searchParams.get('petFriendly') !== 'true' && (
                  <li>No filters applied</li>
                )}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                variant="primary"
                className="flex-1"
                disabled={createMutation.isPending || !searchName.trim()}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-2" />
                    Save Search
                  </>
                )}
              </Button>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

