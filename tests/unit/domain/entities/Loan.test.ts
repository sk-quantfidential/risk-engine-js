/**
 * Loan Entity Tests
 *
 * Clean Architecture Testing: Domain Layer
 * - Pure unit tests with NO mocks
 * - Tests complex business logic for crypto-collateralized loans
 * - Validates LTV, margin status, expected loss, margin event probabilities
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Loan } from '@/domain/entities/Loan';
import { CryptoAsset, AssetType } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

describe('Loan Entity', () => {
  let testLoan: Loan;
  const now = new Date('2025-01-01T00:00:00Z');
  const rollDate = new Date('2025-01-31T00:00:00Z');

  beforeEach(() => {
    testLoan = new Loan(
      'LOAN-001',
      'Test Borrower Inc',
      new CreditRating(RatingTier.A),
      {
        principalUSD: 1000000, // $1M
        lendingRate: 0.0945,    // 9.45%
        costOfCapital: 0.045,   // 4.5%
        tenor: 30,
        rollDate: rollDate,
      },
      new CryptoAsset(AssetType.BTC, 10.0), // 10 BTC
      2.0, // 2x leverage
      now
    );
  });

  describe('constructor', () => {
    it('should create loan with all properties', () => {
      expect(testLoan.id).toBe('LOAN-001');
      expect(testLoan.borrowerName).toBe('Test Borrower Inc');
      expect(testLoan.borrowerRating.tier).toBe(RatingTier.A);
      expect(testLoan.terms.principalUSD).toBe(1000000);
      expect(testLoan.collateral.type).toBe(AssetType.BTC);
      expect(testLoan.leverage).toBe(2.0);
      expect(testLoan.originationDate).toEqual(now);
    });

    it('should accept BBB borrower rating', () => {
      const loan = new Loan(
        'LOAN-002',
        'BBB Borrower',
        new CreditRating(RatingTier.BBB),
        testLoan.terms,
        testLoan.collateral,
        1.0,
        now
      );

      expect(loan.borrowerRating.tier).toBe(RatingTier.BBB);
    });

    it('should accept ETH collateral', () => {
      const loan = new Loan(
        'LOAN-003',
        'ETH Borrower',
        testLoan.borrowerRating,
        testLoan.terms,
        new CryptoAsset(AssetType.ETH, 100.0),
        1.5,
        now
      );

      expect(loan.collateral.type).toBe(AssetType.ETH);
      expect(loan.collateral.amount).toBe(100.0);
    });
  });

  describe('calculateLTV', () => {
    it('should calculate LTV correctly at 50%', () => {
      // $1M principal / $2M collateral = 50% LTV
      const collateralValue = 2000000;
      const ltv = testLoan.calculateLTV(collateralValue);

      expect(ltv).toBe(0.5);
    });

    it('should calculate LTV correctly at 70%', () => {
      // $1M / ~$1.43M ≈ 70%
      const collateralValue = 1428571;
      const ltv = testLoan.calculateLTV(collateralValue);

      expect(ltv).toBeCloseTo(0.7, 2);
    });

    it('should calculate LTV correctly at 80% (margin call threshold for BTC)', () => {
      // $1M / $1.25M = 80%
      const collateralValue = 1250000;
      const ltv = testLoan.calculateLTV(collateralValue);

      expect(ltv).toBe(0.8);
    });

    it('should calculate LTV correctly at 90% (liquidation threshold for BTC)', () => {
      // $1M / ~$1.11M ≈ 90%
      const collateralValue = 1111111;
      const ltv = testLoan.calculateLTV(collateralValue);

      expect(ltv).toBeCloseTo(0.9, 2);
    });

    it('should handle LTV > 100% (underwater)', () => {
      // $1M / $900k = 111%
      const collateralValue = 900000;
      const ltv = testLoan.calculateLTV(collateralValue);

      expect(ltv).toBeGreaterThan(1.0);
      expect(ltv).toBeCloseTo(1.111, 3);
    });

    it('should return Infinity for zero collateral value', () => {
      const ltv = testLoan.calculateLTV(0);

      expect(ltv).toBe(Infinity);
    });

    it('should handle very low LTV', () => {
      // $1M / $10M = 10%
      const collateralValue = 10000000;
      const ltv = testLoan.calculateLTV(collateralValue);

      expect(ltv).toBe(0.1);
    });
  });

  describe('getMarginStatus', () => {
    describe('BTC collateral (70/80/90 thresholds)', () => {
      it('should return healthy for LTV < 70%', () => {
        expect(testLoan.getMarginStatus(0.69)).toBe('healthy');
        expect(testLoan.getMarginStatus(0.5)).toBe('healthy');
        expect(testLoan.getMarginStatus(0.3)).toBe('healthy');
      });

      it('should return warning for 70% <= LTV < 80%', () => {
        expect(testLoan.getMarginStatus(0.70)).toBe('warning');
        expect(testLoan.getMarginStatus(0.75)).toBe('warning');
        expect(testLoan.getMarginStatus(0.79)).toBe('warning');
      });

      it('should return call for 80% <= LTV < 90%', () => {
        expect(testLoan.getMarginStatus(0.80)).toBe('call');
        expect(testLoan.getMarginStatus(0.85)).toBe('call');
        expect(testLoan.getMarginStatus(0.89)).toBe('call');
      });

      it('should return liquidation for LTV >= 90%', () => {
        expect(testLoan.getMarginStatus(0.90)).toBe('liquidation');
        expect(testLoan.getMarginStatus(0.95)).toBe('liquidation');
        expect(testLoan.getMarginStatus(1.0)).toBe('liquidation');
        expect(testLoan.getMarginStatus(1.5)).toBe('liquidation');
      });
    });

    describe('ETH collateral (65/75/85 thresholds)', () => {
      let ethLoan: Loan;

      beforeEach(() => {
        ethLoan = new Loan(
          'LOAN-ETH',
          'ETH Borrower',
          testLoan.borrowerRating,
          testLoan.terms,
          new CryptoAsset(AssetType.ETH, 250.0),
          2.0,
          now
        );
      });

      it('should return healthy for LTV < 65%', () => {
        expect(ethLoan.getMarginStatus(0.64)).toBe('healthy');
        expect(ethLoan.getMarginStatus(0.5)).toBe('healthy');
      });

      it('should return warning for 65% <= LTV < 75%', () => {
        expect(ethLoan.getMarginStatus(0.65)).toBe('warning');
        expect(ethLoan.getMarginStatus(0.70)).toBe('warning');
        expect(ethLoan.getMarginStatus(0.74)).toBe('warning');
      });

      it('should return call for 75% <= LTV < 85%', () => {
        expect(ethLoan.getMarginStatus(0.75)).toBe('call');
        expect(ethLoan.getMarginStatus(0.80)).toBe('call');
        expect(ethLoan.getMarginStatus(0.84)).toBe('call');
      });

      it('should return liquidation for LTV >= 85%', () => {
        expect(ethLoan.getMarginStatus(0.85)).toBe('liquidation');
        expect(ethLoan.getMarginStatus(0.90)).toBe('liquidation');
      });
    });

    describe('SOL collateral (60/70/80 thresholds)', () => {
      let solLoan: Loan;

      beforeEach(() => {
        solLoan = new Loan(
          'LOAN-SOL',
          'SOL Borrower',
          testLoan.borrowerRating,
          testLoan.terms,
          new CryptoAsset(AssetType.SOL, 5000.0),
          3.0,
          now
        );
      });

      it('should return healthy for LTV < 60%', () => {
        expect(solLoan.getMarginStatus(0.59)).toBe('healthy');
        expect(solLoan.getMarginStatus(0.5)).toBe('healthy');
      });

      it('should return warning for 60% <= LTV < 70%', () => {
        expect(solLoan.getMarginStatus(0.60)).toBe('warning');
        expect(solLoan.getMarginStatus(0.65)).toBe('warning');
        expect(solLoan.getMarginStatus(0.69)).toBe('warning');
      });

      it('should return call for 70% <= LTV < 80%', () => {
        expect(solLoan.getMarginStatus(0.70)).toBe('call');
        expect(solLoan.getMarginStatus(0.75)).toBe('call');
        expect(solLoan.getMarginStatus(0.79)).toBe('call');
      });

      it('should return liquidation for LTV >= 80%', () => {
        expect(solLoan.getMarginStatus(0.80)).toBe('liquidation');
        expect(solLoan.getMarginStatus(0.85)).toBe('liquidation');
      });
    });
  });

  describe('calculateDailyInterest', () => {
    it('should calculate daily interest correctly', () => {
      // $1M * 9.45% / 365 = $258.90/day
      const daily = testLoan.calculateDailyInterest();

      expect(daily).toBeCloseTo(258.90, 2);
    });

    it('should handle different principal amounts', () => {
      const smallLoan = new Loan(
        'LOAN-SMALL',
        'Small Borrower',
        testLoan.borrowerRating,
        { ...testLoan.terms, principalUSD: 100000 },
        testLoan.collateral,
        1.0,
        now
      );

      const daily = smallLoan.calculateDailyInterest();

      // $100k * 9.45% / 365 = $25.89/day
      expect(daily).toBeCloseTo(25.89, 2);
    });

    it('should handle different lending rates', () => {
      const highRateLoan = new Loan(
        'LOAN-HIGH',
        'High Rate Borrower',
        testLoan.borrowerRating,
        { ...testLoan.terms, lendingRate: 0.15 }, // 15%
        testLoan.collateral,
        1.0,
        now
      );

      const daily = highRateLoan.calculateDailyInterest();

      // $1M * 15% / 365 = $410.96/day
      expect(daily).toBeCloseTo(410.96, 2);
    });
  });

  describe('calculateExpectedLoss', () => {
    it('should calculate EL with no market stress', () => {
      const collateralValue = 2000000; // $2M (LTV = 50%)
      const marketDrawdown = 0;

      const el = testLoan.calculateExpectedLoss(collateralValue, marketDrawdown);

      // Base A rating PD = 0.8% (no stress)
      // LGD >= 30% (baseline minimum)
      // EL = $1M * 0.008 * 0.30 = $2,400
      expect(el).toBeGreaterThanOrEqual(2400);
    });

    it('should increase EL with market drawdown (wrong-way risk)', () => {
      const collateralValue = 2000000;

      const el_normal = testLoan.calculateExpectedLoss(collateralValue, 0);
      const el_stressed = testLoan.calculateExpectedLoss(collateralValue, 0.5);

      // Stressed PD should be higher, thus higher EL
      expect(el_stressed).toBeGreaterThan(el_normal);
    });

    it('should increase EL with higher leverage (wrong-way risk)', () => {
      const collateralValue = 2000000;

      const lowLeverageLoan = new Loan(
        'LOAN-LOW-LEV',
        'Low Leverage',
        testLoan.borrowerRating,
        testLoan.terms,
        testLoan.collateral,
        1.0, // 1x leverage
        now
      );

      const el_low = lowLeverageLoan.calculateExpectedLoss(collateralValue, 0.3);
      const el_high = testLoan.calculateExpectedLoss(collateralValue, 0.3); // 2x leverage

      expect(el_high).toBeGreaterThan(el_low);
    });

    it('should calculate higher EL for BBB borrower', () => {
      const bbbLoan = new Loan(
        'LOAN-BBB',
        'BBB Borrower',
        new CreditRating(RatingTier.BBB),
        testLoan.terms,
        testLoan.collateral,
        2.0,
        now
      );

      const collateralValue = 2000000;
      const marketDrawdown = 0;

      const el_bbb = bbbLoan.calculateExpectedLoss(collateralValue, marketDrawdown);
      const el_a = testLoan.calculateExpectedLoss(collateralValue, marketDrawdown);

      // BBB has higher PD (1.5% vs 0.8%)
      expect(el_bbb).toBeGreaterThan(el_a);
    });

    it('should handle underwater collateral (LTV > 100%)', () => {
      const collateralValue = 800000; // $800k (LTV = 125%)
      const marketDrawdown = 0;

      const el = testLoan.calculateExpectedLoss(collateralValue, marketDrawdown);

      // LGD should be very high since underwater
      // EL should be substantial
      expect(el).toBeGreaterThan(0);
    });
  });

  describe('calculateMetrics', () => {
    it('should return comprehensive metrics for healthy loan', () => {
      const collateralValue = 2000000; // $2M (LTV = 50%)
      const metrics = testLoan.calculateMetrics(collateralValue);

      expect(metrics.loanToValue).toBe(0.5);
      expect(metrics.marginStatus).toBe('healthy');
      expect(metrics.dailyInterestUSD).toBeCloseTo(258.90, 2);
      expect(metrics.expectedLossUSD).toBeGreaterThan(0);
      expect(metrics.currentPD).toBe(0.008); // Base A rating PD with no drawdown
      expect(metrics.excessCollateral).toBeGreaterThan(0);
    });

    it('should return metrics for loan in warning status', () => {
      const collateralValue = 1400000; // ~71% LTV
      const metrics = testLoan.calculateMetrics(collateralValue);

      expect(metrics.marginStatus).toBe('warning');
      expect(metrics.loanToValue).toBeCloseTo(0.714, 2);
    });

    it('should return metrics for loan in call status', () => {
      const collateralValue = 1200000; // ~83% LTV
      const metrics = testLoan.calculateMetrics(collateralValue);

      expect(metrics.marginStatus).toBe('call');
      expect(metrics.loanToValue).toBeCloseTo(0.833, 2);
    });

    it('should return metrics for loan in liquidation status', () => {
      const collateralValue = 1100000; // ~91% LTV
      const metrics = testLoan.calculateMetrics(collateralValue);

      expect(metrics.marginStatus).toBe('liquidation');
      expect(metrics.loanToValue).toBeCloseTo(0.909, 2);
    });

    it('should calculate excess collateral correctly', () => {
      const collateralValue = 2000000;
      const metrics = testLoan.calculateMetrics(collateralValue);

      // BTC liquidation threshold = 90%
      // Liquidation value = $1M / 0.90 = $1,111,111
      // Excess = $2M - $1,111,111 = $888,889
      expect(metrics.excessCollateral).toBeCloseTo(888889, 0);
    });

    it('should show negative excess collateral when underwater', () => {
      const collateralValue = 1000000;
      const metrics = testLoan.calculateMetrics(collateralValue);

      // Liquidation value = $1M / 0.90 = $1,111,111
      // Excess = $1M - $1,111,111 = -$111,111
      expect(metrics.excessCollateral).toBeLessThan(0);
    });

    it('should apply market drawdown stress to PD', () => {
      const collateralValue = 2000000;

      const metrics_normal = testLoan.calculateMetrics(collateralValue, 0);
      const metrics_stressed = testLoan.calculateMetrics(collateralValue, 0.5);

      expect(metrics_stressed.currentPD).toBeGreaterThan(metrics_normal.currentPD);
      expect(metrics_stressed.expectedLossUSD).toBeGreaterThan(metrics_normal.expectedLossUSD);
    });
  });

  describe('calculateMarginEventProbability', () => {
    it('should return 1.0 if already at margin call threshold', () => {
      const currentPrice = 125000; // $1M / 10 BTC / 0.80 = $125k at 80% LTV
      const volatility = 0.50;
      const horizonDays = 30;

      const prob = testLoan.calculateMarginEventProbability(
        currentPrice,
        volatility,
        horizonDays,
        'call'
      );

      expect(prob).toBe(1.0);
    });

    it('should return 1.0 if already at liquidation threshold', () => {
      const currentPrice = 111111; // $1M / 10 BTC / 0.90 = $111,111 at 90% LTV
      const volatility = 0.50;
      const horizonDays = 30;

      const prob = testLoan.calculateMarginEventProbability(
        currentPrice,
        volatility,
        horizonDays,
        'liquidation'
      );

      expect(prob).toBe(1.0);
    });

    it('should calculate probability for margin call event', () => {
      const currentPrice = 200000; // $2M / 10 BTC = LTV = 50%
      const volatility = 0.50;
      const horizonDays = 30;

      const prob = testLoan.calculateMarginEventProbability(
        currentPrice,
        volatility,
        horizonDays,
        'call'
      );

      // Should be > 0 but < 1.0
      expect(prob).toBeGreaterThan(0);
      expect(prob).toBeLessThan(1.0);
    });

    it('should calculate probability for liquidation event', () => {
      const currentPrice = 200000; // LTV = 50%
      const volatility = 0.50;
      const horizonDays = 30;

      const prob = testLoan.calculateMarginEventProbability(
        currentPrice,
        volatility,
        horizonDays,
        'liquidation'
      );

      // Should be > 0 but < 1.0
      expect(prob).toBeGreaterThan(0);
      expect(prob).toBeLessThan(1.0);
    });

    it('should show higher probability for longer horizons', () => {
      const currentPrice = 200000;
      const volatility = 0.50;

      const prob_3day = testLoan.calculateMarginEventProbability(currentPrice, volatility, 3, 'call');
      const prob_30day = testLoan.calculateMarginEventProbability(currentPrice, volatility, 30, 'call');

      expect(prob_30day).toBeGreaterThan(prob_3day);
    });

    it('should show higher probability for higher volatility', () => {
      const currentPrice = 200000;
      const horizonDays = 30;

      const prob_low = testLoan.calculateMarginEventProbability(currentPrice, 0.30, horizonDays, 'call');
      const prob_high = testLoan.calculateMarginEventProbability(currentPrice, 0.80, horizonDays, 'call');

      expect(prob_high).toBeGreaterThan(prob_low);
    });

    it('should show call probability > liquidation probability', () => {
      const currentPrice = 200000;
      const volatility = 0.50;
      const horizonDays = 30;

      const prob_call = testLoan.calculateMarginEventProbability(currentPrice, volatility, horizonDays, 'call');
      const prob_liq = testLoan.calculateMarginEventProbability(currentPrice, volatility, horizonDays, 'liquidation');

      // Margin call happens before liquidation, so higher probability
      expect(prob_call).toBeGreaterThan(prob_liq);
    });
  });

  describe('toJSON / fromJSON', () => {
    it('should serialize loan to JSON', () => {
      const json = testLoan.toJSON();

      expect(json.id).toBe('LOAN-001');
      expect(json.borrowerName).toBe('Test Borrower Inc');
      expect(json.borrowerRating.tier).toBe('A');
      expect(json.terms.principalUSD).toBe(1000000);
      expect(json.collateral.type).toBe('BTC');
      expect(json.leverage).toBe(2.0);
    });

    it('should deserialize loan from JSON', () => {
      const json = testLoan.toJSON();
      const deserialized = Loan.fromJSON(json);

      expect(deserialized.id).toBe(testLoan.id);
      expect(deserialized.borrowerName).toBe(testLoan.borrowerName);
      expect(deserialized.borrowerRating.tier).toBe(testLoan.borrowerRating.tier);
      expect(deserialized.terms.principalUSD).toBe(testLoan.terms.principalUSD);
      expect(deserialized.collateral.type).toBe(testLoan.collateral.type);
      expect(deserialized.leverage).toBe(testLoan.leverage);
    });

    it('should roundtrip through JSON', () => {
      const json = testLoan.toJSON();
      const deserialized = Loan.fromJSON(json);

      expect(deserialized.calculateLTV(2000000)).toBe(testLoan.calculateLTV(2000000));
      expect(deserialized.calculateDailyInterest()).toBe(testLoan.calculateDailyInterest());
    });

    it('should preserve dates through serialization', () => {
      const json = testLoan.toJSON();
      const deserialized = Loan.fromJSON(json);

      expect(deserialized.originationDate.getTime()).toBe(testLoan.originationDate.getTime());
      expect(deserialized.terms.rollDate.getTime()).toBe(testLoan.terms.rollDate.getTime());
    });
  });
});
