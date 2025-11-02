/**
 * Calculate Portfolio Risk Use Case
 *
 * Calculates comprehensive risk metrics for a portfolio given current market prices.
 *
 * Clean Architecture: Use cases orchestrate domain entities and infrastructure ports.
 * Business logic for risk calculations lives in the Portfolio domain entity.
 */

import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import {
  CalculatePortfolioRiskRequest,
  CalculatePortfolioRiskResponse
} from '@/application/dtos/CalculatePortfolioRiskDTOs';

export class CalculatePortfolioRiskUseCase {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param request CalculatePortfolioRiskRequest with portfolio ID and prices
   * @returns CalculatePortfolioRiskResponse with risk metrics
   */
  execute(request: CalculatePortfolioRiskRequest): CalculatePortfolioRiskResponse {
    // Find the portfolio
    const portfolio = this.portfolioRepository.findById(request.portfolioId);

    if (!portfolio) {
      // Try to get the first portfolio if specific ID not found
      const portfolios = this.portfolioRepository.findAll();
      if (portfolios.length === 0) {
        throw new Error('No portfolio found - cannot calculate risk metrics');
      }

      // Use the first portfolio
      const firstPortfolio = portfolios[0];
      const metrics = firstPortfolio.calculateMetrics(
        request.prices,
        request.marketDrawdown
      );

      return new CalculatePortfolioRiskResponse(metrics, true);
    }

    // Calculate metrics using domain entity method
    // This is where the business logic lives (in the domain layer)
    const metrics = portfolio.calculateMetrics(
      request.prices,
      request.marketDrawdown
    );

    return new CalculatePortfolioRiskResponse(metrics, true);
  }
}
