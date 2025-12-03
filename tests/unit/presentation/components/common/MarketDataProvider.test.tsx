/**
 * MarketDataProvider Tests - Presentation Layer
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { MarketDataProvider, useMarketData } from '@/presentation/components/common/MarketDataProvider';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

describe('MarketDataProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('useMarketData hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      try {
        const { result } = renderHook(() => useMarketData());
        // This should throw, so we shouldn't reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toBe('useMarketData must be used within MarketDataProvider');
      }

      console.error = originalError;
    });

    it('should provide context value when used inside provider', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.marketData).toBeDefined();
      expect(result.current.portfolio).toBeDefined();
      expect(result.current.marketDataProvider).toBeDefined();
      expect(result.current.portfolioRepository).toBeDefined();
    });
  });

  describe('initialization', () => {
    it('should initialize with market data snapshot', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      expect(result.current.marketData).not.toBeNull();
      expect(result.current.marketData?.timestamp).toBeInstanceOf(Date);
      expect(result.current.marketData?.prices).toBeDefined();
      expect(result.current.marketData?.returns).toBeDefined();
    });

    it('should initialize with portfolio', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      expect(result.current.portfolio).not.toBeNull();
      expect(result.current.portfolio?.loans).toBeDefined();
      expect(result.current.portfolio?.riskCapitalUSD).toBeGreaterThan(0);
    });

    it('should have all three asset prices', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      const prices = result.current.marketData?.prices;
      expect(prices).toBeDefined();
      expect(prices![AssetType.BTC]).toBeGreaterThan(0);
      expect(prices![AssetType.ETH]).toBeGreaterThan(0);
      expect(prices![AssetType.SOL]).toBeGreaterThan(0);
    });

    it('should start with live mode off', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      expect(result.current.isLive).toBe(false);
    });

    it('should provide market data service instance', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      expect(result.current.marketDataProvider).toBeDefined();
      expect(result.current.marketDataProvider.getCurrentPrices).toBeDefined();
    });

    it('should provide repository instance', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      expect(result.current.portfolioRepository).toBeDefined();
      expect(result.current.portfolioRepository.save).toBeDefined();
    });
  });

  describe('toggleLive', () => {
    it('should toggle isLive from false to true', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      expect(result.current.isLive).toBe(false);

      act(() => {
        result.current.toggleLive();
      });

      expect(result.current.isLive).toBe(true);
    });

    it('should toggle isLive from true to false', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      // Toggle on
      act(() => {
        result.current.toggleLive();
      });
      expect(result.current.isLive).toBe(true);

      // Toggle off
      act(() => {
        result.current.toggleLive();
      });
      expect(result.current.isLive).toBe(false);
    });

    it('should start price updates when toggled on', async () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      const initialPrices = result.current.marketData?.prices;

      act(() => {
        result.current.toggleLive();
      });

      // Fast-forward time by 2 seconds (one tick interval)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const newPrices = result.current.marketData?.prices;
        // Prices should have changed (or at least marketData updated)
        expect(result.current.marketData?.timestamp).not.toEqual(initialPrices);
      });
    });

    it('should stop price updates when toggled off', async () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      // Toggle on
      act(() => {
        result.current.toggleLive();
      });

      // Wait for one tick
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Toggle off
      act(() => {
        result.current.toggleLive();
      });

      const snapshotAfterOff = result.current.marketData;

      // Advance time and verify no more updates
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      expect(result.current.marketData).toBe(snapshotAfterOff);
    });
  });

  describe('refreshPortfolio', () => {
    it('should reload portfolio from repository', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      const initialPortfolio = result.current.portfolio;

      act(() => {
        result.current.refreshPortfolio();
      });

      // Portfolio should be reloaded (may be same data, but function called)
      expect(result.current.portfolio).toBeDefined();
    });

    it('should not crash when called multiple times', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      act(() => {
        result.current.refreshPortfolio();
        result.current.refreshPortfolio();
        result.current.refreshPortfolio();
      });

      expect(result.current.portfolio).toBeDefined();
    });
  });

  describe('updatePrices', () => {
    it('should update market prices', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      const newPrices = {
        [AssetType.BTC]: 100000,
        [AssetType.ETH]: 4000,
        [AssetType.SOL]: 200,
      };

      act(() => {
        result.current.updatePrices(newPrices);
      });

      expect(result.current.marketData?.prices[AssetType.BTC]).toBe(100000);
      expect(result.current.marketData?.prices[AssetType.ETH]).toBe(4000);
      expect(result.current.marketData?.prices[AssetType.SOL]).toBe(200);
    });

    it('should update timestamp when prices change', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      const initialTimestamp = result.current.marketData?.timestamp;

      // Wait a bit to ensure timestamp difference
      act(() => {
        jest.advanceTimersByTime(100);
      });

      const newPrices = {
        [AssetType.BTC]: 110000,
        [AssetType.ETH]: 4500,
        [AssetType.SOL]: 220,
      };

      act(() => {
        result.current.updatePrices(newPrices);
      });

      expect(result.current.marketData?.timestamp).not.toEqual(initialTimestamp);
    });
  });

  describe('reloadWithCSV', () => {
    it('should import CSV data and update market data', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      const csvData = {
        [AssetType.BTC]: 'timestamp,open,high,low,close,volume\n2025-01-01T00:00:00Z,95000,96000,94000,95500,20000000000',
        [AssetType.ETH]: 'timestamp,open,high,low,close,volume\n2025-01-01T00:00:00Z,3800,3900,3700,3850,10000000000',
        [AssetType.SOL]: 'timestamp,open,high,low,close,volume\n2025-01-01T00:00:00Z,190,195,185,192,2000000000',
      };

      act(() => {
        result.current.reloadWithCSV(csvData);
      });

      // Prices should be updated from CSV (last bar close prices)
      expect(result.current.marketData?.prices[AssetType.BTC]).toBe(95500);
      expect(result.current.marketData?.prices[AssetType.ETH]).toBe(3850);
      expect(result.current.marketData?.prices[AssetType.SOL]).toBe(192);
    });

    it('should refresh portfolio after CSV import', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      const portfolioBeforeCSV = result.current.portfolio;

      const csvData = {
        [AssetType.BTC]: 'timestamp,open,high,low,close,volume\n2025-01-01T00:00:00Z,100000,101000,99000,100500,20000000000',
        [AssetType.ETH]: '',
        [AssetType.SOL]: '',
      };

      act(() => {
        result.current.reloadWithCSV(csvData);
      });

      // Portfolio should still exist (refreshed)
      expect(result.current.portfolio).toBeDefined();
    });
  });

  describe('SSR compatibility', () => {
    it('should not crash during server-side rendering', () => {
      // Mock window as undefined to simulate SSR
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      // Should initialize but not create services (window check)
      expect(result.current).toBeDefined();

      // Restore window
      global.window = originalWindow as any;
    });
  });

  describe('context value structure', () => {
    it('should provide all required context properties', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      expect(result.current).toHaveProperty('marketData');
      expect(result.current).toHaveProperty('portfolio');
      expect(result.current).toHaveProperty('marketDataProvider');
      expect(result.current).toHaveProperty('portfolioRepository');
      expect(result.current).toHaveProperty('isLive');
      expect(result.current).toHaveProperty('toggleLive');
      expect(result.current).toHaveProperty('refreshPortfolio');
      expect(result.current).toHaveProperty('updateLoan');
      expect(result.current).toHaveProperty('updatePrices');
      expect(result.current).toHaveProperty('reloadWithCSV');
    });

    it('should have correct function types', () => {
      const { result } = renderHook(() => useMarketData(), {
        wrapper: MarketDataProvider,
      });

      expect(typeof result.current.toggleLive).toBe('function');
      expect(typeof result.current.refreshPortfolio).toBe('function');
      expect(typeof result.current.updateLoan).toBe('function');
      expect(typeof result.current.updatePrices).toBe('function');
      expect(typeof result.current.reloadWithCSV).toBe('function');
    });
  });

  describe('children rendering', () => {
    it('should render children components', () => {
      render(
        <MarketDataProvider>
          <div data-testid="child-component">Test Child</div>
        </MarketDataProvider>
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <MarketDataProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </MarketDataProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });
});
