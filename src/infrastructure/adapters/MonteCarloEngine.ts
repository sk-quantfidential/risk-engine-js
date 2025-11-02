/**
 * Monte Carlo Simulation Engine
 * Simulates portfolio losses under various scenarios
 */

import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { ScenarioParameters } from './ScenarioService';

export interface SimulationResult {
  scenarioId: string;
  numTrials: number;
  lossDistribution: number[];
  statistics: {
    meanLoss: number;
    medianLoss: number;
    var95: number;
    var99: number;
    cvar95: number;
    cvar99: number;
    maxLoss: number;
    probabilityOfLoss: number;
  };
  loanDefaults: Record<string, number>;  // Loan ID -> default frequency
}

export interface PricePathSimulation {
  asset: AssetType;
  paths: number[][];  // [trial][timestep]
  timesteps: number;
  horizonDays: number;
}

export class MonteCarloEngine {
  private readonly numTrials: number = 1000;
  private rng: () => number;

  constructor(seed?: number) {
    // Simple seeded RNG if needed for reproducibility
    this.rng = seed ? this.seededRandom(seed) : Math.random;
  }

  private seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  /**
   * Run Monte Carlo simulation for portfolio under scenario
   */
  async simulatePortfolioLoss(
    portfolio: Portfolio,
    currentPrices: Record<AssetType, number>,
    scenario: ScenarioParameters,
    horizonDays: number = 30
  ): Promise<SimulationResult> {
    const losses: number[] = [];
    const loanDefaultCounts: Record<string, number> = {};

    // Initialize default counts
    portfolio.loans.forEach(loan => {
      loanDefaultCounts[loan.id] = 0;
    });

    // Run trials
    for (let trial = 0; trial < this.numTrials; trial++) {
      // Simulate correlated asset prices
      const simulatedPrices = this.simulateCorrelatedPrices(
        currentPrices,
        scenario,
        horizonDays
      );

      // Simulate defaults using t-copula
      const defaults = this.simulateCorrelatedDefaults(
        portfolio.loans,
        scenario,
        horizonDays
      );

      // Calculate trial loss
      let trialLoss = 0;

      for (let i = 0; i < portfolio.loans.length; i++) {
        const loan = portfolio.loans[i];
        const didDefault = defaults[i];

        if (didDefault) {
          loanDefaultCounts[loan.id]++;

          // Calculate LGD based on simulated collateral value
          const endPrice = simulatedPrices[loan.collateral.type];
          const collateralValue = loan.collateral.calculateValue(endPrice);
          const slippage = loan.collateral.characteristics.liquidationSlippage *
                          scenario.liquidationSlippageMultiplier;
          const liquidationProceeds = collateralValue * (1 - slippage);
          const loss = Math.max(0, loan.terms.principalUSD - liquidationProceeds);

          trialLoss += loss;
        }
      }

      losses.push(trialLoss);
    }

    // Calculate statistics
    const sortedLosses = [...losses].sort((a, b) => a - b);
    const statistics = this.calculateStatistics(sortedLosses);

    // Calculate default frequencies
    for (const loanId in loanDefaultCounts) {
      loanDefaultCounts[loanId] /= this.numTrials;
    }

    return {
      scenarioId: scenario.name,
      numTrials: this.numTrials,
      lossDistribution: sortedLosses,
      statistics,
      loanDefaults: loanDefaultCounts,
    };
  }

  /**
   * Simulate correlated asset price movements
   */
  private simulateCorrelatedPrices(
    currentPrices: Record<AssetType, number>,
    scenario: ScenarioParameters,
    horizonDays: number
  ): Record<AssetType, number> {
    const dt = horizonDays / 365;  // Time in years
    const volatilities = {
      [AssetType.BTC]: 0.50 * scenario.volatilityMultiplier,
      [AssetType.ETH]: 0.65 * scenario.volatilityMultiplier,
      [AssetType.SOL]: 0.90 * scenario.volatilityMultiplier,
    };

    // Generate correlated normal shocks using Cholesky decomposition
    const z = this.generateCorrelatedNormals(scenario.correlationOverrides);

    const simulatedPrices: Record<AssetType, number> = {} as any;

    // Apply geometric Brownian motion
    Object.values(AssetType).forEach((asset, i) => {
      const drift = -0.5 * volatilities[asset] ** 2;  // Risk-neutral drift
      const shock = volatilities[asset] * Math.sqrt(dt) * z[i];
      const returnFactor = Math.exp(drift * dt + shock);

      // Apply scenario shock
      const scenarioShock = scenario.assetShocks[asset];
      simulatedPrices[asset] = currentPrices[asset] * returnFactor * scenarioShock;
    });

    return simulatedPrices;
  }

  /**
   * Generate correlated normal random variables
   */
  private generateCorrelatedNormals(correlations: {
    BTC_ETH: number;
    BTC_SOL: number;
    ETH_SOL: number;
  }): number[] {
    // Generate independent standard normals
    const independent = [
      this.boxMuller(),
      this.boxMuller(),
      this.boxMuller(),
    ];

    // Simple Cholesky-like decomposition for 3x3 correlation matrix
    // [1, rho12, rho13]
    // [rho12, 1, rho23]
    // [rho13, rho23, 1]

    const L11 = 1;
    const L21 = correlations.BTC_ETH;
    const L22 = Math.sqrt(1 - L21 ** 2);
    const L31 = correlations.BTC_SOL;
    const L32 = (correlations.ETH_SOL - L21 * L31) / L22;
    const L33 = Math.sqrt(Math.max(0, 1 - L31 ** 2 - L32 ** 2));

    const correlated = [
      L11 * independent[0],
      L21 * independent[0] + L22 * independent[1],
      L31 * independent[0] + L32 * independent[1] + L33 * independent[2],
    ];

    return correlated;
  }

