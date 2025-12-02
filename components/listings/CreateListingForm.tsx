'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { ChevronRight, ChevronLeft, Upload, X, Check } from 'lucide-react';

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

interface CreateListingFormProps {
  onSuccess?: () => void;
}

export function CreateListingForm({ onSuccess }: CreateListingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
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
      amenities: [],
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

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const listingData = {
        ...data,
        images,
        location: {
          city: data.city,
          state: data.state,
          zip: data.zip,
          address: data.address,
        },
        availabilityDate: new Date(data.availabilityDate).toISOString(),
      };

      const response = await api.post('/listings', listingData);

      if (response.data.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/listings/${response.data.data._id}`);
        }
      } else {
        setError(response.data.error || 'Failed to create listing');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create listing');
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
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-medium space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-grey-900">Basic Information</h2>
            <p className="text-grey-600">Tell us about your room</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
              placeholder="e.g., Cozy Room in Downtown"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-2 font-medium">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={6}
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white resize-none"
              placeholder="Describe the room, neighborhood, and what makes it special..."
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-2 font-medium">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Monthly Rent ($) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              min="0"
              step="1"
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
              placeholder="0"
            />
            {errors.price && (
              <p className="text-sm text-red-600 mt-2 font-medium">{errors.price.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 btn-gradient text-white rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-medium flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-medium space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-grey-900">Location</h2>
            <p className="text-grey-600">Where is your room located?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-grey-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                {...register('city')}
                className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-2 font-medium">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-grey-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                {...register('state')}
                className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                placeholder="Enter state"
              />
              {errors.state && (
                <p className="text-sm text-red-600 mt-2 font-medium">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-2">ZIP Code</label>
            <input
              {...register('zip')}
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
              placeholder="Enter ZIP code"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-2">Street Address (Optional)</label>
            <input
              {...register('address')}
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
              placeholder="Enter street address"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Available From <span className="text-red-500">*</span>
            </label>
            <input
              {...register('availabilityDate')}
              type="date"
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            />
            {errors.availabilityDate && (
              <p className="text-sm text-red-600 mt-2 font-medium">{errors.availabilityDate.message}</p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 border-2 border-grey-300 rounded-lg hover:bg-grey-50 transition-all duration-200 font-semibold text-grey-700 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 btn-gradient text-white rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-medium flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Images & Amenities */}
      {step === 3 && (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-medium space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-grey-900">Images & Amenities</h2>
            <p className="text-grey-600">Add photos and select available amenities</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-3">
              Images <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-grey-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors duration-200 bg-grey-50">
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
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className={`p-4 rounded-full ${isUploading ? 'bg-grey-200' : 'bg-primary-100'}`}>
                  <Upload className={`w-8 h-8 ${isUploading ? 'text-grey-400' : 'text-primary-600'}`} />
                </div>
                <span className="text-sm font-medium text-grey-700">
                  {isUploading ? 'Uploading...' : 'Click to upload images'}
                </span>
                <span className="text-xs text-grey-500">PNG, JPG up to 10MB</span>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-grey-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-medium"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-3">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonAmenities.map((amenity) => {
                const isChecked = watchedAmenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-grey-300 hover:border-primary-300 hover:bg-grey-50'
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAmenity(amenity)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          isChecked
                            ? 'bg-primary-500 border-primary-500'
                            : 'bg-white border-grey-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${isChecked ? 'text-primary-700' : 'text-grey-700'}`}>
                      {amenity}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 border-2 border-grey-300 rounded-lg hover:bg-grey-50 transition-all duration-200 font-semibold text-grey-700 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              type="submit"
              disabled={isSubmitting || images.length === 0}
              className="px-6 py-3 btn-gradient text-white rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

