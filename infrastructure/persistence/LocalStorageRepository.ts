/**
 * LocalStorage Repository
 * Handles persistence of loans and portfolio data in browser storage
 */

import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';

const STORAGE_KEYS = {
  PORTFOLIO: 'risk-engine:portfolio',
  LOANS: 'risk-engine:loans',
  RISK_CAPITAL: 'risk-engine:risk-capital',
  LAST_UPDATED: 'risk-engine:last-updated',
};

export class LocalStorageRepository {
  /**
   * Save portfolio to localStorage
   */
  savePortfolio(portfolio: Portfolio): void {
    try {
      const portfolioData = portfolio.toJSON();
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolioData));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      throw new Error('Failed to persist portfolio data');
    }
  }

  /**
   * Load portfolio from localStorage
   */
  loadPortfolio(): Portfolio | null {
    try {
      const portfolioJson = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      if (!portfolioJson) return null;

      const portfolioData = JSON.parse(portfolioJson);
      return Portfolio.fromJSON(portfolioData);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      return null;
    }
  }

  /**
   * Save individual loan
   */
  saveLoan(loan: Loan): void {
    try {
      const portfolio = this.loadPortfolio();
      if (!portfolio) {
        throw new Error('No portfolio found');
      }

      // Check if loan exists
      const existingIndex = portfolio.loans.findIndex(l => l.id === loan.id);

      let updatedLoans: Loan[];
      if (existingIndex >= 0) {
        // Update existing loan
        updatedLoans = [...portfolio.loans];
        updatedLoans[existingIndex] = loan;
      } else {
        // Add new loan
        updatedLoans = [...portfolio.loans, loan];
      }

      const updatedPortfolio = new Portfolio(updatedLoans, portfolio.riskCapitalUSD);
      this.savePortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Failed to save loan:', error);
      throw new Error('Failed to persist loan data');
    }
  }

  /**
   * Delete loan
   */
  deleteLoan(loanId: string): void {
    try {
      const portfolio = this.loadPortfolio();
      if (!portfolio) {
        throw new Error('No portfolio found');
      }

      const updatedLoans = portfolio.loans.filter(l => l.id !== loanId);
      const updatedPortfolio = new Portfolio(updatedLoans, portfolio.riskCapitalUSD);
      this.savePortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Failed to delete loan:', error);
      throw new Error('Failed to delete loan');
    }
  }

  /**
   * Get loan by ID
   */
  getLoan(loanId: string): Loan | null {
    const portfolio = this.loadPortfolio();
    if (!portfolio) return null;

    return portfolio.loans.find(l => l.id === loanId) || null;
  }

  /**
   * Get all loans
   */
  getAllLoans(): Loan[] {
    const portfolio = this.loadPortfolio();
    return portfolio?.loans || [];
  }

  /**
   * Update risk capital
   */
  updateRiskCapital(amountUSD: number): void {
    try {
      const portfolio = this.loadPortfolio();
      if (!portfolio) {
        // Create new portfolio with zero loans
        const newPortfolio = new Portfolio([], amountUSD);
        this.savePortfolio(newPortfolio);
        return;
      }

      const updatedPortfolio = new Portfolio(portfolio.loans, amountUSD);
      this.savePortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Failed to update risk capital:', error);
      throw new Error('Failed to update risk capital');
    }
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Get last updated timestamp
   */
  getLastUpdated(): Date | null {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
    return timestamp ? new Date(timestamp) : null;
  }

  /**
   * Check if data exists
   */
  hasData(): boolean {
    return localStorage.getItem(STORAGE_KEYS.PORTFOLIO) !== null;
  }
}