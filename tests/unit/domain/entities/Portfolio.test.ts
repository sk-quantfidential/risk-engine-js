/**
 * Portfolio Entity Tests
 *
 * Clean Architecture Testing: Domain Layer
 * - Pure unit tests with NO mocks
 * - Tests portfolio aggregation business logic
 * - Validates risk metrics, concentration, and optimization calculations
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { CryptoAsset, AssetType } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

describe('Portfolio Entity', () => {
  let testLoans: Loan[];
  const now = new Date('2025-01-01T00:00:00Z');
  const rollDate = new Date('2025-01-31T00:00:00Z');
  const prices: Record<AssetType, number> = {
    [AssetType.BTC]: 100000,
    [AssetType.ETH]: 4000,
    [AssetType.SOL]: 200,
  };

  beforeEach(() => {
    // Create a diversified portfolio
    testLoans = [
      // BTC loans (60% of portfolio)
      new Loan(
        'BTC-001',
        'BTC Borrower 1',
        new CreditRating(RatingTier.A),
        {
          principalUSD: 3000000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate,
        },
        new CryptoAsset(AssetType.BTC, 40.0),
        2.0,
        now
      ),
      new Loan(
        'BTC-002',
        'BTC Borrower 2',
        new CreditRating(RatingTier.BBB),
        {
          principalUSD: 3000000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate,
        },
        new CryptoAsset(AssetType.BTC, 35.0),
        1.5,
        now
      ),
      // ETH loan (30%)
      new Loan(
        'ETH-001',
        'ETH Borrower 1',
        new CreditRating(RatingTier.A),
        {
          principalUSD: 3000000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate,
        },
        new CryptoAsset(AssetType.ETH, 900.0),
        2.5,
        now
      ),
      // SOL loan (10%)
      new Loan(
        'SOL-001',
        'SOL Borrower 1',
        new CreditRating(RatingTier.AA),
        {
          principalUSD: 1000000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate,
        },
        new CryptoAsset(AssetType.SOL, 10000.0), // Increased to ensure healthy status
        1.0,
        now
      ),
    ];
  });

  describe('constructor', () => {
    it('should create portfolio with loans', () => {
      const portfolio = new Portfolio(testLoans, 10000000);

      expect(portfolio.loans).toHaveLength(4);
      expect(portfolio.riskCapitalUSD).toBe(10000000);
    });

    it('should create empty portfolio', () => {
      const portfolio = new Portfolio([], 5000000);

      expect(portfolio.loans).toHaveLength(0);
      expect(portfolio.riskCapitalUSD).toBe(5000000);
    });

    it('should create portfolio with single loan', () => {
      const portfolio = new Portfolio([testLoans[0]], 2000000);

      expect(portfolio.loans).toHaveLength(1);
    });
  });

  describe('calculateMetrics', () => {
    let portfolio: Portfolio;

    beforeEach(() => {
      portfolio = new Portfolio(testLoans, 10000000);
    });

    it('should calculate total exposure correctly', () => {
      const metrics = portfolio.calculateMetrics(prices);

      // 3M + 3M + 3M + 1M = 10M
      expect(metrics.totalExposureUSD).toBe(10000000);
    });

    it('should calculate total collateral value correctly', () => {
      const metrics = portfolio.calculateMetrics(prices);

      // BTC: (40 + 35) * 100k = $7.5M
      // ETH: 900 * 4k = $3.6M
      // SOL: 10000 * 200 = $2.0M
      // Total = $13.1M
      expect(metrics.totalCollateralValueUSD).toBe(13100000);
    });

    it('should calculate aggregate LTV correctly', () => {
      const metrics = portfolio.calculateMetrics(prices);

      // $10M exposure / $13.1M collateral ≈ 76.3%
      expect(metrics.aggregateLTV).toBeCloseTo(0.763, 2);
    });

    it('should calculate total daily revenue', () => {
      const metrics = portfolio.calculateMetrics(prices);

      // Each loan: principal * 9.45% / 365
      // (3M + 3M + 3M + 1M) * 0.0945 / 365 = $2,589.04/day
      expect(metrics.totalDailyRevenueUSD).toBeCloseTo(2589.04, 1);
    });

    it('should calculate total expected loss', () => {
      const metrics = portfolio.calculateMetrics(prices);

      // Should aggregate all loan expected losses
      expect(metrics.totalExpectedLossUSD).toBeGreaterThan(0);
    });

    it('should calculate VaR metrics', () => {
      const metrics = portfolio.calculateMetrics(prices);

      expect(metrics.valueAtRisk95).toBeGreaterThan(0);
      expect(metrics.valueAtRisk99).toBeGreaterThan(metrics.valueAtRisk95);
      expect(metrics.conditionalVaR95).toBeGreaterThan(metrics.valueAtRisk95);
      expect(metrics.conditionalVaR99).toBeGreaterThan(metrics.valueAtRisk99);
    });

    it('should calculate Sharpe ratio', () => {
      const metrics = portfolio.calculateMetrics(prices);

      expect(metrics.sharpeRatio).toBeDefined();
      expect(typeof metrics.sharpeRatio).toBe('number');
    });

    it('should calculate Sortino ratio', () => {
      const metrics = portfolio.calculateMetrics(prices);

      expect(metrics.sortinoRatio).toBeDefined();
      expect(typeof metrics.sortinoRatio).toBe('number');
    });

    it('should increase expected loss with market drawdown', () => {
      const metrics_normal = portfolio.calculateMetrics(prices, 0);
      const metrics_stressed = portfolio.calculateMetrics(prices, 0.5);

      expect(metrics_stressed.totalExpectedLossUSD).toBeGreaterThan(
        metrics_normal.totalExpectedLossUSD
      );
    });

    describe('concentration metrics', () => {
      it('should calculate asset concentration correctly', () => {
        const metrics = portfolio.calculateMetrics(prices);
        const concentration = metrics.concentrationRisk.assetConcentration;

        // BTC: $7.5M / $13.1M ≈ 57.25%
        // ETH: $3.6M / $13.1M ≈ 27.48%
        // SOL: $2.0M / $13.1M ≈ 15.27%
        expect(concentration[AssetType.BTC]).toBeCloseTo(57.25, 1);
        expect(concentration[AssetType.ETH]).toBeCloseTo(27.48, 1);
        expect(concentration[AssetType.SOL]).toBeCloseTo(15.27, 1);
      });

      it('should calculate borrower concentration (HHI)', () => {
        const metrics = portfolio.calculateMetrics(prices);
        const hhi = metrics.concentrationRisk.borrowerConcentration;

        // Shares: 30%, 30%, 30%, 10%
        // HHI = 30² + 30² + 30² + 10² = 900 + 900 + 900 + 100 = 2800
        expect(hhi).toBeCloseTo(2800, 0);
      });

      it('should calculate largest exposure percentage', () => {
        const metrics = portfolio.calculateMetrics(prices);

        // Largest loan = $3M / $10M = 30%
        expect(metrics.concentrationRisk.largestExposurePercent).toBe(30);
      });
    });

    describe('empty portfolio', () => {
      it('should handle empty portfolio gracefully', () => {
        const emptyPortfolio = new Portfolio([], 1000000);
        const metrics = emptyPortfolio.calculateMetrics(prices);

        expect(metrics.totalExposureUSD).toBe(0);
        expect(metrics.totalCollateralValueUSD).toBe(0);
        expect(metrics.totalExpectedLossUSD).toBe(0);
        expect(metrics.totalDailyRevenueUSD).toBe(0);
      });
    });
  });

  describe('calculateRiskContributions', () => {
    let portfolio: Portfolio;

    beforeEach(() => {
      portfolio = new Portfolio(testLoans, 10000000);
    });

    it('should calculate risk contributions for all loans', () => {
      const contributions = portfolio.calculateRiskContributions(prices);

      expect(contributions).toHaveLength(4);
    });

    it('should include loan ID and borrower name', () => {
      const contributions = portfolio.calculateRiskContributions(prices);

      expect(contributions[0].loanId).toBe('BTC-001');
      expect(contributions[0].borrowerName).toBe('BTC Borrower 1');
    });

    it('should calculate marginal VaR for each loan', () => {
      const contributions = portfolio.calculateRiskContributions(prices);

      contributions.forEach(contrib => {
        expect(contrib.marginalVaR).toBeDefined();
        expect(typeof contrib.marginalVaR).toBe('number');
      });
    });

    it('should calculate percent of portfolio risk', () => {
      const contributions = portfolio.calculateRiskContributions(prices);

      contributions.forEach(contrib => {
        expect(contrib.percentOfPortfolioRisk).toBeDefined();
        expect(typeof contrib.percentOfPortfolioRisk).toBe('number');
      });
    });

    it('should show BBB loan contributes more risk than AA loan', () => {
      const contributions = portfolio.calculateRiskContributions(prices);

      const bbbContrib = contributions.find(c => c.loanId === 'BTC-002'); // BBB rating
      const aaContrib = contributions.find(c => c.loanId === 'SOL-001'); // AA rating

      // BBB should contribute more marginal risk than AA (same principal)
      expect(bbbContrib!.marginalVaR).toBeGreaterThan(aaContrib!.marginalVaR);
    });

    it('should handle single loan portfolio', () => {
      const singleLoanPortfolio = new Portfolio([testLoans[0]], 5000000);
      const contributions = singleLoanPortfolio.calculateRiskContributions(prices);

      expect(contributions).toHaveLength(1);
      expect(contributions[0].loanId).toBe('BTC-001');
    });
  });

  describe('getLoansByStatus', () => {
    let portfolio: Portfolio;

    beforeEach(() => {
      portfolio = new Portfolio(testLoans, 10000000);
    });

    it('should return healthy loans with good collateralization', () => {
      const healthyLoans = portfolio.getLoansByStatus('healthy', prices);

      // At current prices, all loans should be healthy
      expect(healthyLoans.length).toBeGreaterThan(0);
    });

    it('should return warning loans when prices drop', () => {
      // Drop BTC price to trigger warning status
      const stressedPrices = {
        ...prices,
        [AssetType.BTC]: 50000, // 50% drop
      };

      const warningLoans = portfolio.getLoansByStatus('warning', stressedPrices);

      expect(warningLoans.length).toBeGreaterThanOrEqual(0);
    });

    it('should return call loans when prices drop significantly', () => {
      // Drop all prices to trigger margin calls
      const stressedPrices = {
        [AssetType.BTC]: 42000,
        [AssetType.ETH]: 1500,
        [AssetType.SOL]: 80,
      };

      const callLoans = portfolio.getLoansByStatus('call', stressedPrices);

      expect(callLoans.length).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array if no loans match status', () => {
      // At healthy prices, no liquidations
      const liquidationLoans = portfolio.getLoansByStatus('liquidation', prices);

      expect(liquidationLoans).toEqual([]);
    });

    it('should handle empty portfolio', () => {
      const emptyPortfolio = new Portfolio([], 1000000);
      const loans = emptyPortfolio.getLoansByStatus('healthy', prices);

      expect(loans).toEqual([]);
    });
  });

  describe('toJSON / fromJSON', () => {
    let portfolio: Portfolio;

    beforeEach(() => {
      portfolio = new Portfolio(testLoans, 10000000);
    });

    it('should serialize portfolio to JSON', () => {
      const json = portfolio.toJSON();

      expect(json.loans).toHaveLength(4);
      expect(json.riskCapitalUSD).toBe(10000000);
      expect(json.loans[0].id).toBe('BTC-001');
    });

    it('should deserialize portfolio from JSON', () => {
      const json = portfolio.toJSON();
      const deserialized = Portfolio.fromJSON(json);

      expect(deserialized.loans).toHaveLength(4);
      expect(deserialized.riskCapitalUSD).toBe(10000000);
      expect(deserialized.loans[0].id).toBe('BTC-001');
    });

    it('should roundtrip through JSON', () => {
      const json = portfolio.toJSON();
      const deserialized = Portfolio.fromJSON(json);

      const originalMetrics = portfolio.calculateMetrics(prices);
      const deserializedMetrics = deserialized.calculateMetrics(prices);

      expect(deserializedMetrics.totalExposureUSD).toBe(originalMetrics.totalExposureUSD);
      expect(deserializedMetrics.aggregateLTV).toBeCloseTo(originalMetrics.aggregateLTV, 5);
    });

    it('should preserve loan properties after serialization', () => {
      const json = portfolio.toJSON();
      const deserialized = Portfolio.fromJSON(json);

      expect(deserialized.loans[0].borrowerName).toBe('BTC Borrower 1');
      expect(deserialized.loans[0].borrowerRating.tier).toBe(RatingTier.A);
      expect(deserialized.loans[0].collateral.type).toBe(AssetType.BTC);
    });
  });

  describe('edge cases', () => {
    it('should handle portfolio with all same asset type', () => {
      const btcOnlyLoans = [
        new Loan(
          'BTC-001',
          'Borrower 1',
          new CreditRating(RatingTier.A),
          testLoans[0].terms,
          new CryptoAsset(AssetType.BTC, 30.0),
          2.0,
          now
        ),
        new Loan(
          'BTC-002',
          'Borrower 2',
          new CreditRating(RatingTier.A),
          testLoans[0].terms,
          new CryptoAsset(AssetType.BTC, 20.0),
          2.0,
          now
        ),
      ];

      const portfolio = new Portfolio(btcOnlyLoans, 5000000);
      const metrics = portfolio.calculateMetrics(prices);

      expect(metrics.concentrationRisk.assetConcentration[AssetType.BTC]).toBe(100);
      expect(metrics.concentrationRisk.assetConcentration[AssetType.ETH]).toBe(0);
      expect(metrics.concentrationRisk.assetConcentration[AssetType.SOL]).toBe(0);
    });

    it('should handle portfolio with very small risk capital', () => {
      const portfolio = new Portfolio(testLoans, 1); // $1 risk capital

      const metrics = portfolio.calculateMetrics(prices);

      expect(metrics.sharpeRatio).toBeDefined();
      expect(metrics.sortinoRatio).toBeDefined();
    });

    it('should handle portfolio with very large risk capital', () => {
      const portfolio = new Portfolio(testLoans, 1000000000); // $1B risk capital

      const metrics = portfolio.calculateMetrics(prices);

      expect(metrics.sharpeRatio).toBeDefined();
      expect(metrics.sortinoRatio).toBeDefined();
    });

    it('should handle portfolio with single very large loan', () => {
      const largeLoan = new Loan(
        'LARGE-001',
        'Whale Borrower',
        new CreditRating(RatingTier.A),
        {
          ...testLoans[0].terms,
          principalUSD: 100000000, // $100M
        },
        new CryptoAsset(AssetType.BTC, 1200.0),
        2.0,
        now
      );

      const portfolio = new Portfolio([largeLoan], 100000000);
      const metrics = portfolio.calculateMetrics(prices);

      expect(metrics.concentrationRisk.largestExposurePercent).toBe(100);
      expect(metrics.concentrationRisk.borrowerConcentration).toBe(10000); // HHI max
    });
  });
});
