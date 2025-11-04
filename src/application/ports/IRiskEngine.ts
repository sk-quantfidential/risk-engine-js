/**
 * Risk Engine Port Interface
 *
 * Defines the contract for Monte Carlo risk simulation operations.
 * Infrastructure layer implementations must satisfy this interface.
 *
 * Clean Architecture: Application Layer defines the interface,
 * Infrastructure Layer provides the implementation (e.g., CpuRiskEngine, GpuRiskEngine).
 *
 * This port enables:
 * - Swappable risk engines (CPU, GPU, cloud-based)
 * - Testable risk calculations with mock implementations
 * - Future WebAssembly or WebGPU implementations
 */

import { Portfolio } from '@/domain/entities/Portfolio';
import { AssetType } from '@/domain/value-objects/CryptoAsset';
import type { ScenarioParameters } from './IScenarioService';

// Re-export ScenarioParameters from IScenarioService for convenience
export type { ScenarioParameters };

/**
 * Monte Carlo simulation result
 */
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
  loanDefaults: Record<string, number>;  // Loan ID -> default frequency (0 to 1)
}

/**
 * Price path simulation for visualization
 */
export interface PricePathSimulation {
  asset: AssetType;
  paths: number[][];  // [trial][timestep] - each path is array of prices over time
  timesteps: number;
  horizonDays: number;
}

/**
 * Risk Engine Port
 *
 * Provides Monte Carlo simulation capabilities for portfolio risk assessment.
 */
export interface IRiskEngine {
  /**
   * Run Monte Carlo simulation for portfolio loss under a scenario
   *
   * Simulates correlated asset price movements and defaults to estimate
   * the distribution of potential losses over a time horizon.
   *
   * @param portfolio The loan portfolio to simulate
   * @param currentPrices Current market prices for all assets
   * @param scenario Scenario parameters (volatility, shocks, correlations, etc.)
   * @param horizonDays Time horizon in days (default: 30)
   * @returns Simulation result with loss distribution and statistics
   */
  simulatePortfolioLoss(
    portfolio: Portfolio,
    currentPrices: Record<AssetType, number>,
    scenario: ScenarioParameters,
    horizonDays?: number
  ): Promise<SimulationResult>;

  /**
   * Simulate price paths for visualization
   *
   * Generates multiple simulated price paths for a single asset using
   * geometric Brownian motion. Useful for displaying Monte Carlo fan charts.
   *
   * @param asset The asset to simulate
   * @param currentPrice Current market price
   * @param horizonDays Time horizon in days
   * @param numPaths Number of paths to simulate (default: 100)
   * @returns Price path simulation with multiple trajectories
   */
  simulatePricePaths(
    asset: AssetType,
    currentPrice: number,
    horizonDays: number,
    numPaths?: number
  ): PricePathSimulation;
}
