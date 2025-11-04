/**
 * DrawdownLTVChart Tests - Presentation Layer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { DrawdownLTVChart } from '@/presentation/components/analytics/DrawdownLTVChart';
import { Loan } from '@/domain/entities/Loan';
import { AssetType, CryptoAsset } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';
import { Money } from '@/domain/value-objects/Money';
import { MarketDataService } from '@/infrastructure/adapters/MarketDataService';

describe('DrawdownLTVChart', () => {
  const createTestLoan = () => {
    return new Loan(
      'test-loan',
      'Test Borrower',
      new CreditRating(RatingTier.A),
      {
        principalUSD: 1000000,
        lendingRate: 0.0945,
        costOfCapital: 0.045,
        tenor: 30,
        rollDate: new Date('2025-02-01'),
      },
      new CryptoAsset(AssetType.BTC, 15),
      1.5,
      new Date('2025-01-01')
    );
  };

  const mockLoan = createTestLoan();
  const mockMarketDataProvider = new MarketDataService();
  const mockCurrentPrice = 95000;

  describe('rendering', () => {
    it('should render chart title', () => {
      render(<DrawdownLTVChart loan={mockLoan} currentPrice={mockCurrentPrice} marketDataProvider={mockMarketDataProvider} />);
      expect(screen.getByText(/LTV TIMELINE/i)).toBeInTheDocument();
    });

    it('should render collateral information', () => {
      const { container } = render(<DrawdownLTVChart loan={mockLoan} currentPrice={mockCurrentPrice} marketDataProvider={mockMarketDataProvider} />);
      // Component should display collateral-related metrics
      expect(screen.getByText('Collateral Value')).toBeInTheDocument();
      expect(screen.getByText('Current LTV')).toBeInTheDocument();
    });

    it('should render margin probability information', () => {
      render(<DrawdownLTVChart loan={mockLoan} currentPrice={mockCurrentPrice} marketDataProvider={mockMarketDataProvider} />);

      // Should show margin event probability labels (multiple instances)
      expect(screen.getByText('Margin Call (3d/5d)')).toBeInTheDocument();
      expect(screen.getByText('Liquidation (3d/5d)')).toBeInTheDocument();
    });
  });

  describe('with different loan scenarios', () => {
    it('should handle high LTV loans', () => {
      const highLTVLoan = new Loan(
        'high-ltv-loan',
        'High Risk Borrower',
        new CreditRating(RatingTier.BBB),
        {
          principalUSD: 800000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: new Date('2025-02-01'),
        },
        new CryptoAsset(AssetType.BTC, 10),
        2.0,
        new Date('2025-01-01')
      );

      render(<DrawdownLTVChart loan={highLTVLoan} currentPrice={mockCurrentPrice} marketDataProvider={mockMarketDataProvider} />);
      // Component should render chart title regardless of loan LTV
      expect(screen.getByText(/LTV TIMELINE/i)).toBeInTheDocument();
    });
  });
});
