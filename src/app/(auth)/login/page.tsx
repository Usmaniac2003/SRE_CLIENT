'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '../../../components/ui/Spinner';

import { LoginForm } from '../../../features/auth/components/LoginForm';
import { useAuthStore } from '../../../store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  /* ---------------------------------------------------------------------- */
  /*            If already authenticated, redirect to dashboard             */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    // Wait for auth state to load from storage before redirecting
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8]">
        <Spinner />
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8] p-6">
      <div className="w-full max-w-md bg-white shadow-lg border border-[#D9E6DF] rounded-xl p-8">

        <LoginForm />
      </div>
    </div>
  );
}

