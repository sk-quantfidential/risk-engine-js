/**
 * Load Portfolio Use Case
 *
 * Loads a portfolio from the repository.
 * Returns null if no portfolio exists - the caller (Presentation layer) decides
 * whether to load demo data, show an empty state, or prompt for portfolio creation.
 *
 * Clean Architecture: Use cases orchestrate domain entities and infrastructure ports.
 * They contain no business logic themselves - that lives in the domain layer.
 * This use case has NO dependencies on Infrastructure adapters.
 */

import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { LoadPortfolioRequest, LoadPortfolioResponse } from '@/application/dtos/LoadPortfolioDTOs';

export class LoadPortfolioUseCase {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param request LoadPortfolioRequest (can specify portfolioId)
   * @returns LoadPortfolioResponse with portfolio or null if none exists
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

    // No portfolio exists - return null
    // Caller decides whether to load demo data or show empty state
    return new LoadPortfolioResponse(null, false);
  }
}
