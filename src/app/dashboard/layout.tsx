'use client';

import React from 'react';
import {AppShell} from '../../components/layout/AppShell';
import { AuthGuard } from '../../lib/auth/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
