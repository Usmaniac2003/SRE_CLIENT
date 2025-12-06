'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from '../lib/hooks/useTheme';
import { ToastContainer } from '../components/feedback/ToastContainer';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { useAuthStore } from '../store/auth.store';

export function Providers({ children }: { children: React.ReactNode }) {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  // Load auth state from localStorage on app initialization
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        {children}
        <ToastContainer />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
