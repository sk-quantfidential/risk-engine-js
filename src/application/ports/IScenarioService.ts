/**
 * Scenario Service Port Interface
 *
 * Defines the contract for scenario management and stress testing operations.
 * Infrastructure layer implementations must satisfy this interface.
 *
 * Clean Architecture: Application Layer defines the interface,
 * Infrastructure Layer provides the implementation (ScenarioService).
 *
 * This port enables:
 * - Swappable scenario providers (hardcoded, database, API-based)
 * - Testable scenario analysis with mock implementations
 * - Future integration with external scenario libraries (Basel III, CCAR)
 */

import { AssetType } from '@/domain/value-objects/CryptoAsset';

/**
 * Scenario parameters for stress testing
 *
 * Defines market conditions, credit risk adjustments, and correlation structures
 * for scenario-based portfolio analysis.
 */
export interface ScenarioParameters {
  name: string;
  description: string;
  timeframe: string;

  // Market stress parameters
  marketDrawdown: number;          // Overall market stress level (0 to 1)
  volatilityMultiplier: number;    // Multiply base volatilities

  // Asset-specific shocks
  assetShocks: Record<AssetType, number>;  // Price change factors (e.g., 0.5 = -50%)

  // Correlation adjustments
  correlationOverrides: {
    BTC_ETH: number;
    BTC_SOL: number;
    ETH_SOL: number;
  };

  // Credit risk adjustments
  pdMultiplier: number;   // Multiply probability of default
  lgdMultiplier: number;  // Multiply loss given default

  // T-copula parameters for correlated defaults
  tCopulaDOF: number;          // Degrees of freedom (lower = fatter tails)
  defaultCorrelation: number;  // Correlation of default events

  // Liquidity parameters
  liquidationSlippageMultiplier: number;  // Multiply base slippage
  cureProbability: number;                // Probability borrower cures margin call (0-1)
}

/**
 * PD curve point (probability of default over time horizon)
 */
export interface PDCurvePoint {
  days: number;  // Time horizon in days
  pd: number;    // Probability of default for this horizon
}

/**
 * Scenario Service Port
 *
 * Provides scenario definitions and stress testing calculations.
 */
export interface IScenarioService {
  /**
   * Get all available scenarios
   *
   * @returns Array of all scenario parameters
   */
  getAllScenarios(): ScenarioParameters[];

  /**
   * Get specific scenario by ID
   *
   * @param scenarioId Unique scenario identifier
   * @returns Scenario parameters, or undefined if not found
   */
  getScenario(scenarioId: string): ScenarioParameters | undefined;

  /**
   * Get list of scenario IDs
   *
   * Useful for building scenario selectors in UI.
   *
   * @returns Array of scenario IDs
   */
  getScenarioIds(): string[];

  /**
   * Apply scenario shocks to current prices
   *
   * Calculates stressed asset prices by applying scenario shock factors
   * to current market prices.
   *
   * @param currentPrices Current market prices for all assets
   * @param scenario Scenario parameters with asset shock factors
   * @returns Stressed prices after applying scenario
   */
  applyScenarioPrices(
    currentPrices: Record<AssetType, number>,
    scenario: ScenarioParameters
  ): Record<AssetType, number>;

  /**
   * Calculate stressed probability of default
   *
   * Adjusts base PD using scenario multiplier and wrong-way risk modeling.
   * Wrong-way risk: PD increases when collateral value drops (market drawdown).
   *
   * @param basePD Base annual probability of default
   * @param scenario Scenario parameters with PD multiplier and drawdown
   * @param leverage Counterparty leverage ratio (amplifies wrong-way risk)
   * @returns Stressed PD (capped at 1.0)
   */
  calculateStressedPD(
    basePD: number,
    scenario: ScenarioParameters,
    leverage: number
  ): number;

  /**
   * Calculate stressed loss given default
   *
   * Adjusts base LGD using scenario multiplier to account for stressed
   * liquidation conditions and recovery rates.
   *
   * @param baseLGD Base loss given default (1 - recovery rate)
   * @param scenario Scenario parameters with LGD multiplier
   * @returns Stressed LGD (capped at 1.0)
   */
  calculateStressedLGD(
    baseLGD: number,
    scenario: ScenarioParameters
  ): number;

  /**
   * Generate probability of default curve over time horizons
   *
   * Calculates PD for multiple time horizons (1d, 3d, 5d, 7d, 14d, 30d, 60d, 90d, 180d, 365d)
   * under the given scenario, accounting for time-scaling and wrong-way risk.
   *
   * Useful for visualizing PD evolution and comparing scenarios.
   *
   * @param basePD Base annual probability of default
   * @param leverage Counterparty leverage ratio
   * @param scenario Scenario parameters for stress adjustments
   * @param maxDays Maximum time horizon (default: 365 days)
   * @returns Array of PD curve points { days, pd }
   */
  generatePDCurve(
    basePD: number,
    leverage: number,
    scenario: ScenarioParameters,
    maxDays?: number
  ): PDCurvePoint[];
}
