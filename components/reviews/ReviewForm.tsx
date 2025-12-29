'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  revieweeId: string;
  listingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ revieweeId, listingId, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormData) => {
    if (data.rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/reviews', {
        ...data,
        revieweeId,
        listingId,
      });

      if (response.data.success) {
        reset(); // Reset form after successful submission
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.data.error || 'Failed to submit review');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="border border-border rounded-lg p-4 text-center text-muted-foreground">
        Please sign in to leave a review
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-accent-200 rounded-xl p-6 space-y-5 bg-white shadow-soft">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-3 text-grey-900">Rating</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue('rating', star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 ${
                  star <= rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-grey-300'
                } hover:fill-amber-300 transition`}
              />
            </button>
          ))}
          {rating > 0 && <span className="ml-3 text-sm font-medium text-grey-700">{rating}/5</span>}
        </div>
        {errors.rating && (
          <p className="text-sm text-red-600 mt-2">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-grey-900">
          Review <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('comment')}
          rows={4}
          className="w-full px-4 py-3 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all resize-none"
          placeholder="Share your experience with this landlord..."
        />
        {errors.comment && (
          <p className="text-sm text-red-600 mt-2">{errors.comment.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-accent-200 rounded-lg hover:bg-accent-50 text-grey-700 font-medium transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="px-5 py-2.5 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-soft hover:shadow-medium flex-1"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

