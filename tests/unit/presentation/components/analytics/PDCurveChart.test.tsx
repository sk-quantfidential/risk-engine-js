/**
 * PDCurveChart Tests - Presentation Layer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { PDCurveChart } from '@/presentation/components/analytics/PDCurveChart';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { AssetType, CryptoAsset } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';
import { Money } from '@/domain/value-objects/Money';
import { ScenarioService } from '@/infrastructure/adapters/ScenarioService';

describe('PDCurveChart', () => {
  const createTestLoan = (id: string, rating: RatingTier = RatingTier.A) => {
    return new Loan(
      id,
      'Test Borrower',
      new CreditRating(rating),
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

  const mockLoans = [
    createTestLoan('loan-1', RatingTier.BBB),
    createTestLoan('loan-2', RatingTier.A),
    createTestLoan('loan-3', RatingTier.AA),
  ];

  const mockPortfolio = new Portfolio(mockLoans, 10_000_000);
  const mockScenarioService = new ScenarioService();
  const mockScenarios = ['covid-crash', 'luna-collapse', 'stable-growth'];

  describe('rendering', () => {
    it('should render chart title', () => {
      render(<PDCurveChart portfolio={mockPortfolio} scenarioService={mockScenarioService} selectedScenarios={mockScenarios} />);
      const titles = screen.getAllByText(/PROBABILITY OF DEFAULT/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('should render with single scenario', () => {
      render(<PDCurveChart portfolio={mockPortfolio} scenarioService={mockScenarioService} selectedScenarios={['covid-crash']} />);
      const titles = screen.getAllByText(/PROBABILITY OF DEFAULT/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('should render with multiple scenarios', () => {
      render(<PDCurveChart portfolio={mockPortfolio} scenarioService={mockScenarioService} selectedScenarios={mockScenarios} />);
      const titles = screen.getAllByText(/PROBABILITY OF DEFAULT/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('with different credit ratings', () => {
    it('should render with BBB loans', () => {
      const bbbLoans = [createTestLoan('bbb-loan-1', RatingTier.BBB)];
      const bbbPortfolio = new Portfolio(bbbLoans, 10_000_000);
      render(<PDCurveChart portfolio={bbbPortfolio} scenarioService={mockScenarioService} selectedScenarios={['stable-growth']} />);
      const titles = screen.getAllByText(/PROBABILITY OF DEFAULT/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('should render with AA loans', () => {
      const aaLoans = [createTestLoan('aa-loan-1', RatingTier.AA)];
      const aaPortfolio = new Portfolio(aaLoans, 10_000_000);
      render(<PDCurveChart portfolio={aaPortfolio} scenarioService={mockScenarioService} selectedScenarios={['stable-growth']} />);
      const titles = screen.getAllByText(/PROBABILITY OF DEFAULT/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty loan array', () => {
      const emptyPortfolio = new Portfolio([], 10_000_000);
      render(<PDCurveChart portfolio={emptyPortfolio} scenarioService={mockScenarioService} selectedScenarios={mockScenarios} />);
      const titles = screen.getAllByText(/PROBABILITY OF DEFAULT/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty scenarios array', () => {
      render(<PDCurveChart portfolio={mockPortfolio} scenarioService={mockScenarioService} selectedScenarios={[]} />);
      const titles = screen.getAllByText(/PROBABILITY OF DEFAULT/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle all scenarios together', () => {
      const allScenarios = ['covid-crash', 'luna-collapse', 'stable-growth', 'bull-rally', 'high-volatility'];
      render(<PDCurveChart portfolio={mockPortfolio} scenarioService={mockScenarioService} selectedScenarios={allScenarios} />);
      const titles = screen.getAllByText(/PROBABILITY OF DEFAULT/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });
  });
});
