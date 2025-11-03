/**
 * ScenarioComparison Tests - Presentation Layer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { ScenarioComparison } from '@/presentation/components/analytics/ScenarioComparison';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { AssetType, CryptoAsset } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';
import { Money } from '@/domain/value-objects/Money';
import { ScenarioService } from '@/infrastructure/adapters/ScenarioService';

describe('ScenarioComparison', () => {
  const createTestLoan = () => {
    return new Loan(
      'test-loan-1',
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

  const mockPortfolio = new Portfolio([createTestLoan()], 10_000_000);
  const mockCurrentPrices = {
    [AssetType.BTC]: 95000,
    [AssetType.ETH]: 3400,
    [AssetType.SOL]: 180,
  };
  const mockScenarioService = new ScenarioService();
  const mockSelectedScenarios = ['covid-crash', 'stable-growth'];

  describe('rendering', () => {
    it('should render component title', () => {
      render(
        <ScenarioComparison
          portfolio={mockPortfolio}
          currentPrices={mockCurrentPrices}
          scenarioService={mockScenarioService}
          selectedScenarios={mockSelectedScenarios}
        />
      );
      expect(screen.getByText('SCENARIO COMPARISON MATRIX')).toBeInTheDocument();
    });

    it('should render scenario names', () => {
      render(
        <ScenarioComparison
          portfolio={mockPortfolio}
          currentPrices={mockCurrentPrices}
          scenarioService={mockScenarioService}
          selectedScenarios={['covid-crash']}
        />
      );

      // Component renders scenario data in table
      const element = screen.getByText(/2020 COVID/i);
      expect(element).toBeInTheDocument();
    });

    it('should render table with metrics', () => {
      render(
        <ScenarioComparison
          portfolio={mockPortfolio}
          currentPrices={mockCurrentPrices}
          scenarioService={mockScenarioService}
          selectedScenarios={mockSelectedScenarios}
        />
      );

      // Should render multiple rows for scenarios
      expect(screen.getByText(/2020 COVID/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty scenarios array', () => {
      render(
        <ScenarioComparison
          portfolio={mockPortfolio}
          currentPrices={mockCurrentPrices}
          scenarioService={mockScenarioService}
          selectedScenarios={[]}
        />
      );
      expect(screen.getByText('SCENARIO COMPARISON MATRIX')).toBeInTheDocument();
    });

    it('should handle single scenario', () => {
      render(
        <ScenarioComparison
          portfolio={mockPortfolio}
          currentPrices={mockCurrentPrices}
          scenarioService={mockScenarioService}
          selectedScenarios={['covid-crash']}
        />
      );

      expect(screen.getByText(/2020 COVID/i)).toBeInTheDocument();
    });

    it('should handle multiple scenarios', () => {
      render(
        <ScenarioComparison
          portfolio={mockPortfolio}
          currentPrices={mockCurrentPrices}
          scenarioService={mockScenarioService}
          selectedScenarios={['covid-crash', 'stable-growth']}
        />
      );

      expect(screen.getByText(/2020 COVID/i)).toBeInTheDocument();
      expect(screen.getByText(/Stable Growth/i)).toBeInTheDocument();
    });
  });
});
