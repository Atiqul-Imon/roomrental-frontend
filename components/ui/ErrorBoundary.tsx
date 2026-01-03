'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardBody } from './Card';
import { ErrorHandler } from '@/lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use centralized error handler for consistent logging
    ErrorHandler.logError(error, 'ErrorBoundary');
    // Log to console in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardBody>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-dark-text-primary mb-2">
                Something went wrong
              </h2>
              <p className="text-dark-text-secondary mb-6 max-w-md">
                {this.state.error ? ErrorHandler.getUserMessage(this.state.error) : 'An unexpected error occurred. Please try refreshing the page.'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left w-full">
                  <summary className="cursor-pointer text-sm text-dark-text-muted mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="bg-dark-bg-tertiary p-4 rounded-lg text-xs text-red-400 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </CardBody>
        </Card>
      );
    }

    return this.props.children;
  }
}

