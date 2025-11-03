/**
 * Load Portfolio Use Case DTOs
 *
 * Request and Response data transfer objects for loading a portfolio.
 */

import { Portfolio } from '@/domain/entities/Portfolio';

/**
 * Request to load a portfolio
 * Can specify an ID, or load the default/first portfolio
 */
export class LoadPortfolioRequest {
  constructor(
    public readonly portfolioId?: string
  ) {}
}

/**
 * Response from loading a portfolio
 */
export class LoadPortfolioResponse {
  constructor(
    public readonly portfolio: Portfolio | null,
    public readonly wasCreated: boolean = false
  ) {}

  get success(): boolean {
    return this.portfolio !== null;
  }
}

/**
 * Load Demo Portfolio DTOs
 *
 * Request and Response for loading demonstration/sample portfolio data.
 * Used for development, demos, and initial user onboarding.
 */

/**
 * Request to load a demo portfolio
 * No parameters needed - demo portfolio is deterministic
 */
export class LoadDemoPortfolioRequest {
  // Empty request - demo portfolio is deterministic
}

/**
 * Response containing the generated demo portfolio
 */
export class LoadDemoPortfolioResponse {
  constructor(
    public readonly portfolio: Portfolio,
    public readonly message: string = 'Demo portfolio loaded successfully'
  ) {}
}
