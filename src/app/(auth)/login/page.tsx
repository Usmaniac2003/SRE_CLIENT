'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { LoginForm } from '../../../features/auth/components/LoginForm';
import { useAuthStore } from '../../../store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  /* ---------------------------------------------------------------------- */
  /*            If already authenticated, redirect to dashboard             */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8] p-6">
      <div className="w-full max-w-md bg-white shadow-lg border border-[#D9E6DF] rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-[#1B9C6F] mb-6 text-center">
          Sign In
        </h1>

        <LoginForm />
      </div>
    </div>
  );
}
