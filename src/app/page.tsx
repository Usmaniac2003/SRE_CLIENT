'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  // Redirect home → login
  useEffect(() => {
    router.replace('/landing');
  }, [router]);

  return null;
}
