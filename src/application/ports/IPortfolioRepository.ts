/**
 * Portfolio Repository Port Interface
 *
 * Defines the contract for portfolio persistence operations.
 * Infrastructure layer implementations must satisfy this interface.
 *
 * Clean Architecture: Application Layer defines the interface,
 * Infrastructure Layer provides the implementation.
 */

import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';

export interface IPortfolioRepository {
  /**
   * Save or update a portfolio
   * @param portfolio The portfolio to persist
   */
  save(portfolio: Portfolio): void;

  /**
   * Find a portfolio by ID
   * @param id Portfolio identifier
   * @returns Portfolio if found, null otherwise
   */
  findById(id: string): Portfolio | null;

  /**
   * Get all portfolios
   * @returns Array of all portfolios
   */
  findAll(): Portfolio[];

  /**
   * Delete a portfolio by ID
   * @param id Portfolio identifier
   */
  delete(id: string): void;

  /**
   * Save or update a single loan within a portfolio
   * @param loan The loan to persist
   */
  saveLoan(loan: Loan): void;

  /**
   * Delete a loan by ID
   * @param loanId Loan identifier
   */
  deleteLoan(loanId: string): void;

  /**
   * Update the risk capital for a portfolio
   * @param portfolioId Portfolio identifier
   * @param amountUSD New risk capital amount in USD
   */
  updateRiskCapital(portfolioId: string, amountUSD: number): void;

  /**
   * Check if any portfolio data exists
   * @returns true if data exists, false otherwise
   */
  hasData(): boolean;

  /**
   * Get the timestamp of the last update
   * @returns Date of last update, or null if no data exists
   */
  getLastUpdated(): Date | null;

  /**
   * Clear all portfolio data
   */
  clearAll(): void;
}
