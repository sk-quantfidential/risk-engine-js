'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'PORTFOLIO', icon: '📊' },
  { href: '/dashboard/drawdown', label: 'DRAWDOWN', icon: '📉' },
  { href: '/dashboard/correlations', label: 'CORRELATIONS', icon: '🔗' },
  { href: '/dashboard/scenarios', label: 'SCENARIO LAB', icon: '🧪' },
  { href: '/dashboard/calendar', label: 'CALENDAR', icon: '📅' },
  { href: '/dashboard/history', label: 'HISTORY', icon: '📜' },
  { href: '/dashboard/optimization', label: 'OPTIMIZE', icon: '⚡' },
];

export function Navigation() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));

    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-background-secondary border-b border-border">
      <div className="max-w-[2000px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="text-2xl font-mono font-bold text-primary">
              CRYPTO LOAN RISK ENGINE
            </div>
            <div className="text-xs text-text-muted font-mono mt-1">
              v1.0 | LIVE
            </div>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded font-mono text-sm transition-all
                    ${isActive
                      ? 'bg-primary text-background font-bold'
                      : 'text-text-secondary hover:text-primary hover:bg-background-tertiary'
                    }
                  `}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="status-indicator status-healthy"></span>
              <span className="text-xs font-mono text-text-secondary">SYSTEM ONLINE</span>
            </div>
            {mounted && (
              <div className="text-xs font-mono text-text-muted">
                {currentTime}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}