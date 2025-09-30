'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { MarketDataService, MarketDataSnapshot } from '@/infrastructure/adapters/MarketDataService';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
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
  updateLoan: (updatedLoan: Loan) => void;
  updatePrices: (newPrices: Record<AssetType, number>) => void;
  reloadWithCSV: (csvData: Record<AssetType, string>) => void;
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

  const updateLoan = (updatedLoan: Loan) => {
    if (repositoryRef.current && portfolio) {
      // Update loan in repository
      repositoryRef.current.saveLoan(updatedLoan);

      // Create new portfolio with updated loan
      const updatedLoans = portfolio.loans.map(loan =>
        loan.id === updatedLoan.id ? updatedLoan : loan
      );
      const updatedPortfolio = new Portfolio(updatedLoans, portfolio.riskCapitalUSD);

      // Save and update state
      repositoryRef.current.savePortfolio(updatedPortfolio);
      setPortfolio(updatedPortfolio);
    }
  };

  const updatePrices = (newPrices: Record<AssetType, number>) => {
    // Update prices in market data service if the method exists
    if (marketDataServiceRef.current) {
      // Try to use setCurrentPrices if available, otherwise directly update
      if (typeof marketDataServiceRef.current.setCurrentPrices === 'function') {
        marketDataServiceRef.current.setCurrentPrices(newPrices);
      } else {
        // Fallback: directly update the private property (TypeScript will complain but it will work)
        (marketDataServiceRef.current as any).currentPrices = { ...newPrices };
      }
    }

    // Update market data snapshot
    setMarketData({
      timestamp: new Date(),
      prices: newPrices,
      returns: marketData?.returns || {
        [AssetType.BTC]: 0,
        [AssetType.ETH]: 0,
        [AssetType.SOL]: 0,
      },
    });
  };

  const reloadWithCSV = (csvData: Record<AssetType, string>) => {
    // Create new market data service with CSV data
    marketDataServiceRef.current = new MarketDataService(csvData);

    // Get new prices
    const newPrices = marketDataServiceRef.current.getCurrentPrices();
    setMarketData({
      timestamp: new Date(),
      prices: newPrices,
      returns: {
        [AssetType.BTC]: 0,
        [AssetType.ETH]: 0,
        [AssetType.SOL]: 0,
      },
    });

    // Force re-render of portfolio with new prices
    refreshPortfolio();
  };

  const value: MarketDataContextValue = {
    marketData,
    portfolio,
    marketDataService: marketDataServiceRef.current!,
    repository: repositoryRef.current!,
    isLive,
    toggleLive,
    refreshPortfolio,
    updateLoan,
    updatePrices,
    reloadWithCSV,
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}