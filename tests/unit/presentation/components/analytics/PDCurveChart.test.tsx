/**
 * PDCurveChart Tests - Presentation Layer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { PDCurveChart } from '@/presentation/components/analytics/PDCurveChart';
import { Loan } from '@/domain/entities/Loan';
import { AssetType, CryptoAsset } from '@/domain/value-objects/CryptoAsset';
import { CreditRating } from '@/domain/value-objects/CreditRating';
import { Money } from '@/domain/value-objects/Money';

describe('PDCurveChart', () => {
  const createTestLoan = (rating: CreditRating = CreditRating.A) => {
    return new Loan(
      'test-loan',
      'Test Borrower',
      rating,
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

  const mockLoans = [
    createTestLoan(CreditRating.BBB),
    createTestLoan(CreditRating.A),
    createTestLoan(CreditRating.AA),
  ];

  const mockScenarios = ['covid-crash', 'luna-collapse', 'stable-growth'];

  describe('rendering', () => {
    it('should render chart title', () => {
      render(<PDCurveChart loans={mockLoans} selectedScenarios={mockScenarios} marketDrawdown={0} />);
      expect(screen.getByText(/PROBABILITY OF DEFAULT/i)).toBeInTheDocument();
    });

    it('should render with single scenario', () => {
      render(<PDCurveChart loans={mockLoans} selectedScenarios={['covid-crash']} marketDrawdown={0} />);
      expect(screen.getByText(/PROBABILITY OF DEFAULT/i)).toBeInTheDocument();
    });

    it('should render with multiple scenarios', () => {
      render(<PDCurveChart loans={mockLoans} selectedScenarios={mockScenarios} marketDrawdown={0.5} />);
      expect(screen.getByText(/PROBABILITY OF DEFAULT/i)).toBeInTheDocument();
    });
  });

  describe('with different credit ratings', () => {
    it('should render with BBB loans', () => {
      const bbbLoans = [createTestLoan(CreditRating.BBB)];
      render(<PDCurveChart loans={bbbLoans} selectedScenarios={['stable-growth']} marketDrawdown={0} />);
      expect(screen.getByText(/PROBABILITY OF DEFAULT/i)).toBeInTheDocument();
    });

    it('should render with AA loans', () => {
      const aaLoans = [createTestLoan(CreditRating.AA)];
      render(<PDCurveChart loans={aaLoans} selectedScenarios={['stable-growth']} marketDrawdown={0} />);
      expect(screen.getByText(/PROBABILITY OF DEFAULT/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty loan array', () => {
      render(<PDCurveChart loans={[]} selectedScenarios={mockScenarios} marketDrawdown={0} />);
      expect(screen.getByText(/PROBABILITY OF DEFAULT/i)).toBeInTheDocument();
    });

    it('should handle empty scenarios array', () => {
      render(<PDCurveChart loans={mockLoans} selectedScenarios={[]} marketDrawdown={0} />);
      expect(screen.getByText(/PROBABILITY OF DEFAULT/i)).toBeInTheDocument();
    });

    it('should handle high market drawdown', () => {
      render(<PDCurveChart loans={mockLoans} selectedScenarios={mockScenarios} marketDrawdown={0.8} />);
      expect(screen.getByText(/PROBABILITY OF DEFAULT/i)).toBeInTheDocument();
    });
  });
});
