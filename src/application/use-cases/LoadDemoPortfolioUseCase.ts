/**
 * Load Demo Portfolio Use Case
 *
 * Generates and persists a demonstration portfolio with realistic sample data.
 * Used for:
 * - Initial user onboarding
 * - Development and testing
 * - Sales demos and presentations
 *
 * Clean Architecture Note:
 * This is a demo-specific use case that explicitly depends on Infrastructure
 * (SampleDataGenerator). This is acceptable because demo data generation is not
 * a core business requirement - it's a developer/demo convenience feature.
 * The regular LoadPortfolioUseCase remains pure and doesn't depend on Infrastructure.
 */

import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { LoadDemoPortfolioRequest, LoadDemoPortfolioResponse } from '@/application/dtos/LoadPortfolioDTOs';
import { SampleDataGenerator } from '@/infrastructure/adapters/SampleDataGenerator';

export class LoadDemoPortfolioUseCase {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository
  ) {}

  /**
   * Execute the use case
   *
   * Generates a sample portfolio and persists it to the repository.
   * This will overwrite any existing portfolios with the demo data.
   *
   * @param request LoadDemoPortfolioRequest (empty)
   * @returns LoadDemoPortfolioResponse with generated portfolio
   */
  execute(request: LoadDemoPortfolioRequest): LoadDemoPortfolioResponse {
    // Generate sample portfolio using Infrastructure adapter
    const demoPortfolio = SampleDataGenerator.generateSamplePortfolio();

    // Persist to repository
    this.portfolioRepository.save(demoPortfolio);

    return new LoadDemoPortfolioResponse(
      demoPortfolio,
      'Demo portfolio loaded with 10 loans totaling $96M across BTC, ETH, and SOL collateral'
    );
  }
}
