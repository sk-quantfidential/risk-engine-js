/**
 * Delete Loan Use Case
 *
 * Removes a loan from the portfolio.
 *
 * Clean Architecture: Use cases orchestrate domain entities and infrastructure ports.
 * They contain no business logic themselves - that lives in the domain layer.
 */

import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { DeleteLoanRequest, DeleteLoanResponse } from '@/application/dtos/DeleteLoanDTOs';
import { Portfolio } from '@/domain/entities/Portfolio';

export class DeleteLoanUseCase {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param request DeleteLoanRequest with loan ID to delete
   * @returns DeleteLoanResponse with updated portfolio
   */
  execute(request: DeleteLoanRequest): DeleteLoanResponse {
    // Load the current portfolio
    const portfolios = this.portfolioRepository.findAll();
    if (portfolios.length === 0) {
      return new DeleteLoanResponse(
        null,
        false,
        'No portfolio found - cannot delete loan'
      );
    }

    const currentPortfolio = portfolios[0];

    // Filter out the loan to delete
    const updatedLoans = currentPortfolio.loans.filter(
      loan => loan.id !== request.loanId
    );

    // Check if loan was actually found and deleted
    if (updatedLoans.length === currentPortfolio.loans.length) {
      return new DeleteLoanResponse(
        currentPortfolio,
        false,
        `Loan with ID ${request.loanId} not found`
      );
    }

    // Create new portfolio without the deleted loan
    const updatedPortfolio = new Portfolio(
      updatedLoans,
      currentPortfolio.riskCapitalUSD
    );

    // Persist the updated portfolio
    this.portfolioRepository.save(updatedPortfolio);

    return new DeleteLoanResponse(updatedPortfolio, true);
  }
}
