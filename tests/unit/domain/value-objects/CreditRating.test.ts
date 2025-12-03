/**
 * CreditRating Value Object Tests
 *
 * Clean Architecture Testing: Domain Layer
 * - Pure unit tests with NO mocks
 * - Tests credit risk business rules
 * - Validates PD calculations and wrong-way risk
 */

import { describe, it, expect } from '@jest/globals';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

describe('CreditRating Value Object', () => {
  describe('constructor', () => {
    it('should create BBB rating', () => {
      const rating = new CreditRating(RatingTier.BBB);

      expect(rating.tier).toBe(RatingTier.BBB);
    });

    it('should create A rating', () => {
      const rating = new CreditRating(RatingTier.A);

      expect(rating.tier).toBe(RatingTier.A);
    });

    it('should create AA rating', () => {
      const rating = new CreditRating(RatingTier.AA);

      expect(rating.tier).toBe(RatingTier.AA);
    });
  });

  describe('annualPD', () => {
    it('should return 1.5% for BBB rating', () => {
      const rating = new CreditRating(RatingTier.BBB);

      expect(rating.annualPD).toBe(0.015);
    });

    it('should return 0.8% for A rating', () => {
      const rating = new CreditRating(RatingTier.A);

      expect(rating.annualPD).toBe(0.008);
    });

    it('should return 0.3% for AA rating', () => {
      const rating = new CreditRating(RatingTier.AA);

      expect(rating.annualPD).toBe(0.003);
    });

    it('should show BBB has highest PD', () => {
      const bbb = new CreditRating(RatingTier.BBB);
      const a = new CreditRating(RatingTier.A);
      const aa = new CreditRating(RatingTier.AA);

      expect(bbb.annualPD).toBeGreaterThan(a.annualPD);
      expect(a.annualPD).toBeGreaterThan(aa.annualPD);
    });

    it('should be consistent across multiple instances', () => {
      const rating1 = new CreditRating(RatingTier.A);
      const rating2 = new CreditRating(RatingTier.A);

      expect(rating1.annualPD).toBe(rating2.annualPD);
    });
  });

  describe('metrics', () => {
    it('should return correct metrics for BBB', () => {
      const rating = new CreditRating(RatingTier.BBB);
      const metrics = rating.metrics;

      expect(metrics.tier).toBe(RatingTier.BBB);
      expect(metrics.annualPD).toBe(0.015);
    });

    it('should return correct metrics for A', () => {
      const rating = new CreditRating(RatingTier.A);
      const metrics = rating.metrics;

      expect(metrics.tier).toBe(RatingTier.A);
      expect(metrics.annualPD).toBe(0.008);
    });

    it('should return correct metrics for AA', () => {
      const rating = new CreditRating(RatingTier.AA);
      const metrics = rating.metrics;

      expect(metrics.tier).toBe(RatingTier.AA);
      expect(metrics.annualPD).toBe(0.003);
    });
  });

  describe('calculatePDForHorizon', () => {
    describe('BBB rating', () => {
      const rating = new CreditRating(RatingTier.BBB);

      it('should calculate 30-day PD', () => {
        const pd30 = rating.calculatePDForHorizon(30);

        // 1.5% annual * (30/365) ≈ 0.123%
        expect(pd30).toBeCloseTo(0.00123, 5);
      });

      it('should calculate 1-year PD', () => {
        const pd365 = rating.calculatePDForHorizon(365);

        expect(pd365).toBe(0.015);
      });

      it('should calculate 1-day PD', () => {
        const pd1 = rating.calculatePDForHorizon(1);

        // 1.5% annual * (1/365) ≈ 0.0041%
        expect(pd1).toBeCloseTo(0.000041, 6);
      });

      it('should scale linearly with time', () => {
        const pd30 = rating.calculatePDForHorizon(30);
        const pd60 = rating.calculatePDForHorizon(60);

        expect(pd60).toBeCloseTo(pd30 * 2, 5);
      });

      it('should return zero for zero days', () => {
        const pd0 = rating.calculatePDForHorizon(0);

        expect(pd0).toBe(0);
      });
    });

    describe('A rating', () => {
      const rating = new CreditRating(RatingTier.A);

      it('should calculate 30-day PD', () => {
        const pd30 = rating.calculatePDForHorizon(30);

        // 0.8% annual * (30/365) ≈ 0.0657%
        expect(pd30).toBeCloseTo(0.000657, 5);
      });

      it('should calculate 1-year PD', () => {
        const pd365 = rating.calculatePDForHorizon(365);

        expect(pd365).toBe(0.008);
      });
    });

    describe('AA rating', () => {
      const rating = new CreditRating(RatingTier.AA);

      it('should calculate 30-day PD', () => {
        const pd30 = rating.calculatePDForHorizon(30);

        // 0.3% annual * (30/365) ≈ 0.0247%
        expect(pd30).toBeCloseTo(0.000247, 6);
      });

      it('should calculate 1-year PD', () => {
        const pd365 = rating.calculatePDForHorizon(365);

        expect(pd365).toBe(0.003);
      });
    });

    describe('cross-rating comparisons', () => {
      it('should show BBB > A > AA for same horizon', () => {
        const bbb = new CreditRating(RatingTier.BBB);
        const a = new CreditRating(RatingTier.A);
        const aa = new CreditRating(RatingTier.AA);

        const pd30_bbb = bbb.calculatePDForHorizon(30);
        const pd30_a = a.calculatePDForHorizon(30);
        const pd30_aa = aa.calculatePDForHorizon(30);

        expect(pd30_bbb).toBeGreaterThan(pd30_a);
        expect(pd30_a).toBeGreaterThan(pd30_aa);
      });
    });
  });

  describe('calculateStressedPD', () => {
    describe('no stress scenario', () => {
      it('should equal base PD with no drawdown', () => {
        const rating = new CreditRating(RatingTier.BBB);
        const stressedPD = rating.calculateStressedPD(0, 1.0);

        expect(stressedPD).toBe(rating.annualPD);
      });

      it('should equal base PD with zero leverage', () => {
        const rating = new CreditRating(RatingTier.A);
        const stressedPD = rating.calculateStressedPD(0.5, 0);

        expect(stressedPD).toBe(rating.annualPD);
      });
    });

    describe('wrong-way risk effects', () => {
      it('should increase PD with market drawdown (BBB)', () => {
        const rating = new CreditRating(RatingTier.BBB);
        const leverage = 2.0;

        const normalPD = rating.annualPD;
        const stressedPD = rating.calculateStressedPD(0.5, leverage);

        // PD should increase: 1.5% * (1 + 0.5 * 2.0 * 2) = 1.5% * 3 = 4.5%
        expect(stressedPD).toBeGreaterThan(normalPD);
        expect(stressedPD).toBeCloseTo(0.045, 3);
      });

      it('should increase PD with higher leverage (A)', () => {
        const rating = new CreditRating(RatingTier.A);
        const drawdown = 0.3;

        const stressedPD_low = rating.calculateStressedPD(drawdown, 1.0);
        const stressedPD_high = rating.calculateStressedPD(drawdown, 3.0);

        expect(stressedPD_high).toBeGreaterThan(stressedPD_low);
      });

      it('should calculate stress factor correctly', () => {
        const rating = new CreditRating(RatingTier.A);
        const drawdown = 0.4;
        const leverage = 2.5;

        const stressedPD = rating.calculateStressedPD(drawdown, leverage);

        // Stress factor = 1 + (0.4 * 2.5 * 2) = 1 + 2.0 = 3.0
        // Stressed PD = 0.008 * 3.0 = 0.024
        expect(stressedPD).toBeCloseTo(0.024, 3);
      });
    });

    describe('extreme stress scenarios', () => {
      it('should cap PD at 100%', () => {
        const rating = new CreditRating(RatingTier.BBB);
        const stressedPD = rating.calculateStressedPD(1.0, 50.0);

        // Would compute: 1.5% * (1 + 1.0 * 50 * 2) = 1.5% * 101 = 151.5%, capped at 100%
        expect(stressedPD).toBeLessThanOrEqual(1.0);
        expect(stressedPD).toBe(1.0); // Should hit cap
      });

      it('should handle maximum drawdown (100%)', () => {
        const rating = new CreditRating(RatingTier.A);
        const stressedPD = rating.calculateStressedPD(1.0, 5.0);

        // 0.8% * (1 + 1.0 * 5.0 * 2) = 0.8% * 11 = 8.8%
        expect(stressedPD).toBeCloseTo(0.088, 3);
        expect(stressedPD).toBeLessThanOrEqual(1.0);
      });

      it('should handle very high leverage', () => {
        const rating = new CreditRating(RatingTier.AA);
        const stressedPD = rating.calculateStressedPD(0.5, 20.0);

        // 0.3% * (1 + 0.5 * 20 * 2) = 0.3% * 21 = 6.3%
        expect(stressedPD).toBeCloseTo(0.063, 3);
      });
    });

    describe('cross-rating stress comparisons', () => {
      it('should show BBB stressed PD > A stressed PD', () => {
        const bbb = new CreditRating(RatingTier.BBB);
        const a = new CreditRating(RatingTier.A);

        const drawdown = 0.4;
        const leverage = 2.0;

        const stressedPD_bbb = bbb.calculateStressedPD(drawdown, leverage);
        const stressedPD_a = a.calculateStressedPD(drawdown, leverage);

        expect(stressedPD_bbb).toBeGreaterThan(stressedPD_a);
      });

      it('should maintain rating order under stress', () => {
        const bbb = new CreditRating(RatingTier.BBB);
        const a = new CreditRating(RatingTier.A);
        const aa = new CreditRating(RatingTier.AA);

        const drawdown = 0.5;
        const leverage = 3.0;

        const pd_bbb = bbb.calculateStressedPD(drawdown, leverage);
        const pd_a = a.calculateStressedPD(drawdown, leverage);
        const pd_aa = aa.calculateStressedPD(drawdown, leverage);

        expect(pd_bbb).toBeGreaterThan(pd_a);
        expect(pd_a).toBeGreaterThan(pd_aa);
      });
    });
  });

  describe('fromJSON', () => {
    it('should deserialize BBB rating', () => {
      const json = { tier: 'BBB' };
      const rating = CreditRating.fromJSON(json);

      expect(rating.tier).toBe(RatingTier.BBB);
      expect(rating.annualPD).toBe(0.015);
    });

    it('should deserialize A rating', () => {
      const json = { tier: 'A' };
      const rating = CreditRating.fromJSON(json);

      expect(rating.tier).toBe(RatingTier.A);
      expect(rating.annualPD).toBe(0.008);
    });

    it('should deserialize AA rating', () => {
      const json = { tier: 'AA' };
      const rating = CreditRating.fromJSON(json);

      expect(rating.tier).toBe(RatingTier.AA);
      expect(rating.annualPD).toBe(0.003);
    });
  });

  describe('toJSON', () => {
    it('should serialize BBB rating', () => {
      const rating = new CreditRating(RatingTier.BBB);
      const json = rating.toJSON();

      expect(json).toEqual({ tier: 'BBB' });
    });

    it('should serialize A rating', () => {
      const rating = new CreditRating(RatingTier.A);
      const json = rating.toJSON();

      expect(json).toEqual({ tier: 'A' });
    });

    it('should serialize AA rating', () => {
      const rating = new CreditRating(RatingTier.AA);
      const json = rating.toJSON();

      expect(json).toEqual({ tier: 'AA' });
    });

    it('should roundtrip through JSON', () => {
      const original = new CreditRating(RatingTier.A);
      const json = original.toJSON();
      const deserialized = CreditRating.fromJSON(json);

      expect(deserialized.tier).toBe(original.tier);
      expect(deserialized.annualPD).toBe(original.annualPD);
    });
  });

  describe('RatingTier enum', () => {
    it('should have BBB tier', () => {
      expect(RatingTier.BBB).toBe('BBB');
    });

    it('should have A tier', () => {
      expect(RatingTier.A).toBe('A');
    });

    it('should have AA tier', () => {
      expect(RatingTier.AA).toBe('AA');
    });

    it('should have exactly 3 rating tiers', () => {
      const tiers = Object.values(RatingTier);
      expect(tiers).toHaveLength(3);
    });
  });
});
