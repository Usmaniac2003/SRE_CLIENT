'use client';

import React from 'react';
import { ThemeProvider } from '../lib/hooks/useTheme';
import { ToastContainer } from '../components/feedback/ToastContainer';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        {children}
        <ToastContainer />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
