/**
 * Navigation Tests - Presentation Layer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Navigation } from '@/presentation/components/common/Navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
}));

jest.mock('next/link', () => {
  return function Link({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe('Navigation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T12:30:45'));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render the logo', () => {
      render(<Navigation />);

      expect(screen.getByText('CRYPTO LOAN RISK ENGINE')).toBeInTheDocument();
    });

    it('should render version and live indicator', () => {
      render(<Navigation />);

      expect(screen.getByText(/v1.0/)).toBeInTheDocument();
      expect(screen.getByText(/LIVE/)).toBeInTheDocument();
    });

    it('should render all navigation items', () => {
      render(<Navigation />);

      expect(screen.getByText('PORTFOLIO')).toBeInTheDocument();
      expect(screen.getByText('DRAWDOWN')).toBeInTheDocument();
      expect(screen.getByText('CORRELATIONS')).toBeInTheDocument();
      expect(screen.getByText('SCENARIO LAB')).toBeInTheDocument();
      expect(screen.getByText('CALENDAR')).toBeInTheDocument();
      expect(screen.getByText('HISTORY')).toBeInTheDocument();
      expect(screen.getByText('OPTIMIZE')).toBeInTheDocument();
    });

    it('should render navigation icons', () => {
      render(<Navigation />);

      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('📉')).toBeInTheDocument();
      expect(screen.getByText('🔗')).toBeInTheDocument();
      expect(screen.getByText('🧪')).toBeInTheDocument();
      expect(screen.getByText('📅')).toBeInTheDocument();
      expect(screen.getByText('📜')).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
    });

    it('should render system status', () => {
      render(<Navigation />);

      expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('should have correct href for Portfolio', () => {
      render(<Navigation />);

      const link = screen.getByText('PORTFOLIO').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('should have correct href for Drawdown', () => {
      render(<Navigation />);

      const link = screen.getByText('DRAWDOWN').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard/drawdown');
    });

    it('should have correct href for Correlations', () => {
      render(<Navigation />);

      const link = screen.getByText('CORRELATIONS').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard/correlations');
    });

    it('should have correct href for Scenario Lab', () => {
      render(<Navigation />);

      const link = screen.getByText('SCENARIO LAB').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard/scenarios');
    });

    it('should have correct href for Calendar', () => {
      render(<Navigation />);

      const link = screen.getByText('CALENDAR').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard/calendar');
    });

    it('should have correct href for History', () => {
      render(<Navigation />);

      const link = screen.getByText('HISTORY').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard/history');
    });

    it('should have correct href for Optimize', () => {
      render(<Navigation />);

      const link = screen.getByText('OPTIMIZE').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard/optimization');
    });
  });

  describe('active state', () => {
    it('should mark active nav item with primary background', () => {
      const { usePathname } = require('next/navigation');
      usePathname.mockReturnValue('/dashboard');

      render(<Navigation />);

      const portfolioLink = screen.getByText('PORTFOLIO').closest('a');
      expect(portfolioLink).toHaveClass('bg-primary');
    });

    it('should not mark inactive items as active', () => {
      const { usePathname } = require('next/navigation');
      usePathname.mockReturnValue('/dashboard');

      render(<Navigation />);

      const drawdownLink = screen.getByText('DRAWDOWN').closest('a');
      expect(drawdownLink).not.toHaveClass('bg-primary');
    });

    it('should handle different active paths', () => {
      const { usePathname } = require('next/navigation');
      usePathname.mockReturnValue('/dashboard/correlations');

      render(<Navigation />);

      const correlationsLink = screen.getByText('CORRELATIONS').closest('a');
      expect(correlationsLink).toHaveClass('bg-primary');

      const portfolioLink = screen.getByText('PORTFOLIO').closest('a');
      expect(portfolioLink).not.toHaveClass('bg-primary');
    });
  });

  describe('clock functionality', () => {
    it('should initially show placeholder time', () => {
      const { container } = render(<Navigation />);

      // Before mounting completes, should show placeholder or nothing
      // After mount, should show actual time
      jest.runAllTimers();
    });

    it('should display current time after mounting', () => {
      render(<Navigation />);

      // Run effects
      jest.runAllTimers();

      // Should show time in format HH:MM:SS
      expect(screen.getByText(/12:30:45/)).toBeInTheDocument();
    });

    it('should update time every second', () => {
      render(<Navigation />);

      // Initial time
      jest.runAllTimers();
      expect(screen.getByText(/12:30:45/)).toBeInTheDocument();

      // Advance 1 second
      jest.setSystemTime(new Date('2025-01-01T12:30:46'));
      jest.advanceTimersByTime(1000);

      expect(screen.getByText(/12:30:46/)).toBeInTheDocument();
    });
  });

  describe('CSS classes and styling', () => {
    it('should apply panel background and border', () => {
      const { container } = render(<Navigation />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-background-secondary');
      expect(nav).toHaveClass('border-b');
      expect(nav).toHaveClass('border-border');
    });

    it('should have status indicator with healthy status', () => {
      const { container } = render(<Navigation />);

      const indicator = container.querySelector('.status-indicator');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('status-healthy');
    });

    it('should apply correct text styling to logo', () => {
      render(<Navigation />);

      const logo = screen.getByText('CRYPTO LOAN RISK ENGINE');
      expect(logo).toHaveClass('text-2xl');
      expect(logo).toHaveClass('font-mono');
      expect(logo).toHaveClass('font-bold');
      expect(logo).toHaveClass('text-primary');
    });
  });

  describe('SSR compatibility', () => {
    it('should handle mounted state correctly', () => {
      render(<Navigation />);

      // Initially not mounted, clock may not show
      // After effects run, should be mounted
      jest.runAllTimers();

      // Should show time after mounting
      const timeElement = screen.queryByText(/:/);
      expect(timeElement).toBeInTheDocument();
    });
  });

  describe('cleanup', () => {
    it('should clear interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(<Navigation />);

      // Run pending timers before unmount
      jest.runOnlyPendingTimers();

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });
});
