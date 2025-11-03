'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl font-mono font-bold text-primary mb-4">
          RISK ENGINE
        </div>
        <div className="text-text-secondary font-mono">Initializing...</div>
      </div>
    </div>
  );
}