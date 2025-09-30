/**
 * Loan Entity
 * Core business entity representing a crypto-collateralized loan
 */

import { CryptoAsset, AssetType } from '../value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '../value-objects/CreditRating';
import { Money } from '../value-objects/Money';

export interface LoanTerms {
  principalUSD: number;
  lendingRate: number;  // Annual rate (e.g., 0.0945 for 9.45%)
  costOfCapital: number;  // Annual cost (e.g., 0.045 for 4.5%)
  tenor: number;  // Days until roll (typically 30)
  rollDate: Date;
}

export interface CollateralPosition {
  asset: CryptoAsset;
  currentPriceUSD: number;
  currentValueUSD: number;
}

export interface LoanMetrics {
  loanToValue: number;  // Current LTV ratio
  marginStatus: 'healthy' | 'warning' | 'call' | 'liquidation';
  excessCollateral: number;  // USD value above liquidation threshold
  dailyInterestUSD: number;
  expectedLossUSD: number;
  currentPD: number;  // Current probability of default
}

export class Loan {
  constructor(
    public readonly id: string,
    public readonly borrowerName: string,
    public readonly borrowerRating: CreditRating,
    public readonly terms: LoanTerms,
    public readonly collateral: CryptoAsset,
    public readonly leverage: number,  // Counterparty leverage ratio
    public readonly originationDate: Date
  ) {}

  /**
   * Calculate current loan-to-value ratio
   */
  calculateLTV(currentCollateralValueUSD: number): number {
    if (currentCollateralValueUSD === 0) return Infinity;
    return this.terms.principalUSD / currentCollateralValueUSD;
  }

  /**
   * Determine margin status based on current LTV
   */
  getMarginStatus(ltv: number): 'healthy' | 'warning' | 'call' | 'liquidation' {
    const policy = this.collateral.marginPolicy;

    if (ltv >= policy.liquidationThreshold) return 'liquidation';
    if (ltv >= policy.callThreshold) return 'call';
    if (ltv >= policy.warnThreshold) return 'warning';
    return 'healthy';
  }

  /**
   * Calculate daily interest payment
   */
  calculateDailyInterest(): number {
    return (this.terms.principalUSD * this.terms.lendingRate) / 365;
  }

  /**
   * Calculate expected loss given current market conditions
   */
  calculateExpectedLoss(
    currentCollateralValueUSD: number,
    marketDrawdown: number
  ): number {
    const stressedPD = this.borrowerRating.calculateStressedPD(marketDrawdown, this.leverage);
    const lgd = this.calculateLGD(currentCollateralValueUSD);
    const exposureAtDefault = this.terms.principalUSD;

    return exposureAtDefault * stressedPD * lgd;
  }

  /**
   * Calculate loss given default (LGD)
   * Considers collateral liquidation proceeds and slippage
   */
  private calculateLGD(currentCollateralValueUSD: number): number {
    const slippage = this.collateral.characteristics.liquidationSlippage;
    const liquidationProceeds = currentCollateralValueUSD * (1 - slippage);
    const loss = Math.max(0, this.terms.principalUSD - liquidationProceeds);
    const lgd = loss / this.terms.principalUSD;

    // Apply liquidity stress multiplier (baseline 30%, can be 2x under stress)
    const baselineLGD = 0.30;
    return Math.max(lgd, baselineLGD);
  }

  /**
   * Calculate comprehensive loan metrics
   */
  calculateMetrics(
    currentCollateralValueUSD: number,
    marketDrawdown: number = 0
  ): LoanMetrics {
    const ltv = this.calculateLTV(currentCollateralValueUSD);
    const marginStatus = this.getMarginStatus(ltv);
    const policy = this.collateral.marginPolicy;
    const liquidationThresholdValue = this.terms.principalUSD / policy.liquidationThreshold;
    const excessCollateral = currentCollateralValueUSD - liquidationThresholdValue;

    return {
      loanToValue: ltv,
      marginStatus,
      excessCollateral,
      dailyInterestUSD: this.calculateDailyInterest(),
      expectedLossUSD: this.calculateExpectedLoss(currentCollateralValueUSD, marketDrawdown),
      currentPD: this.borrowerRating.calculateStressedPD(marketDrawdown, this.leverage),
    };
  }

  /**
   * Calculate probability of margin call or liquidation within time horizon
   */
  calculateMarginEventProbability(
    currentPriceUSD: number,
    historicalVolatility: number,
    horizonDays: number,
    eventType: 'call' | 'liquidation'
  ): number {
    const policy = this.collateral.marginPolicy;
    const threshold = eventType === 'call' ? policy.callThreshold : policy.liquidationThreshold;

    // Required price drop for event
    const currentLTV = this.calculateLTV(this.collateral.calculateValue(currentPriceUSD));
    const requiredLTV = threshold;
    const requiredPriceDrop = 1 - (currentLTV / requiredLTV);

    if (requiredPriceDrop <= 0) return 1.0;  // Already at or past threshold

    // Use log-normal model for price movement
    const volatilityAdjusted = historicalVolatility * Math.sqrt(horizonDays / 365);
    const zScore = (Math.log(1 / (1 - requiredPriceDrop))) / volatilityAdjusted;

    // Approximate normal CDF for simplicity
    return this.normalCDF(-zScore);
  }

  private normalCDF(z: number): number {
    // Approximation of cumulative normal distribution
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - prob : prob;
  }

  static fromJSON(data: any): Loan {
    return new Loan(
      data.id,
      data.borrowerName,
      CreditRating.fromJSON(data.borrowerRating),
      {
        principalUSD: data.terms.principalUSD,
        lendingRate: data.terms.lendingRate,
        costOfCapital: data.terms.costOfCapital,
        tenor: data.terms.tenor,
        rollDate: new Date(data.terms.rollDate),
      },
      CryptoAsset.fromJSON(data.collateral),
      data.leverage,
      new Date(data.originationDate)
    );
  }

  toJSON() {
    return {
      id: this.id,
      borrowerName: this.borrowerName,
      borrowerRating: this.borrowerRating.toJSON(),
      terms: {
        ...this.terms,
        rollDate: this.terms.rollDate.toISOString(),
      },
      collateral: this.collateral.toJSON(),
      leverage: this.leverage,
      originationDate: this.originationDate.toISOString(),
    };
  }
}