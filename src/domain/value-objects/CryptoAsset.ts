/**
 * Crypto Asset Value Object
 * Represents supported collateral asset types with their market characteristics
 */

export enum AssetType {
  BTC = 'BTC',
  ETH = 'ETH',
  SOL = 'SOL',
}

export interface MarginPolicy {
  warnThreshold: number;  // e.g., 70% for BTC
  callThreshold: number;  // e.g., 80% for BTC
  liquidationThreshold: number;  // e.g., 90% for BTC
}

export interface AssetCharacteristics {
  liquidationSlippage: number;  // Expected slippage on forced liquidation (%)
  volatilityMultiplier: number;  // Base volatility scaling factor
}

export class CryptoAsset {
  private static readonly MARGIN_POLICIES: Record<AssetType, MarginPolicy> = {
    [AssetType.BTC]: { warnThreshold: 0.70, callThreshold: 0.80, liquidationThreshold: 0.90 },
    [AssetType.ETH]: { warnThreshold: 0.65, callThreshold: 0.75, liquidationThreshold: 0.85 },
    [AssetType.SOL]: { warnThreshold: 0.60, callThreshold: 0.70, liquidationThreshold: 0.80 },
  };

  private static readonly CHARACTERISTICS: Record<AssetType, AssetCharacteristics> = {
    [AssetType.BTC]: { liquidationSlippage: 0.04, volatilityMultiplier: 1.0 },
    [AssetType.ETH]: { liquidationSlippage: 0.07, volatilityMultiplier: 1.3 },
    [AssetType.SOL]: { liquidationSlippage: 0.10, volatilityMultiplier: 1.8 },
  };

  constructor(
    public readonly type: AssetType,
    public readonly amount: number
  ) {
    if (amount < 0) {
      throw new Error('Asset amount must be non-negative');
    }
  }

  get marginPolicy(): MarginPolicy {
    return CryptoAsset.MARGIN_POLICIES[this.type];
  }

  get characteristics(): AssetCharacteristics {
    return CryptoAsset.CHARACTERISTICS[this.type];
  }

  calculateValue(priceUSD: number): number {
    return this.amount * priceUSD;
  }

  static fromJSON(data: { type: string; amount: number }): CryptoAsset {
    return new CryptoAsset(data.type as AssetType, data.amount);
  }

  toJSON() {
    return {
      type: this.type,
      amount: this.amount,
    };
  }
}