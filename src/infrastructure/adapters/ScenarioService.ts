/**
 * Scenario Service
 * Defines realistic market scenarios for stress testing
 */

import { AssetType } from '@/domain/value-objects/CryptoAsset';

export interface ScenarioParameters {
  name: string;
  description: string;
  timeframe: string;

  // Market stress parameters
  marketDrawdown: number;  // Overall market stress level (0 to 1)
  volatilityMultiplier: number;  // Multiply base volatilities

  // Asset-specific shocks
  assetShocks: Record<AssetType, number>;  // Price change factors (e.g., 0.5 = -50%)

  // Correlation adjustments
  correlationOverrides: {
    BTC_ETH: number;
    BTC_SOL: number;
    ETH_SOL: number;
  };

  // Credit risk adjustments
  pdMultiplier: number;  // Multiply probability of default
  lgdMultiplier: number;  // Multiply loss given default

  // T-copula parameters for correlated defaults
  tCopulaDOF: number;  // Degrees of freedom (lower = fatter tails)
  defaultCorrelation: number;  // Correlation of default events

  // Liquidity parameters
  liquidationSlippageMultiplier: number;  // Multiply base slippage
  cureProbability: number;  // Probability borrower cures margin call (0-1)
}

export class ScenarioService {
  private scenarios: Map<string, ScenarioParameters> = new Map();

  constructor() {
    this.initializeScenarios();
  }

  private initializeScenarios(): void {
    // Scenario 1: Bull Market (2023 Q1)
    this.scenarios.set('bull-market', {
      name: 'Bull Market Rally',
      description: 'Strong upward momentum with improving correlations and low default risk',
      timeframe: '2023 Q1',
      marketDrawdown: 0,
      volatilityMultiplier: 0.7,
      assetShocks: {
        [AssetType.BTC]: 1.5,   // +50%
        [AssetType.ETH]: 1.6,   // +60%
        [AssetType.SOL]: 1.8,   // +80%
      },
      correlationOverrides: {
        BTC_ETH: 0.88,  // Higher correlation in bull markets
        BTC_SOL: 0.75,
        ETH_SOL: 0.82,
      },
      pdMultiplier: 0.5,  // Lower default risk in bull markets
      lgdMultiplier: 0.7,  // Better recovery in bull markets
      tCopulaDOF: 8,  // Less fat-tailed
      defaultCorrelation: 0.15,  // Low correlated defaults
      liquidationSlippageMultiplier: 0.8,  // Better liquidity
      cureProbability: 0.85,  // High cure probability
    });

    // Scenario 2: 2020 COVID Crash
    this.scenarios.set('covid-crash', {
      name: '2020 COVID Crash',
      description: 'Extreme liquidity crisis with synchronized asset collapse',
      timeframe: 'March 2020',
      marketDrawdown: 0.5,
      volatilityMultiplier: 3.0,
      assetShocks: {
        [AssetType.BTC]: 0.5,   // -50%
        [AssetType.ETH]: 0.45,  // -55%
        [AssetType.SOL]: 0.40,  // -60%
      },
      correlationOverrides: {
        BTC_ETH: 0.95,  // Flight to quality, everything moves together
        BTC_SOL: 0.88,
        ETH_SOL: 0.92,
      },
      pdMultiplier: 3.0,  // 3x default risk
      lgdMultiplier: 2.0,  // 2x loss severity
      tCopulaDOF: 3,  // Very fat tails
      defaultCorrelation: 0.65,  // High correlated defaults
      liquidationSlippageMultiplier: 2.5,  // Severe liquidity issues
      cureProbability: 0.30,  // Low cure probability
    });

    // Scenario 3: 2022 Luna/FTX Collapse
    this.scenarios.set('luna-collapse', {
      name: '2022 Luna/FTX Collapse',
      description: 'Contagion-driven crypto-specific crash with leverage unwind',
      timeframe: 'May-Nov 2022',
      marketDrawdown: 0.65,
      volatilityMultiplier: 2.5,
      assetShocks: {
        [AssetType.BTC]: 0.65,  // -35%
        [AssetType.ETH]: 0.60,  // -40%
        [AssetType.SOL]: 0.45,  // -55% (more affected by contagion)
      },
      correlationOverrides: {
        BTC_ETH: 0.92,
        BTC_SOL: 0.85,
        ETH_SOL: 0.88,
      },
      pdMultiplier: 4.0,  // Severe default risk due to contagion
      lgdMultiplier: 2.5,  // Very high losses due to leverage
      tCopulaDOF: 2.5,  // Extreme fat tails
      defaultCorrelation: 0.75,  // Very high correlated defaults
      liquidationSlippageMultiplier: 3.0,  // Extreme liquidity crisis
      cureProbability: 0.20,  // Very low cure probability
    });

    // Scenario 4: Stable Growth
    this.scenarios.set('stable-growth', {
      name: 'Stable Growth',
      description: 'Moderate growth with typical correlations and default rates',
      timeframe: 'Baseline',
      marketDrawdown: 0,
      volatilityMultiplier: 1.0,
      assetShocks: {
        [AssetType.BTC]: 1.15,  // +15%
        [AssetType.ETH]: 1.18,  // +18%
        [AssetType.SOL]: 1.22,  // +22%
      },
      correlationOverrides: {
        BTC_ETH: 0.82,
        BTC_SOL: 0.68,
        ETH_SOL: 0.75,
      },
      pdMultiplier: 1.0,  // Baseline default risk
      lgdMultiplier: 1.0,  // Baseline LGD
      tCopulaDOF: 5,  // Moderate fat tails
      defaultCorrelation: 0.30,  // Moderate correlation
      liquidationSlippageMultiplier: 1.0,
      cureProbability: 0.65,
    });

    // Scenario 5: High Volatility (No Direction)
    this.scenarios.set('high-volatility', {
      name: 'High Volatility Regime',
      description: 'Elevated volatility with mean-reverting prices but increased tail risk',
      timeframe: '2024',
      marketDrawdown: 0.15,
      volatilityMultiplier: 2.0,
      assetShocks: {
        [AssetType.BTC]: 1.05,  // +5% (mean reverting)
        [AssetType.ETH]: 1.02,  // +2%
        [AssetType.SOL]: 0.98,  // -2%
      },
      correlationOverrides: {
        BTC_ETH: 0.75,  // Lower correlations in choppy markets
        BTC_SOL: 0.58,
        ETH_SOL: 0.65,
      },
      pdMultiplier: 1.5,
      lgdMultiplier: 1.3,
      tCopulaDOF: 4,  // Fat tails
      defaultCorrelation: 0.40,
      liquidationSlippageMultiplier: 1.5,
      cureProbability: 0.50,
    });
  }

