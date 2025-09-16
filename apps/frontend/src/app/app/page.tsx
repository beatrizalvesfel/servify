'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/app/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Redirecting to dashboard...</div>
    </div>
  );
}