/**
 * Portfolio Entity
 * Aggregate root representing the entire loan portfolio
 */

import { Loan, LoanMetrics } from './Loan';
import { AssetType } from '../value-objects/CryptoAsset';

export interface PortfolioMetrics {
  totalExposureUSD: number;
  totalCollateralValueUSD: number;
  aggregateLTV: number;
  totalExpectedLossUSD: number;
  totalDailyRevenueUSD: number;
  valueAtRisk95: number;  // 95% VaR
  valueAtRisk99: number;  // 99% VaR
  conditionalVaR95: number;  // 95% CVaR (Expected Shortfall)
  conditionalVaR99: number;  // 99% CVaR
  sharpeRatio: number;
  sortinoRatio: number;
  concentrationRisk: ConcentrationMetrics;
}

export interface ConcentrationMetrics {
  assetConcentration: Record<AssetType, number>;  // % of total collateral value
  borrowerConcentration: number;  // Herfindahl-Hirschman Index
  largestExposurePercent: number;
}

export interface RiskContribution {
  loanId: string;
  borrowerName: string;
  marginalVaR: number;  // Incremental VaR contribution
  componentVaR: number;  // Component VaR
  percentOfPortfolioRisk: number;
}

export class Portfolio {
  constructor(
    public readonly loans: Loan[],
    public readonly riskCapitalUSD: number
  ) {}

  /**
   * Calculate aggregate portfolio metrics
   */
  calculateMetrics(
    pricesByAsset: Record<AssetType, number>,
    marketDrawdown: number = 0
  ): PortfolioMetrics {
    const loanMetrics = this.loans.map(loan => {
      const collateralValue = loan.collateral.calculateValue(pricesByAsset[loan.collateral.type]);
      return {
        loan,
        metrics: loan.calculateMetrics(collateralValue, marketDrawdown),
        collateralValue,
      };
    });

    const totalExposure = this.loans.reduce((sum, loan) => sum + loan.terms.principalUSD, 0);
    const totalCollateralValue = loanMetrics.reduce((sum, item) => sum + item.collateralValue, 0);
    const totalExpectedLoss = loanMetrics.reduce((sum, item) => sum + item.metrics.expectedLossUSD, 0);
    const totalDailyRevenue = loanMetrics.reduce((sum, item) => sum + item.metrics.dailyInterestUSD, 0);

    const aggregateLTV = totalExposure / (totalCollateralValue || 1);

    // Calculate concentration metrics
    const assetConcentration = this.calculateAssetConcentration(loanMetrics, totalCollateralValue);
    const borrowerConcentration = this.calculateBorrowerConcentration();
    const largestExposure = Math.max(...this.loans.map(l => l.terms.principalUSD));
    const largestExposurePercent = (largestExposure / totalExposure) * 100;

    // Calculate VaR/CVaR (simplified for now, will be enhanced by Monte Carlo)
    const var95 = totalExpectedLoss * 2.5;  // Rough approximation
    const var99 = totalExpectedLoss * 3.5;
    const cvar95 = var95 * 1.3;
    const cvar99 = var99 * 1.3;

    // Calculate risk-adjusted returns
    const annualRevenue = totalDailyRevenue * 365;
    const sharpe = this.calculateSharpe(annualRevenue, totalExpectedLoss, this.riskCapitalUSD);
    const sortino = this.calculateSortino(annualRevenue, totalExpectedLoss, this.riskCapitalUSD);

    return {
      totalExposureUSD: totalExposure,
      totalCollateralValueUSD: totalCollateralValue,
      aggregateLTV,
      totalExpectedLossUSD: totalExpectedLoss,
      totalDailyRevenueUSD: totalDailyRevenue,
      valueAtRisk95: var95,
      valueAtRisk99: var99,
      conditionalVaR95: cvar95,
      conditionalVaR99: cvar99,
      sharpeRatio: sharpe,
      sortinoRatio: sortino,
      concentrationRisk: {
        assetConcentration,
        borrowerConcentration,
        largestExposurePercent,
      },
    };
  }

