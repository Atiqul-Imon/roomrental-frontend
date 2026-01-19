'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { Upload, X } from 'lucide-react';
import { format } from 'date-fns';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  price: z.number().min(0, 'Price must be positive'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().optional(),
  address: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  availabilityDate: z.string().min(1, 'Availability date is required'),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface EditListingFormProps {
  listing: Listing;
  onSuccess?: () => void;
}

export function EditListingForm({ listing, onSuccess }: EditListingFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>(listing.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      city: listing.location.city,
      state: listing.location.state,
      zip: listing.location.zip || '',
      address: listing.location.address || '',
      amenities: listing.amenities || [],
      availabilityDate: format(new Date(listing.availabilityDate), 'yyyy-MM-dd'),
    },
  });

  const watchedAmenities = watch('amenities') || [];

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setImages((prev) => [...prev, response.data.data.url]);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (imageUrl: string) => {
    try {
      await api.delete(`/listings/${listing._id}/images`, {
        data: { imageUrl },
      });
      setImages((prev) => prev.filter((url) => url !== imageUrl));
    } catch (error) {
      alert('Failed to remove image');
    }
  };

  const toggleAmenity = (amenity: string) => {
    const current = watchedAmenities;
    if (current.includes(amenity)) {
      setValue('amenities', current.filter((a) => a !== amenity));
    } else {
      setValue('amenities', [...current, amenity]);
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Extract location fields and remove them from the main data
      const { city, state, zip, address, ...rest } = data;
      
      const listingData: any = {
        ...rest,
        images,
        location: {
          city: city,
          state: state,
          // Only include optional fields if they have values
          ...(zip && zip.trim() && { zip: zip.trim() }),
          ...(address && address.trim() && { address: address.trim() }),
          // Include coordinates if they exist on the original listing
          ...(listing.location?.coordinates && {
            latitude: listing.location.coordinates.lat,
            longitude: listing.location.coordinates.lng,
          }),
        },
        availabilityDate: new Date(data.availabilityDate).toISOString(),
      };

      const response = await api.patch(`/listings/${listing._id}`, listingData);

      if (response.data.success) {
        // Invalidate all listing-related caches to reflect changes immediately
        queryClient.invalidateQueries({ queryKey: ['listings'] }); // Public listings
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }); // Landlord listings
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] }); // Admin listings
        queryClient.invalidateQueries({ queryKey: ['listing', listing._id] }); // Specific listing
        
        // Small delay to ensure cache is marked stale before navigation
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(`/listings/${listing._id}`);
          }
        }, 50);
      } else {
        setError(response.data.error || 'Failed to update listing');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonAmenities = [
    'WiFi',
    'Parking',
    'Laundry',
    'Air Conditioning',
    'Heating',
    'Furnished',
    'Pet Friendly',
    'Smoking Allowed',
    'Gym Access',
    'Pool',
    'Balcony',
    'Dishwasher',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Title <span className="text-red-500">*</span>
          <span className="text-xs text-grey-500 font-normal ml-2">
            ({watch('title')?.length || 0}/200 characters)
          </span>
        </label>
        <input
          {...register('title')}
          maxLength={200}
          className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Description <span className="text-red-500">*</span>
          <span className="text-xs text-grey-500 font-normal ml-2">
            ({watch('description')?.length || 0}/2000 characters)
          </span>
        </label>
        <textarea
          {...register('description')}
          maxLength={2000}
          rows={6}
          className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Monthly Rent ($) <span className="text-red-500">*</span>
        </label>
        <input
          {...register('price', { valueAsNumber: true })}
          type="number"
          min="0"
          step="1"
          className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.price && (
          <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            {...register('city')}
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.city && (
            <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <input
            {...register('state')}
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.state && (
            <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">ZIP Code</label>
          <input
            {...register('zip')}
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Street Address</label>
          <input
            {...register('address')}
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Available From <span className="text-red-500">*</span>
        </label>
        <input
          {...register('availabilityDate')}
          type="date"
          className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.availabilityDate && (
          <p className="text-sm text-red-600 mt-1">{errors.availabilityDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Images</label>
        <div className="border-2 border-dashed border-input rounded-lg p-6 text-center mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            disabled={isUploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isUploading ? 'Uploading...' : 'Add more images'}
            </span>
          </label>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amenities</label>
        <div className="grid grid-cols-3 gap-2">
          {commonAmenities.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2 p-2 border border-input rounded-lg cursor-pointer hover:bg-secondary transition"
            >
              <input
                type="checkbox"
                checked={watchedAmenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="w-4 h-4"
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-border rounded-lg hover:bg-secondary transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Update Listing'}
        </button>
      </div>
    </form>
  );
}