  /**
   * Get all available scenarios
   */
  getAllScenarios(): ScenarioParameters[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get specific scenario by ID
   */
  getScenario(scenarioId: string): ScenarioParameters | undefined {
    return this.scenarios.get(scenarioId);
  }

  /**
   * Get scenario IDs
   */
  getScenarioIds(): string[] {
    return Array.from(this.scenarios.keys());
  }

  /**
   * Apply scenario to current prices
   */
  applyScenarioPrices(
    currentPrices: Record<AssetType, number>,
    scenario: ScenarioParameters
  ): Record<AssetType, number> {
    const stressedPrices: Record<AssetType, number> = {
      [AssetType.BTC]: currentPrices[AssetType.BTC] * scenario.assetShocks[AssetType.BTC],
      [AssetType.ETH]: currentPrices[AssetType.ETH] * scenario.assetShocks[AssetType.ETH],
      [AssetType.SOL]: currentPrices[AssetType.SOL] * scenario.assetShocks[AssetType.SOL],
    };

    return stressedPrices;
  }

  /**
   * Calculate stressed PD for scenario
   */
  calculateStressedPD(basePD: number, scenario: ScenarioParameters, leverage: number): number {
    // Apply scenario PD multiplier and wrong-way risk
    const stressedPD = basePD * scenario.pdMultiplier * (1 + scenario.marketDrawdown * leverage);
    return Math.min(stressedPD, 1.0);
  }

  /**
   * Calculate stressed LGD for scenario
   */
  calculateStressedLGD(baseLGD: number, scenario: ScenarioParameters): number {
    const stressedLGD = baseLGD * scenario.lgdMultiplier;
    return Math.min(stressedLGD, 1.0);
  }

  /**
   * Generate PD curve for scenario (over different time horizons)
   */
  generatePDCurve(
    basePD: number,
    leverage: number,
    scenario: ScenarioParameters,
    maxDays: number = 365
  ): Array<{ days: number; pd: number }> {
    const curve: Array<{ days: number; pd: number }> = [];
    const horizons = [1, 3, 5, 7, 14, 30, 60, 90, 180, 365].filter(d => d <= maxDays);

    for (const days of horizons) {
      const timeFactor = days / 365;
      const stressedAnnualPD = this.calculateStressedPD(basePD, scenario, leverage);
      const horizonPD = stressedAnnualPD * timeFactor;
      curve.push({ days, pd: horizonPD });
    }

    return curve;
  }

  /**
   * Compare scenarios (for visualization)
   */
  compareScenarios(scenarioIds: string[]): {
    scenarios: ScenarioParameters[];
    metrics: {
      avgDrawdown: number;
      avgPDMultiplier: number;
      avgVolatilityMultiplier: number;
    };
  } {
    const scenarios = scenarioIds
      .map(id => this.getScenario(id))
      .filter(s => s !== undefined) as ScenarioParameters[];

    const avgDrawdown = scenarios.reduce((sum, s) => sum + s.marketDrawdown, 0) / scenarios.length;
    const avgPDMultiplier = scenarios.reduce((sum, s) => sum + s.pdMultiplier, 0) / scenarios.length;
    const avgVolatilityMultiplier = scenarios.reduce((sum, s) => sum + s.volatilityMultiplier, 0) / scenarios.length;

    return {
      scenarios,
      metrics: {
        avgDrawdown,
        avgPDMultiplier,
        avgVolatilityMultiplier,
      },
    };
  }

  /**
   * Create custom scenario
   */
  createCustomScenario(id: string, params: ScenarioParameters): void {
    this.scenarios.set(id, params);
  }
}