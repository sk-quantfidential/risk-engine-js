/**
 * Load Portfolio Use Case
 *
 * Loads a portfolio from the repository, or creates a new one with sample data
 * if none exists.
 *
 * Clean Architecture: Use cases orchestrate domain entities and infrastructure ports.
 * They contain no business logic themselves - that lives in the domain layer.
 */

import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { LoadPortfolioRequest, LoadPortfolioResponse } from '@/application/dtos/LoadPortfolioDTOs';
import { SampleDataGenerator } from '@/infrastructure/adapters/SampleDataGenerator';

export class LoadPortfolioUseCase {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param request LoadPortfolioRequest (can specify portfolioId)
   * @returns LoadPortfolioResponse with portfolio or null
   */
  execute(request: LoadPortfolioRequest): LoadPortfolioResponse {
    // If a specific portfolio ID is requested, try to load it
    if (request.portfolioId) {
      const portfolio = this.portfolioRepository.findById(request.portfolioId);
      return new LoadPortfolioResponse(portfolio, false);
    }

    // Otherwise, try to load the first available portfolio
    const portfolios = this.portfolioRepository.findAll();
    if (portfolios.length > 0) {
      return new LoadPortfolioResponse(portfolios[0], false);
    }

    // No portfolio exists - create sample data
    const samplePortfolio = SampleDataGenerator.generateSamplePortfolio();
    this.portfolioRepository.save(samplePortfolio);

    return new LoadPortfolioResponse(samplePortfolio, true);
  }
}
