/**
 * Get All Scenarios Use Case
 *
 * Application Layer use-case for retrieving all available stress test scenarios.
 *
 * Clean Architecture: Application Layer orchestrates Domain and Infrastructure
 * via port interfaces (IScenarioService).
 *
 * Use Case Responsibilities:
 * - Retrieve all scenario definitions from scenario service
 * - Return scenario parameters for display in Presentation layer
 * - No business logic - pure orchestration
 *
 * Dependency Injection:
 * - Receives IScenarioService port (satisfied by ScenarioService adapter)
 * - Can be tested with mock scenario service
 */

import { IScenarioService, ScenarioParameters } from '@/application/ports/IScenarioService';

/**
 * Get All Scenarios Use Case
 *
 * Retrieves all available stress test scenarios for display in UI.
 */
export class GetAllScenariosUseCase {
  constructor(private readonly scenarioService: IScenarioService) {}

  /**
   * Execute use case
   *
   * @returns Array of all available scenario parameters
   */
  execute(): ScenarioParameters[] {
    return this.scenarioService.getAllScenarios();
  }
}
