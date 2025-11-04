/**
 * Simulate Portfolio Risk Use Case
 *
 * Application Layer use-case for running Monte Carlo risk simulation on a portfolio.
 *
 * Clean Architecture: Application Layer orchestrates Domain and Infrastructure
 * via port interfaces (IRiskEngine).
 *
 * Use Case Responsibilities:
 * - Orchestrate Monte Carlo simulation for portfolio under a scenario
 * - Delegate simulation to IRiskEngine port
 * - Return simulation results with loss distribution and statistics
 *
 * Business Logic:
 * - None - pure orchestration (simulation logic in IRiskEngine implementation)
 *
 * Dependency Injection:
 * - Receives IRiskEngine port (satisfied by CpuRiskEngine adapter)
 * - Can be tested with mock risk engine
 */

import { IRiskEngine, SimulationResult, ScenarioParameters } from '@/application/ports/IRiskEngine';
import { Portfolio } from '@/domain/entities/Portfolio';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

/**
 * Input DTO for simulation
 */
export interface SimulatePortfolioRiskInput {
  portfolio: Portfolio;
  currentPrices: Record<AssetType, number>;
  scenario: ScenarioParameters;
  horizonDays?: number;
}

/**
 * Simulate Portfolio Risk Use Case
 *
 * Runs Monte Carlo simulation to estimate portfolio loss distribution under a scenario.
 */
export class SimulatePortfolioRiskUseCase {
  constructor(private readonly riskEngine: IRiskEngine) {}

  /**
   * Execute use case
   *
   * Runs 1000-trial Monte Carlo simulation with:
   * - Correlated asset price movements (geometric Brownian motion)
   * - Correlated defaults (t-copula)
   * - Scenario stress factors (volatility, PD/LGD multipliers, correlations)
   *
   * @param input Simulation parameters (portfolio, prices, scenario, horizon)
   * @returns Simulation result with loss distribution and VaR/CVaR statistics
   */
  async execute(input: SimulatePortfolioRiskInput): Promise<SimulationResult> {
    const { portfolio, currentPrices, scenario, horizonDays = 30 } = input;

    return this.riskEngine.simulatePortfolioLoss(
      portfolio,
      currentPrices,
      scenario,
      horizonDays
    );
  }
}
