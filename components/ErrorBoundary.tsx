'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { isChunkLoadError, handleChunkLoadError } from '@/lib/chunk-retry';
import { logger } from '@/lib/logger';
import { ErrorHandler } from '@/lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
  retrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false, retrying: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isChunkError = isChunkLoadError(error);
    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use centralized error handler for consistent logging
    ErrorHandler.logError(error, 'ErrorBoundary');
    
    // Log additional error info using logger
    logger.error('Error caught by boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    // Handle chunk loading errors with retry
    if (isChunkLoadError(error)) {
      this.setState({ retrying: true });
      handleChunkLoadError(error, () => {
        this.setState({ hasError: false, error: null, isChunkError: false, retrying: false });
      }).catch(() => {
        // Retry failed, show error UI
        this.setState({ retrying: false });
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Show retrying message for chunk errors
      if (this.state.isChunkError && this.state.retrying) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold mb-2">Loading resources...</h1>
              <p className="text-muted-foreground">
                Retrying to load required files. Please wait...
              </p>
            </div>
          </div>
        );
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              {this.state.isChunkError
                ? 'Failed to load required files. This usually happens due to network issues.'
                : this.state.error
                  ? ErrorHandler.getUserMessage(this.state.error)
                  : 'An unexpected error occurred'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, isChunkError: false });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

