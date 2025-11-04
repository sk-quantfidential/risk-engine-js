/**
 * CPU-Based Risk Engine Adapter
 *
 * Concrete implementation of IRiskEngine using CPU-based Monte Carlo simulation.
 * This adapter wraps MonteCarloEngine and exposes it through the IRiskEngine port interface.
 *
 * Clean Architecture: Infrastructure Layer provides the implementation,
 * Application Layer defines the interface (IRiskEngine).
 *
 * This adapter enables:
 * - Swappable with future implementations (GpuRiskEngine, CloudRiskEngine)
 * - Testable via IRiskEngine mock implementations
 * - Dependency injection into application use-cases
 *
 * Implementation Details:
 * - Uses JavaScript-based Monte Carlo simulation (1000 trials)
 * - Correlated asset price movements via Cholesky decomposition
 * - Correlated defaults via t-copula modeling
 * - Runs synchronously in main thread (suitable for portfolios <100 loans)
 *
 * Future Alternatives:
 * - GpuRiskEngine: WebGPU-accelerated simulation for large portfolios
 * - WasmRiskEngine: WebAssembly for near-native performance
 * - CloudRiskEngine: Offload to serverless functions for 10,000+ trial runs
 */

import { IRiskEngine, ScenarioParameters, SimulationResult, PricePathSimulation } from '@/application/ports/IRiskEngine';
import { Portfolio } from '@/domain/entities/Portfolio';
import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { MonteCarloEngine } from './MonteCarloEngine';

/**
 * CPU-based risk engine implementation
 *
 * Wraps MonteCarloEngine to provide IRiskEngine interface compliance.
 */
export class CpuRiskEngine implements IRiskEngine {
  private readonly engine: MonteCarloEngine;

  /**
   * Create a new CPU-based risk engine
   *
   * @param seed Optional random seed for reproducible simulations (testing)
   */
  constructor(seed?: number) {
    this.engine = new MonteCarloEngine(seed);
  }

  /**
   * Run Monte Carlo simulation for portfolio loss under a scenario
   *
   * Delegates to MonteCarloEngine for CPU-based simulation.
   *
   * @param portfolio The loan portfolio to simulate
   * @param currentPrices Current market prices for all assets
   * @param scenario Scenario parameters (volatility, shocks, correlations, etc.)
   * @param horizonDays Time horizon in days (default: 30)
   * @returns Simulation result with loss distribution and statistics
   */
  async simulatePortfolioLoss(
    portfolio: Portfolio,
    currentPrices: Record<AssetType, number>,
    scenario: ScenarioParameters,
    horizonDays: number = 30
  ): Promise<SimulationResult> {
    return this.engine.simulatePortfolioLoss(portfolio, currentPrices, scenario, horizonDays);
  }

  /**
   * Simulate price paths for visualization
   *
   * Generates multiple simulated price paths for a single asset using
   * geometric Brownian motion. Useful for displaying Monte Carlo fan charts.
   *
   * Delegates to MonteCarloEngine for CPU-based path generation.
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
    numPaths: number = 100
  ): PricePathSimulation {
    return this.engine.simulatePricePaths(asset, currentPrice, horizonDays, numPaths);
  }
}