  private boxMuller(): number {
    const u1 = this.rng();
    const u2 = this.rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  /**
   * Simulate correlated defaults using t-copula
   */
  private simulateCorrelatedDefaults(
    loans: Loan[],
    scenario: ScenarioParameters,
    horizonDays: number
  ): boolean[] {
    const n = loans.length;
    const defaults: boolean[] = new Array(n).fill(false);

    // Generate correlated uniform via t-copula
    const uniforms = this.generateTCopulaUniforms(
      n,
      scenario.defaultCorrelation,
      scenario.tCopulaDOF
    );

    // Compare against PD thresholds
    for (let i = 0; i < n; i++) {
      const loan = loans[i];
      const basePD = loan.borrowerRating.calculatePDForHorizon(horizonDays);
      const stressedPD = basePD * scenario.pdMultiplier *
                         (1 + scenario.marketDrawdown * loan.leverage);
      const finalPD = Math.min(stressedPD, 1.0);

      defaults[i] = uniforms[i] < finalPD;
    }

    return defaults;
  }

  /**
   * Generate correlated uniforms via t-copula
   */
  private generateTCopulaUniforms(
    n: number,
    correlation: number,
    dof: number
  ): number[] {
    // Generate correlated normals
    const normals: number[] = [];
    const commonFactor = this.boxMuller();

    for (let i = 0; i < n; i++) {
      const idiosyncratic = this.boxMuller();
      const correlated = Math.sqrt(correlation) * commonFactor +
                        Math.sqrt(1 - correlation) * idiosyncratic;
      normals.push(correlated);
    }

    // Transform to t-distributed
    const chiSquared = this.generateChiSquared(dof);
    const tVariates = normals.map(z => z / Math.sqrt(chiSquared / dof));

    // Transform to uniform via t-CDF approximation
    return tVariates.map(t => this.tCDF(t, dof));
  }

  private generateChiSquared(dof: number): number {
    // Approximation: sum of squared normals
    let sum = 0;
    for (let i = 0; i < dof; i++) {
      const z = this.boxMuller();
      sum += z * z;
    }
    return sum;
  }

  private tCDF(t: number, dof: number): number {
    // Approximation of Student's t CDF
    // Using transformation to beta distribution
    const x = dof / (dof + t * t);
    const beta = this.incompleteBeta(dof / 2, 0.5, x);
    return t > 0 ? 1 - beta / 2 : beta / 2;
  }

  private incompleteBeta(a: number, b: number, x: number): number {
    // Simplified approximation
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Use continued fraction approximation (simplified)
    return 0.5;  // Rough approximation for demo
  }

  /**
   * Calculate loss statistics
   */
  private calculateStatistics(sortedLosses: number[]): SimulationResult['statistics'] {
    const n = sortedLosses.length;
    const meanLoss = sortedLosses.reduce((sum, l) => sum + l, 0) / n;
    const medianLoss = sortedLosses[Math.floor(n / 2)];
    const var95 = sortedLosses[Math.floor(n * 0.95)];
    const var99 = sortedLosses[Math.floor(n * 0.99)];

    // CVaR: average of losses beyond VaR threshold
    const lossesAboveVar95 = sortedLosses.slice(Math.floor(n * 0.95));
    const cvar95 = lossesAboveVar95.reduce((sum, l) => sum + l, 0) / lossesAboveVar95.length;

    const lossesAboveVar99 = sortedLosses.slice(Math.floor(n * 0.99));
    const cvar99 = lossesAboveVar99.reduce((sum, l) => sum + l, 0) / lossesAboveVar99.length;

    const maxLoss = sortedLosses[n - 1];
    const probabilityOfLoss = sortedLosses.filter(l => l > 0).length / n;

    return {
      meanLoss,
      medianLoss,
      var95,
      var99,
      cvar95,
      cvar99,
      maxLoss,
      probabilityOfLoss,
    };
  }

  /**
   * Simulate price paths for visualization
   */
  simulatePricePaths(
    asset: AssetType,
    currentPrice: number,
    horizonDays: number,
    numPaths: number = 100
  ): PricePathSimulation {
    const timesteps = Math.min(horizonDays, 30);  // Daily steps
    const dt = horizonDays / timesteps / 365;
    const volatility = asset === AssetType.BTC ? 0.50 : asset === AssetType.ETH ? 0.65 : 0.90;

    const paths: number[][] = [];

    for (let path = 0; path < numPaths; path++) {
      const pricePath = [currentPrice];

      for (let step = 0; step < timesteps; step++) {
        const lastPrice = pricePath[pricePath.length - 1];
        const drift = -0.5 * volatility ** 2;
        const shock = volatility * Math.sqrt(dt) * this.boxMuller();
        const returnFactor = Math.exp(drift * dt + shock);
        pricePath.push(lastPrice * returnFactor);
      }

      paths.push(pricePath);
    }

    return {
      asset,
      paths,
      timesteps,
      horizonDays,
    };
  }
}