/**
 * Update Loan Use Case
 *
 * Updates an existing loan in the portfolio, or adds a new loan if it doesn't exist.
 *
 * Clean Architecture: Use cases orchestrate domain entities and infrastructure ports.
 * They contain no business logic themselves - that lives in the domain layer.
 */

import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { UpdateLoanRequest, UpdateLoanResponse } from '@/application/dtos/UpdateLoanDTOs';
import { Portfolio } from '@/domain/entities/Portfolio';

export class UpdateLoanUseCase {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param request UpdateLoanRequest with the loan to update
   * @returns UpdateLoanResponse with updated portfolio
   */
  execute(request: UpdateLoanRequest): UpdateLoanResponse {
    // Load the current portfolio
    const portfolios = this.portfolioRepository.findAll();
    if (portfolios.length === 0) {
      return new UpdateLoanResponse(
        null,
        false,
        'No portfolio found - cannot update loan'
      );
    }

    const currentPortfolio = portfolios[0];

    // Find if the loan already exists
    const existingLoanIndex = currentPortfolio.loans.findIndex(
      loan => loan.id === request.loan.id
    );

    // Create updated loans array
    let updatedLoans;
    if (existingLoanIndex >= 0) {
      // Update existing loan
      updatedLoans = [...currentPortfolio.loans];
      updatedLoans[existingLoanIndex] = request.loan;
    } else {
      // Add new loan
      updatedLoans = [...currentPortfolio.loans, request.loan];
    }

    // Create new portfolio with updated loans
    const updatedPortfolio = new Portfolio(
      updatedLoans,
      currentPortfolio.riskCapitalUSD
    );

    // Persist the updated portfolio
    this.portfolioRepository.save(updatedPortfolio);

    return new UpdateLoanResponse(updatedPortfolio, true);
  }
}
