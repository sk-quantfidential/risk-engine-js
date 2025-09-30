'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { MarketDataService, MarketDataSnapshot } from '@/infrastructure/adapters/MarketDataService';
import { Portfolio } from '@/domain/entities/Portfolio';
import { LocalStorageRepository } from '@/infrastructure/persistence/LocalStorageRepository';
import { SampleDataGenerator } from '@/infrastructure/adapters/SampleDataGenerator';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

interface MarketDataContextValue {
  marketData: MarketDataSnapshot | null;
  portfolio: Portfolio | null;
  marketDataService: MarketDataService;
  repository: LocalStorageRepository;
  isLive: boolean;
  toggleLive: () => void;
  refreshPortfolio: () => void;
}

const MarketDataContext = createContext<MarketDataContextValue | null>(null);

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within MarketDataProvider');
  }
  return context;
}

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const [marketData, setMarketData] = useState<MarketDataSnapshot | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLive, setIsLive] = useState(false);
  const marketDataServiceRef = useRef<MarketDataService | null>(null);
  const repositoryRef = useRef<LocalStorageRepository | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize services
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize market data service
    if (!marketDataServiceRef.current) {
      marketDataServiceRef.current = new MarketDataService();
    }

    // Initialize repository
    if (!repositoryRef.current) {
      repositoryRef.current = new LocalStorageRepository();
    }

    // Load or create portfolio
    let loadedPortfolio = repositoryRef.current.loadPortfolio();
    if (!loadedPortfolio) {
      // Generate sample data
      loadedPortfolio = SampleDataGenerator.generateSamplePortfolio();
      repositoryRef.current.savePortfolio(loadedPortfolio);
    }
    setPortfolio(loadedPortfolio);

    // Get initial prices
    const initialPrices = marketDataServiceRef.current.getCurrentPrices();
    setMarketData({
      timestamp: new Date(),
      prices: initialPrices,
      returns: {
        [AssetType.BTC]: 0,
        [AssetType.ETH]: 0,
        [AssetType.SOL]: 0,
      },
    });
  }, []);

  // Real-time price updates via simulated SSE
  useEffect(() => {
    if (!isLive || !marketDataServiceRef.current) return;

    // Simulate price ticks every 2 seconds
    intervalRef.current = setInterval(() => {
      const snapshot = marketDataServiceRef.current!.simulateTick();
      setMarketData(snapshot);
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive]);

  const toggleLive = () => {
    setIsLive(prev => !prev);
  };

  const refreshPortfolio = () => {
    if (repositoryRef.current) {
      const loadedPortfolio = repositoryRef.current.loadPortfolio();
      if (loadedPortfolio) {
        setPortfolio(loadedPortfolio);
      }
    }
  };

  const value: MarketDataContextValue = {
    marketData,
    portfolio,
    marketDataService: marketDataServiceRef.current!,
    repository: repositoryRef.current!,
    isLive,
    toggleLive,
    refreshPortfolio,
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}