/**
 * RiskMetricsPanel Tests - Presentation Layer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { RiskMetricsPanel } from '@/presentation/components/portfolio/RiskMetricsPanel';
import { PortfolioMetrics } from '@/domain/entities/Portfolio';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

describe('RiskMetricsPanel', () => {
  const mockMetrics: PortfolioMetrics = {
    totalExposureUSD: 100_000_000,
    totalCollateralValueUSD: 150_000_000,
    aggregateLTV: 0.667,
    totalExpectedLossUSD: 500_000,
    valueAtRisk95: 2_500_000,
    valueAtRisk99: 3_500_000,
    conditionalVaR95: 3_000_000,
    conditionalVaR99: 4_500_000,
    sharpeRatio: 1.8,
    sortinoRatio: 2.1,
    totalDailyRevenueUSD: 25_000,
    concentrationRisk: {
      assetConcentration: {
        [AssetType.BTC]: 60,
        [AssetType.ETH]: 30,
        [AssetType.SOL]: 10,
      },
      borrowerConcentration: 1200,
      largestExposurePercent: 25,
    },
  };

  const mockRiskCapital = 120_000_000;

  describe('rendering', () => {
    it('should render panel header', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('RISK METRICS')).toBeInTheDocument();
    });

    it('should render all metric sections', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('Value at Risk')).toBeInTheDocument();
      expect(screen.getByText('Expected Shortfall')).toBeInTheDocument();
      expect(screen.getByText('Risk-Adjusted Returns')).toBeInTheDocument();
      expect(screen.getByText('Collateral Concentration')).toBeInTheDocument();
    });
  });

  describe('VaR metrics', () => {
    it('should display 95% VaR', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('95% VaR')).toBeInTheDocument();
      expect(screen.getByText('$2.50M')).toBeInTheDocument();
    });

    it('should display 99% VaR', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('99% VaR')).toBeInTheDocument();
      expect(screen.getByText('$3.50M')).toBeInTheDocument();
    });
  });

  describe('CVaR metrics', () => {
    it('should display 95% CVaR', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('95% CVaR')).toBeInTheDocument();
      expect(screen.getByText('$3.00M')).toBeInTheDocument();
    });

    it('should display 99% CVaR', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('99% CVaR')).toBeInTheDocument();
      expect(screen.getByText('$4.50M')).toBeInTheDocument();
    });
  });

  describe('risk-adjusted returns', () => {
    it('should display Sharpe ratio', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('Sharpe')).toBeInTheDocument();
      expect(screen.getByText('1.80')).toBeInTheDocument();
    });

    it('should display Sortino ratio', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('Sortino')).toBeInTheDocument();
      expect(screen.getByText('2.10')).toBeInTheDocument();
    });
  });

  describe('concentration metrics', () => {
    it('should display HHI', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      // HHI label and value are in the same element
      const hhi = screen.getByText(/HHI:/);
      expect(hhi).toBeInTheDocument();
      expect(hhi.textContent).toContain('1200');
    });

    it('should display asset concentration labels', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      // BTC and ETH have large enough widths to render text
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('ETH')).toBeInTheDocument();
      // SOL has only 10% width so text may not render, but component should be present
      expect(screen.getByText('Collateral Concentration')).toBeInTheDocument();
    });
  });

  describe('money formatting', () => {
    it('should format large amounts in millions', () => {
      const metricsWithLargeValues: PortfolioMetrics = {
        ...mockMetrics,
        valueAtRisk95: 10_000_000,
        valueAtRisk99: 15_500_000,
      };

      render(<RiskMetricsPanel portfolioMetrics={metricsWithLargeValues} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('$10.00M')).toBeInTheDocument();
      expect(screen.getByText('$15.50M')).toBeInTheDocument();
    });
  });

  describe('utilization display', () => {
    it('should calculate and display utilization percentage', () => {
      render(<RiskMetricsPanel portfolioMetrics={mockMetrics} riskCapital={mockRiskCapital} />);

      // 100M exposure / 120M capital = 83.3%
      expect(screen.getByText('Utilization')).toBeInTheDocument();
      expect(screen.getByText('83.3%')).toBeInTheDocument();
    });

    it('should handle 100% utilization', () => {
      const fullUtilizationMetrics: PortfolioMetrics = {
        ...mockMetrics,
        totalExposureUSD: mockRiskCapital,
      };

      render(<RiskMetricsPanel portfolioMetrics={fullUtilizationMetrics} riskCapital={mockRiskCapital} />);

      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle zero values gracefully', () => {
      const zeroMetrics: PortfolioMetrics = {
        ...mockMetrics,
        valueAtRisk95: 0,
        valueAtRisk99: 0,
        conditionalVaR95: 0,
        conditionalVaR99: 0,
      };

      render(<RiskMetricsPanel portfolioMetrics={zeroMetrics} riskCapital={mockRiskCapital} />);

      const zeroValues = screen.getAllByText('$0K');
      expect(zeroValues.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle very large HHI values', () => {
      const concentratedMetrics: PortfolioMetrics = {
        ...mockMetrics,
        concentrationRisk: {
          ...mockMetrics.concentrationRisk,
          borrowerConcentration: 8500,
        },
      };

      render(<RiskMetricsPanel portfolioMetrics={concentratedMetrics} riskCapital={mockRiskCapital} />);

      // HHI value is in the same element as the label
      const hhi = screen.getByText(/HHI:/);
      expect(hhi.textContent).toContain('8500');
    });
  });
});