  private calculateAssetConcentration(
    loanMetrics: any[],
    totalCollateralValue: number
  ): Record<AssetType, number> {
    const concentration: Record<AssetType, number> = {
      [AssetType.BTC]: 0,
      [AssetType.ETH]: 0,
      [AssetType.SOL]: 0,
    };

    loanMetrics.forEach(item => {
      const assetType = item.loan.collateral.type as AssetType;
      concentration[assetType] += (item.collateralValue / totalCollateralValue) * 100;
    });

    return concentration;
  }

  private calculateBorrowerConcentration(): number {
    // Herfindahl-Hirschman Index (HHI)
    // Sum of squared market shares (0 to 10,000)
    const totalExposure = this.loans.reduce((sum, loan) => sum + loan.terms.principalUSD, 0);
    const shares = this.loans.map(loan => (loan.terms.principalUSD / totalExposure) * 100);
    return shares.reduce((sum, share) => sum + share * share, 0);
  }

  private calculateSharpe(annualRevenue: number, expectedLoss: number, riskCapital: number): number {
    const expectedReturn = (annualRevenue - expectedLoss) / riskCapital;
    const riskFreeRate = 0.045;  // SOFR baseline
    const volatility = Math.sqrt(expectedLoss / riskCapital);  // Simplified
    return (expectedReturn - riskFreeRate) / (volatility || 0.01);
  }

  private calculateSortino(annualRevenue: number, expectedLoss: number, riskCapital: number): number {
    const expectedReturn = (annualRevenue - expectedLoss) / riskCapital;
    const riskFreeRate = 0.045;
    const downsideDeviation = Math.sqrt(expectedLoss / riskCapital);  // Simplified
    return (expectedReturn - riskFreeRate) / (downsideDeviation || 0.01);
  }

  /**
   * Calculate marginal risk contributions for each loan
   * Useful for portfolio optimization decisions
   */
  calculateRiskContributions(
    pricesByAsset: Record<AssetType, number>
  ): RiskContribution[] {
    const baseMetrics = this.calculateMetrics(pricesByAsset);
    const baseVaR = baseMetrics.valueAtRisk95;

    return this.loans.map(loan => {
      // Calculate portfolio metrics without this loan
      const loansWithoutCurrent = this.loans.filter(l => l.id !== loan.id);
      const portfolioWithoutLoan = new Portfolio(loansWithoutCurrent, this.riskCapitalUSD);
      const metricsWithoutLoan = portfolioWithoutLoan.calculateMetrics(pricesByAsset);

      const marginalVaR = baseVaR - metricsWithoutLoan.valueAtRisk95;
      const componentVaR = marginalVaR;  // Simplified
      const percentOfRisk = (marginalVaR / baseVaR) * 100;

      return {
        loanId: loan.id,
        borrowerName: loan.borrowerName,
        marginalVaR,
        componentVaR,
        percentOfPortfolioRisk: percentOfRisk,
      };
    });
  }

  /**
   * Get loans by margin status
   */
  getLoansByStatus(
    status: 'healthy' | 'warning' | 'call' | 'liquidation',
    pricesByAsset: Record<AssetType, number>
  ): Loan[] {
    return this.loans.filter(loan => {
      const collateralValue = loan.collateral.calculateValue(pricesByAsset[loan.collateral.type]);
      const metrics = loan.calculateMetrics(collateralValue);
      return metrics.marginStatus === status;
    });
  }

  static fromJSON(data: any): Portfolio {
    return new Portfolio(
      data.loans.map((loanData: any) => Loan.fromJSON(loanData)),
      data.riskCapitalUSD
    );
  }

  toJSON() {
    return {
      loans: this.loans.map(loan => loan.toJSON()),
      riskCapitalUSD: this.riskCapitalUSD,
    };
  }
}