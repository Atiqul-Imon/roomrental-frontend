/**
 * Optimistic Update Hook
 * Phase 3: Advanced Features - Performance & Loading States
 * 
 * Provides optimistic updates for better perceived performance
 */

'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface OptimisticUpdateOptions<T> {
  queryKey: string[];
  updateFn: (oldData: T | undefined) => T;
  rollbackFn?: () => void;
}

export function useOptimisticUpdate<T>() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const update = useCallback(
    async <TData,>(
      mutationFn: () => Promise<TData>,
      options: OptimisticUpdateOptions<TData>
    ) => {
      const { queryKey, updateFn, rollbackFn } = options;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update
      queryClient.setQueryData<TData>(queryKey, updateFn);

      setIsUpdating(true);

      try {
        // Perform mutation
        const result = await mutationFn();
        return result;
      } catch (error) {
        // Rollback on error
        if (rollbackFn) {
          rollbackFn();
        } else if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
        throw error;
      } finally {
        setIsUpdating(false);
        // Refetch to ensure consistency
        await queryClient.invalidateQueries({ queryKey });
      }
    },
    [queryClient]
  );

  return { update, isUpdating };
}






