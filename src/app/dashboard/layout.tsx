'use client';

import { Navigation } from '@/components/common/Navigation';
import { MarketDataProvider } from '@/components/common/MarketDataProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketDataProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-[2000px] mx-auto p-6">
          {children}
        </main>
      </div>
    </MarketDataProvider>
  );
}