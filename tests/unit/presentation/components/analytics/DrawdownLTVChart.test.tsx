/**
 * DrawdownLTVChart Tests - Presentation Layer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { DrawdownLTVChart } from '@/presentation/components/analytics/DrawdownLTVChart';
import { Loan } from '@/domain/entities/Loan';
import { AssetType, CryptoAsset } from '@/domain/value-objects/CryptoAsset';
import { CreditRating } from '@/domain/value-objects/CreditRating';
import { Money } from '@/domain/value-objects/Money';
import { PriceBar } from '@/application/ports/IMarketDataProvider';

describe('DrawdownLTVChart', () => {
  const createTestLoan = () => {
    return new Loan(
      'test-loan',
      'Test Borrower',
      CreditRating.A,
      {
        principalUSD: Money.fromUSD(1000000),
        annualRatePercent: 9.45,
        tenorDays: 30,
        rollDate: new Date('2025-02-01'),
      },
      new CryptoAsset(AssetType.BTC, 15),
      1.5,
      new Date('2025-01-01')
    );
  };

  const createMockHistory = (): PriceBar[] => {
    const now = new Date();
    return Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(now.getTime() - (100 - i) * 3600000),
      open: 95000 + Math.random() * 10000,
      high: 96000 + Math.random() * 10000,
      low: 94000 + Math.random() * 10000,
      close: 95000 + Math.random() * 10000,
      volume: 1000000000,
    }));
  };

  const mockLoan = createTestLoan();
  const mockHistory = createMockHistory();

  describe('rendering', () => {
    it('should render chart title', () => {
      render(<DrawdownLTVChart loan={mockLoan} priceHistory={mockHistory} />);
      expect(screen.getByText(/LTV TIMELINE/i)).toBeInTheDocument();
    });

    it('should render borrower name', () => {
      render(<DrawdownLTVChart loan={mockLoan} priceHistory={mockHistory} />);
      expect(screen.getByText(/Test Borrower/i)).toBeInTheDocument();
    });

    it('should render margin probability information', () => {
      render(<DrawdownLTVChart loan={mockLoan} priceHistory={mockHistory} />);

      // Should show probability labels
      expect(screen.getByText(/3d/)).toBeInTheDocument();
      expect(screen.getByText(/5d/)).toBeInTheDocument();
    });
  });

  describe('with short history', () => {
    it('should handle minimal data points', () => {
      const shortHistory = mockHistory.slice(0, 10);
      render(<DrawdownLTVChart loan={mockLoan} priceHistory={shortHistory} />);

      expect(screen.getByText(/Test Borrower/i)).toBeInTheDocument();
    });
  });

  describe('with empty history', () => {
    it('should handle empty price history', () => {
      render(<DrawdownLTVChart loan={mockLoan} priceHistory={[]} />);

      expect(screen.getByText(/Test Borrower/i)).toBeInTheDocument();
    });
  });
});
