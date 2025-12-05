'use client';

import React from 'react';
import { Button } from '../ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-[#F7FAF8]">
          <h1 className="text-2xl font-semibold text-[#1B9C6F] mb-4">
            Something went wrong
          </h1>
          <p className="text-[#4A5A52] mb-6 max-w-md text-center">
            An unexpected error occurred. Try refreshing the page or contact support if the issue persists.
          </p>

          <Button variant="primary" onClick={this.reset}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
