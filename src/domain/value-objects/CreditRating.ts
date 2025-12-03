/**
 * Credit Rating Value Object
 * Represents borrower creditworthiness with associated default probabilities
 */

export enum RatingTier {
  BBB = 'BBB',
  A = 'A',
  AA = 'AA',
}

export interface RatingMetrics {
  annualPD: number;  // Annual probability of default
  tier: RatingTier;
}

export class CreditRating {
  private static readonly BASE_PD: Record<RatingTier, number> = {
    [RatingTier.BBB]: 0.015,  // 1.5% annual PD
    [RatingTier.A]: 0.008,    // 0.8% annual PD
    [RatingTier.AA]: 0.003,   // 0.3% annual PD
  };

  constructor(public readonly tier: RatingTier) {}

  get annualPD(): number {
    return CreditRating.BASE_PD[this.tier];
  }

  get metrics(): RatingMetrics {
    return {
      annualPD: this.annualPD,
      tier: this.tier,
    };
  }

  /**
   * Calculate time-adjusted probability of default
   * @param days Number of days for horizon
   */
  calculatePDForHorizon(days: number): number {
    // Simple linear approximation: PD_t = PD_annual * (t / 365)
    return this.annualPD * (days / 365);
  }

  /**
   * Apply wrong-way risk adjustment based on market stress
   * @param marketDrawdown Current market drawdown (0 to 1)
   * @param leverage Counterparty leverage ratio
   */
  calculateStressedPD(marketDrawdown: number, leverage: number): number {
    // Piecewise linear wrong-way function
    // PD increases with drawdown and leverage
    const stressFactor = 1 + (marketDrawdown * leverage * 2);
    return Math.min(this.annualPD * stressFactor, 1.0);
  }

  static fromJSON(data: { tier: string }): CreditRating {
    return new CreditRating(data.tier as RatingTier);
  }

  toJSON() {
    return {
      tier: this.tier,
    };
  }
}