/**
 * Get Scenario Use Case
 *
 * Application Layer use-case for retrieving a specific stress test scenario.
 *
 * Clean Architecture: Application Layer orchestrates Domain and Infrastructure
 * via port interfaces (IScenarioService).
 *
 * Use Case Responsibilities:
 * - Retrieve specific scenario by ID
 * - Return scenario parameters or undefined if not found
 * - No business logic - pure orchestration
 *
 * Dependency Injection:
 * - Receives IScenarioService port (satisfied by ScenarioService adapter)
 * - Can be tested with mock scenario service
 */

import { IScenarioService, ScenarioParameters } from '@/application/ports/IScenarioService';

/**
 * Get Scenario Use Case
 *
 * Retrieves a specific stress test scenario by ID.
 */
export class GetScenarioUseCase {
  constructor(private readonly scenarioService: IScenarioService) {}

  /**
   * Execute use case
   *
   * @param scenarioId Unique scenario identifier
   * @returns Scenario parameters, or undefined if not found
   */
  execute(scenarioId: string): ScenarioParameters | undefined {
    return this.scenarioService.getScenario(scenarioId);
  }
}
