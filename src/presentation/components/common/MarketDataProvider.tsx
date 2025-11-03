'use client';

/**
 * Market Data Provider (Presentation Layer)
 *
 * React Context provider that delegates to Application Layer use cases.
 * Contains NO business logic - only state management and use case orchestration.
 *
 * Clean Architecture: Presentation layer calls use cases, never directly
 * accesses infrastructure or domain layers.
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { MarketDataSnapshot } from '@/application/ports/IMarketDataProvider';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

// Infrastructure Layer (implements port interfaces)
import { MarketDataService } from '@/infrastructure/adapters/MarketDataService';
import { LocalStorageRepository } from '@/infrastructure/persistence/LocalStorageRepository';

// Application Layer (use cases)
import { LoadPortfolioUseCase } from '@/application/use-cases/LoadPortfolioUseCase';
import { LoadDemoPortfolioUseCase } from '@/application/use-cases/LoadDemoPortfolioUseCase';
import { UpdateLoanUseCase } from '@/application/use-cases/UpdateLoanUseCase';
import { UpdateMarketPricesUseCase } from '@/application/use-cases/UpdateMarketPricesUseCase';
import { ImportCSVDataUseCase } from '@/application/use-cases/ImportCSVDataUseCase';
import { LoadPortfolioRequest, LoadDemoPortfolioRequest } from '@/application/dtos/LoadPortfolioDTOs';
import { UpdateLoanRequest } from '@/application/dtos/UpdateLoanDTOs';
import { UpdateMarketPricesRequest } from '@/application/dtos/UpdateMarketPricesDTOs';
import { ImportCSVDataRequest } from '@/application/dtos/ImportCSVDataDTOs';

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

  // Infrastructure Layer (adapters)
  const marketDataServiceRef = useRef<MarketDataService | null>(null);
  const repositoryRef = useRef<LocalStorageRepository | null>(null);

  // Application Layer (use cases)
  const loadPortfolioUseCaseRef = useRef<LoadPortfolioUseCase | null>(null);
  const loadDemoPortfolioUseCaseRef = useRef<LoadDemoPortfolioUseCase | null>(null);
  const updateLoanUseCaseRef = useRef<UpdateLoanUseCase | null>(null);
  const updatePricesUseCaseRef = useRef<UpdateMarketPricesUseCase | null>(null);
  const importCSVUseCaseRef = useRef<ImportCSVDataUseCase | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize services and use cases
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize infrastructure adapters
    if (!marketDataServiceRef.current) {
      marketDataServiceRef.current = new MarketDataService();
    }
    if (!repositoryRef.current) {
      repositoryRef.current = new LocalStorageRepository();
    }

    // Initialize use cases (Dependency Injection)
    if (!loadPortfolioUseCaseRef.current) {
      loadPortfolioUseCaseRef.current = new LoadPortfolioUseCase(
        repositoryRef.current
      );
    }
    if (!loadDemoPortfolioUseCaseRef.current) {
      loadDemoPortfolioUseCaseRef.current = new LoadDemoPortfolioUseCase(
        repositoryRef.current
      );
    }
    if (!updateLoanUseCaseRef.current) {
      updateLoanUseCaseRef.current = new UpdateLoanUseCase(
        repositoryRef.current
      );
    }
    if (!updatePricesUseCaseRef.current) {
      updatePricesUseCaseRef.current = new UpdateMarketPricesUseCase(
        marketDataServiceRef.current
      );
    }
    if (!importCSVUseCaseRef.current) {
      importCSVUseCaseRef.current = new ImportCSVDataUseCase(
        marketDataServiceRef.current,
        marketDataServiceRef.current // Also implements IPriceHistoryService
      );
    }

    // Try to load existing portfolio
    const response = loadPortfolioUseCaseRef.current.execute(
      new LoadPortfolioRequest()
    );

    // If no portfolio exists, load demo portfolio for better UX
    if (response.success && response.portfolio) {
      setPortfolio(response.portfolio);
    } else {
      // No portfolio found - load demo data
      const demoResponse = loadDemoPortfolioUseCaseRef.current.execute(
        new LoadDemoPortfolioRequest()
      );
      setPortfolio(demoResponse.portfolio);
    }

    // Get initial market snapshot
    const initialSnapshot = marketDataServiceRef.current.getCurrentSnapshot();
    setMarketData(initialSnapshot);
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
    if (!loadPortfolioUseCaseRef.current) return;

    const response = loadPortfolioUseCaseRef.current.execute(
      new LoadPortfolioRequest()
    );
    if (response.success && response.portfolio) {
      setPortfolio(response.portfolio);
    }
  };

  const updateLoan = (updatedLoan: Loan) => {
    if (!updateLoanUseCaseRef.current) return;

    // Use UpdateLoanUseCase instead of direct business logic
    const response = updateLoanUseCaseRef.current.execute(
      new UpdateLoanRequest(updatedLoan)
    );

    if (response.success && response.portfolio) {
      setPortfolio(response.portfolio);
    } else {
      console.error('Failed to update loan:', response.errorMessage);
    }
  };

  const updatePrices = (newPrices: Record<AssetType, number>) => {
    if (!updatePricesUseCaseRef.current) return;

    // Use UpdateMarketPricesUseCase instead of direct manipulation
    const response = updatePricesUseCaseRef.current.execute(
      new UpdateMarketPricesRequest(newPrices)
    );

    if (response.success) {
      setMarketData(response.snapshot);
    }
  };

  const reloadWithCSV = (csvData: Record<AssetType, string>) => {
    if (!importCSVUseCaseRef.current) return;

    // Use ImportCSVDataUseCase instead of direct service calls
    const response = importCSVUseCaseRef.current.execute(
      new ImportCSVDataRequest(csvData)
    );

    if (response.success) {
      setMarketData(response.snapshot);
      // Force re-render of portfolio with new prices
      refreshPortfolio();
    } else {
      console.error('CSV import failed:', response.errorMessage);
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
