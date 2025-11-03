/**
 * Sample Data Generator
 * Creates realistic demo portfolio for initial load
 */

import { Loan } from '@/domain/entities/Loan';
import { Portfolio } from '@/domain/entities/Portfolio';
import { CryptoAsset, AssetType } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

export class SampleDataGenerator {
  /**
   * Generate sample portfolio with ~10 loans totaling ~$100M
   */
  static generateSamplePortfolio(): Portfolio {
    const loans: Loan[] = [
      // Loan 1: Large BTC-backed BBB borrower
      new Loan(
        'LOAN-001',
        'Crypto Capital Partners',
        new CreditRating(RatingTier.BBB),
        {
          principalUSD: 15_000_000,
          lendingRate: 0.0945,  // SOFR 4.5% + 4.5% spread
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(25),
        },
        new CryptoAsset(AssetType.BTC, 200),  // ~$19M at $95k
        2.5,  // Moderate leverage
        this.getPastDate(180)
      ),

      // Loan 2: Medium ETH-backed A borrower
      new Loan(
        'LOAN-002',
        'DeFi Ventures LLC',
        new CreditRating(RatingTier.A),
        {
          principalUSD: 8_000_000,
          lendingRate: 0.0895,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(18),
        },
        new CryptoAsset(AssetType.ETH, 3000),  // ~$10.2M at $3.4k
        1.8,
        this.getPastDate(120)
      ),

      // Loan 3: Small SOL-backed AA borrower
      new Loan(
        'LOAN-003',
        'Blockchain Treasury Fund',
        new CreditRating(RatingTier.AA),
        {
          principalUSD: 5_000_000,
          lendingRate: 0.0795,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(12),
        },
        new CryptoAsset(AssetType.SOL, 35000),  // ~$6.3M at $180
        1.2,
        this.getPastDate(90)
      ),

      // Loan 4: Large BTC-backed A borrower
      new Loan(
        'LOAN-004',
        'Institutional Crypto Holdings',
        new CreditRating(RatingTier.A),
        {
          principalUSD: 12_000_000,
          lendingRate: 0.0895,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(22),
        },
        new CryptoAsset(AssetType.BTC, 160),  // ~$15.2M at $95k
        2.0,
        this.getPastDate(150)
      ),

      // Loan 5: Medium BTC-backed BBB borrower (higher risk)
      new Loan(
        'LOAN-005',
        'Crypto Trading Group',
        new CreditRating(RatingTier.BBB),
        {
          principalUSD: 10_000_000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(8),
        },
        new CryptoAsset(AssetType.BTC, 120),  // ~$11.4M at $95k (tighter margin)
        3.5,  // High leverage - risky
        this.getPastDate(60)
      ),

      // Loan 6: Large ETH-backed A borrower
      new Loan(
        'LOAN-006',
        'Digital Asset Management',
        new CreditRating(RatingTier.A),
        {
          principalUSD: 11_000_000,
          lendingRate: 0.0895,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(28),
        },
        new CryptoAsset(AssetType.ETH, 4200),  // ~$14.28M at $3.4k
        1.5,
        this.getPastDate(200)
      ),

      // Loan 7: Medium SOL-backed BBB borrower
      new Loan(
        'LOAN-007',
        'Solana Investments Ltd',
        new CreditRating(RatingTier.BBB),
        {
          principalUSD: 7_000_000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(15),
        },
        new CryptoAsset(AssetType.SOL, 50000),  // ~$9M at $180
        2.8,
        this.getPastDate(45)
      ),

      // Loan 8: Small BTC-backed AA borrower (safest)
      new Loan(
        'LOAN-008',
        'Prime Digital Assets',
        new CreditRating(RatingTier.AA),
        {
          principalUSD: 6_000_000,
          lendingRate: 0.0795,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(20),
        },
        new CryptoAsset(AssetType.BTC, 90),  // ~$8.55M at $95k (comfortable)
        1.0,  // Low leverage
        this.getPastDate(240)
      ),

      // Loan 9: Large mixed ETH-backed BBB borrower
      new Loan(
        'LOAN-009',
        'Ethereum Capital Group',
        new CreditRating(RatingTier.BBB),
        {
          principalUSD: 13_000_000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(5),
        },
        new CryptoAsset(AssetType.ETH, 5000),  // ~$17M at $3.4k
        3.0,
        this.getPastDate(30)
      ),

      // Loan 10: Medium SOL-backed A borrower
      new Loan(
        'LOAN-010',
        'Layer 1 Holdings',
        new CreditRating(RatingTier.A),
        {
          principalUSD: 9_000_000,
          lendingRate: 0.0895,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: this.getFutureDate(27),
        },
        new CryptoAsset(AssetType.SOL, 65000),  // ~$11.7M at $180
        2.2,
        this.getPastDate(100)
      ),
    ];

    const riskCapital = 100_000_000;  // $100M risk capital

    return new Portfolio(loans, riskCapital);
  }

  private static getFutureDate(daysAhead: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date;
  }

  private static getPastDate(daysAgo: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  }

  /**
   * Get summary statistics for sample portfolio
   */
  static getPortfolioSummary(portfolio: Portfolio): {
    totalExposure: number;
    numLoans: number;
    ratingBreakdown: Record<RatingTier, number>;
    assetBreakdown: Record<AssetType, number>;
    avgLeverage: number;
  } {
    const totalExposure = portfolio.loans.reduce((sum, loan) => sum + loan.terms.principalUSD, 0);
    const numLoans = portfolio.loans.length;

    const ratingBreakdown: Record<RatingTier, number> = {
      [RatingTier.BBB]: 0,
      [RatingTier.A]: 0,
      [RatingTier.AA]: 0,
    };

    const assetBreakdown: Record<AssetType, number> = {
      [AssetType.BTC]: 0,
      [AssetType.ETH]: 0,
      [AssetType.SOL]: 0,
    };

    let totalLeverage = 0;

    portfolio.loans.forEach(loan => {
      ratingBreakdown[loan.borrowerRating.tier] += loan.terms.principalUSD;
      assetBreakdown[loan.collateral.type] += loan.terms.principalUSD;
      totalLeverage += loan.leverage;
    });

    return {
      totalExposure,
      numLoans,
      ratingBreakdown,
      assetBreakdown,
      avgLeverage: totalLeverage / numLoans,
    };
  }
}