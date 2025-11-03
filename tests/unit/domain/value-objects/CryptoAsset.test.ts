/**
 * CryptoAsset Value Object Tests
 *
 * Clean Architecture Testing: Domain Layer
 * - Pure unit tests with NO mocks
 * - Tests business rules for collateral assets
 * - Validates margin policies and risk characteristics
 */

import { describe, it, expect } from '@jest/globals';
import { CryptoAsset, AssetType } from '@/domain/value-objects/CryptoAsset';

describe('CryptoAsset Value Object', () => {
  describe('constructor', () => {
    it('should create BTC asset with valid amount', () => {
      const asset = new CryptoAsset(AssetType.BTC, 1.5);

      expect(asset.type).toBe(AssetType.BTC);
      expect(asset.amount).toBe(1.5);
    });

    it('should create ETH asset with valid amount', () => {
      const asset = new CryptoAsset(AssetType.ETH, 10.0);

      expect(asset.type).toBe(AssetType.ETH);
      expect(asset.amount).toBe(10.0);
    });

    it('should create SOL asset with valid amount', () => {
      const asset = new CryptoAsset(AssetType.SOL, 500.0);

      expect(asset.type).toBe(AssetType.SOL);
      expect(asset.amount).toBe(500.0);
    });

    it('should create asset with zero amount', () => {
      const asset = new CryptoAsset(AssetType.BTC, 0);

      expect(asset.amount).toBe(0);
    });

    it('should throw error for negative amount', () => {
      expect(() => new CryptoAsset(AssetType.BTC, -1)).toThrow(
        'Asset amount must be non-negative'
      );
    });

    it('should handle decimal amounts', () => {
      const asset = new CryptoAsset(AssetType.BTC, 0.00123456);

      expect(asset.amount).toBe(0.00123456);
    });
  });

  describe('marginPolicy', () => {
    describe('BTC margin policy', () => {
      it('should have correct margin thresholds', () => {
        const asset = new CryptoAsset(AssetType.BTC, 1.0);
        const policy = asset.marginPolicy;

        expect(policy.warnThreshold).toBe(0.70);
        expect(policy.callThreshold).toBe(0.80);
        expect(policy.liquidationThreshold).toBe(0.90);
      });

      it('should be consistent across multiple BTC assets', () => {
        const asset1 = new CryptoAsset(AssetType.BTC, 1.0);
        const asset2 = new CryptoAsset(AssetType.BTC, 5.0);

        expect(asset1.marginPolicy).toEqual(asset2.marginPolicy);
      });
    });

    describe('ETH margin policy', () => {
      it('should have correct margin thresholds', () => {
        const asset = new CryptoAsset(AssetType.ETH, 10.0);
        const policy = asset.marginPolicy;

        expect(policy.warnThreshold).toBe(0.65);
        expect(policy.callThreshold).toBe(0.75);
        expect(policy.liquidationThreshold).toBe(0.85);
      });

      it('should have stricter thresholds than BTC', () => {
        const btc = new CryptoAsset(AssetType.BTC, 1.0);
        const eth = new CryptoAsset(AssetType.ETH, 10.0);

        expect(eth.marginPolicy.warnThreshold).toBeLessThan(btc.marginPolicy.warnThreshold);
        expect(eth.marginPolicy.callThreshold).toBeLessThan(btc.marginPolicy.callThreshold);
        expect(eth.marginPolicy.liquidationThreshold).toBeLessThan(btc.marginPolicy.liquidationThreshold);
      });
    });

    describe('SOL margin policy', () => {
      it('should have correct margin thresholds', () => {
        const asset = new CryptoAsset(AssetType.SOL, 500.0);
        const policy = asset.marginPolicy;

        expect(policy.warnThreshold).toBe(0.60);
        expect(policy.callThreshold).toBe(0.70);
        expect(policy.liquidationThreshold).toBe(0.80);
      });

      it('should have strictest thresholds', () => {
        const btc = new CryptoAsset(AssetType.BTC, 1.0);
        const eth = new CryptoAsset(AssetType.ETH, 10.0);
        const sol = new CryptoAsset(AssetType.SOL, 500.0);

        expect(sol.marginPolicy.warnThreshold).toBeLessThan(eth.marginPolicy.warnThreshold);
        expect(sol.marginPolicy.warnThreshold).toBeLessThan(btc.marginPolicy.warnThreshold);
      });
    });
  });

  describe('characteristics', () => {
    describe('BTC characteristics', () => {
      it('should have lowest liquidation slippage', () => {
        const asset = new CryptoAsset(AssetType.BTC, 1.0);
        const chars = asset.characteristics;

        expect(chars.liquidationSlippage).toBe(0.04); // 4%
        expect(chars.volatilityMultiplier).toBe(1.0);
      });
    });

    describe('ETH characteristics', () => {
      it('should have moderate liquidation slippage', () => {
        const asset = new CryptoAsset(AssetType.ETH, 10.0);
        const chars = asset.characteristics;

        expect(chars.liquidationSlippage).toBe(0.07); // 7%
        expect(chars.volatilityMultiplier).toBe(1.3);
      });

      it('should have higher slippage than BTC', () => {
        const btc = new CryptoAsset(AssetType.BTC, 1.0);
        const eth = new CryptoAsset(AssetType.ETH, 10.0);

        expect(eth.characteristics.liquidationSlippage).toBeGreaterThan(
          btc.characteristics.liquidationSlippage
        );
      });
    });

    describe('SOL characteristics', () => {
      it('should have highest liquidation slippage', () => {
        const asset = new CryptoAsset(AssetType.SOL, 500.0);
        const chars = asset.characteristics;

        expect(chars.liquidationSlippage).toBe(0.10); // 10%
        expect(chars.volatilityMultiplier).toBe(1.8);
      });

      it('should have highest volatility multiplier', () => {
        const btc = new CryptoAsset(AssetType.BTC, 1.0);
        const eth = new CryptoAsset(AssetType.ETH, 10.0);
        const sol = new CryptoAsset(AssetType.SOL, 500.0);

        expect(sol.characteristics.volatilityMultiplier).toBeGreaterThan(
          eth.characteristics.volatilityMultiplier
        );
        expect(sol.characteristics.volatilityMultiplier).toBeGreaterThan(
          btc.characteristics.volatilityMultiplier
        );
      });
    });
  });

  describe('calculateValue', () => {
    it('should calculate BTC value correctly', () => {
      const asset = new CryptoAsset(AssetType.BTC, 1.5);
      const price = 100000; // $100k per BTC

      expect(asset.calculateValue(price)).toBe(150000);
    });

    it('should calculate ETH value correctly', () => {
      const asset = new CryptoAsset(AssetType.ETH, 10.0);
      const price = 4000; // $4k per ETH

      expect(asset.calculateValue(price)).toBe(40000);
    });

    it('should calculate SOL value correctly', () => {
      const asset = new CryptoAsset(AssetType.SOL, 500.0);
      const price = 200; // $200 per SOL

      expect(asset.calculateValue(price)).toBe(100000);
    });

    it('should return zero for zero amount', () => {
      const asset = new CryptoAsset(AssetType.BTC, 0);
      const price = 100000;

      expect(asset.calculateValue(price)).toBe(0);
    });

    it('should return zero for zero price', () => {
      const asset = new CryptoAsset(AssetType.BTC, 1.5);
      const price = 0;

      expect(asset.calculateValue(price)).toBe(0);
    });

    it('should handle decimal amounts and prices', () => {
      const asset = new CryptoAsset(AssetType.BTC, 0.00123456);
      const price = 95432.10;

      expect(asset.calculateValue(price)).toBeCloseTo(117.82, 2);
    });

    it('should scale linearly with amount', () => {
      const asset1 = new CryptoAsset(AssetType.BTC, 1.0);
      const asset2 = new CryptoAsset(AssetType.BTC, 2.0);
      const price = 100000;

      expect(asset2.calculateValue(price)).toBe(asset1.calculateValue(price) * 2);
    });

    it('should handle large amounts', () => {
      const asset = new CryptoAsset(AssetType.BTC, 1000.0);
      const price = 100000;

      expect(asset.calculateValue(price)).toBe(100000000); // $100M
    });
  });

  describe('fromJSON', () => {
    it('should deserialize BTC asset', () => {
      const json = { type: 'BTC', amount: 1.5 };
      const asset = CryptoAsset.fromJSON(json);

      expect(asset.type).toBe(AssetType.BTC);
      expect(asset.amount).toBe(1.5);
    });

    it('should deserialize ETH asset', () => {
      const json = { type: 'ETH', amount: 10.0 };
      const asset = CryptoAsset.fromJSON(json);

      expect(asset.type).toBe(AssetType.ETH);
      expect(asset.amount).toBe(10.0);
    });

    it('should deserialize SOL asset', () => {
      const json = { type: 'SOL', amount: 500.0 };
      const asset = CryptoAsset.fromJSON(json);

      expect(asset.type).toBe(AssetType.SOL);
      expect(asset.amount).toBe(500.0);
    });

    it('should preserve margin policy after deserialization', () => {
      const json = { type: 'BTC', amount: 1.0 };
      const asset = CryptoAsset.fromJSON(json);

      expect(asset.marginPolicy.warnThreshold).toBe(0.70);
    });
  });

  describe('toJSON', () => {
    it('should serialize BTC asset', () => {
      const asset = new CryptoAsset(AssetType.BTC, 1.5);
      const json = asset.toJSON();

      expect(json).toEqual({
        type: 'BTC',
        amount: 1.5,
      });
    });

    it('should serialize ETH asset', () => {
      const asset = new CryptoAsset(AssetType.ETH, 10.0);
      const json = asset.toJSON();

      expect(json).toEqual({
        type: 'ETH',
        amount: 10.0,
      });
    });

    it('should serialize SOL asset', () => {
      const asset = new CryptoAsset(AssetType.SOL, 500.0);
      const json = asset.toJSON();

      expect(json).toEqual({
        type: 'SOL',
        amount: 500.0,
      });
    });

    it('should roundtrip through JSON', () => {
      const original = new CryptoAsset(AssetType.BTC, 1.5);
      const json = original.toJSON();
      const deserialized = CryptoAsset.fromJSON(json);

      expect(deserialized.type).toBe(original.type);
      expect(deserialized.amount).toBe(original.amount);
    });
  });

  describe('AssetType enum', () => {
    it('should have BTC type', () => {
      expect(AssetType.BTC).toBe('BTC');
    });

    it('should have ETH type', () => {
      expect(AssetType.ETH).toBe('ETH');
    });

    it('should have SOL type', () => {
      expect(AssetType.SOL).toBe('SOL');
    });

    it('should have exactly 3 asset types', () => {
      const types = Object.values(AssetType);
      expect(types).toHaveLength(3);
    });
  });
});
