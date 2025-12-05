'use client';

import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useRouter } from 'next/navigation';
import { loginService } from '../services/auth.service';
import { useToastStore } from '../../../store/toast.store';

export function LoginForm() {
  const router = useRouter();
  const toast = useToastStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await loginService({ username, password });

      toast.push('success', 'Login successful');
      router.push('/dashboard');
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm bg-white px-6 py-8 rounded-lg border border-[#D9E6DF] shadow-sm"
    >
      <h1 className="text-xl font-semibold text-[#1B9C6F] mb-6 text-center">
        Sign In
      </h1>

      <Input
        label="Username"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-4"
      />

      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-6"
      />

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="w-full"
      >
        Login
      </Button>
    </form>
  );
}
