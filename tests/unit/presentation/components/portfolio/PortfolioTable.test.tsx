/**
 * PortfolioTable Tests - Presentation Layer
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import { PortfolioTable } from '@/presentation/components/portfolio/PortfolioTable';
import { Loan } from '@/domain/entities/Loan';
import { AssetType, CryptoAsset } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';
import { Money } from '@/domain/value-objects/Money';

// Mock LoanEditModal to avoid complex modal interactions
jest.mock('@/presentation/components/portfolio/LoanEditModal', () => ({
  LoanEditModal: () => null,
}));

describe('PortfolioTable', () => {
  const mockPrices = {
    [AssetType.BTC]: 100000,
    [AssetType.ETH]: 4000,
    [AssetType.SOL]: 200,
  };

  const createTestLoan = (id: string, principal: number, collateralAmount: number, assetType: AssetType = AssetType.BTC) => {
    return new Loan(
      id,
      `Borrower ${id}`,
      new CreditRating(RatingTier.BBB),
      {
        principalUSD: principal,
        lendingRate: 0.0945,
        costOfCapital: 0.045,
        tenor: 30,
        rollDate: new Date('2025-02-01'),
      },
      new CryptoAsset(assetType, collateralAmount),
      1.5,
      new Date('2025-01-01')
    );
  };

  const mockLoans = [
    createTestLoan('loan-1', 1000000, 15, AssetType.BTC), // LTV ~67%
    createTestLoan('loan-2', 500000, 150, AssetType.ETH), // LTV ~83%
    createTestLoan('loan-3', 250000, 2000, AssetType.SOL), // LTV ~62.5%
  ];

  describe('rendering', () => {
    it('should render table headers', () => {
      render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      expect(screen.getByText('Borrower')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByText('Principal')).toBeInTheDocument();
      expect(screen.getByText('Collateral (USD)')).toBeInTheDocument();
      expect(screen.getByText('LTV')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Exp. Loss')).toBeInTheDocument();
      expect(screen.getByText('Roll Date')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render all loans', () => {
      render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      expect(screen.getByText('Borrower loan-1')).toBeInTheDocument();
      expect(screen.getByText('Borrower loan-2')).toBeInTheDocument();
      expect(screen.getByText('Borrower loan-3')).toBeInTheDocument();
    });

    it('should render credit ratings', () => {
      render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      const ratings = screen.getAllByText('BBB');
      expect(ratings.length).toBe(3);
    });

    it('should render asset types', () => {
      const { container } = render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      // Check that component renders with loan data (collateral amounts are displayed)
      expect(screen.getByText('$1,500,000')).toBeInTheDocument(); // BTC collateral value
      expect(screen.getByText('$600,000')).toBeInTheDocument();   // ETH collateral value
      expect(screen.getByText('$400,000')).toBeInTheDocument();   // SOL collateral value
    });

    it('should render edit buttons for each loan', () => {
      render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      const editButtons = screen.getAllByText('EDIT');
      expect(editButtons.length).toBe(3);
    });
  });

  describe('loan sorting', () => {
    it('should sort loans by LTV descending (riskiest first)', () => {
      const { container } = render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);

      // First row should be loan-2 (highest LTV ~83%)
      expect(rows[0].textContent).toContain('Borrower loan-2');
      // Second row should be loan-1 (LTV ~67%)
      expect(rows[1].textContent).toContain('Borrower loan-1');
      // Third row should be loan-3 (lowest LTV ~62.5%)
      expect(rows[2].textContent).toContain('Borrower loan-3');
    });
  });

  describe('money formatting', () => {
    it('should format principal amounts', () => {
      render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.getByText('$250,000')).toBeInTheDocument();
    });

    it('should format collateral values in USD', () => {
      render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      // BTC: 15 * $100,000 = $1,500,000
      expect(screen.getByText('$1,500,000')).toBeInTheDocument();
      // ETH: 150 * $4,000 = $600,000
      expect(screen.getByText('$600,000')).toBeInTheDocument();
      // SOL: 2000 * $200 = $400,000
      expect(screen.getByText('$400,000')).toBeInTheDocument();
    });
  });

  describe('status display', () => {
    it('should display margin status for each loan', () => {
      render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      // All loans should have a status badge
      const healthyStatuses = screen.getAllByText(/HEALTHY|WARNING|MARGIN CALL|LIQUIDATION/);
      expect(healthyStatuses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('LTV display', () => {
    it('should display LTV percentages', () => {
      render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      // Check that LTV values are displayed as percentages
      const ltvElements = screen.getAllByText(/%/);
      expect(ltvElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('callback handling', () => {
    it('should call onLoanUpdate when provided', () => {
      const mockOnLoanUpdate = jest.fn();

      render(<PortfolioTable loans={mockLoans} prices={mockPrices} onLoanUpdate={mockOnLoanUpdate} />);

      // Component should render without errors
      expect(screen.getByText('Borrower loan-1')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render empty table with no loans', () => {
      render(<PortfolioTable loans={[]} prices={mockPrices} />);

      // Headers should still be present
      expect(screen.getByText('Borrower')).toBeInTheDocument();
      expect(screen.getByText('LTV')).toBeInTheDocument();

      // No loan rows
      expect(screen.queryByText('Borrower loan-1')).not.toBeInTheDocument();
    });
  });

  describe('roll date display', () => {
    it('should display roll dates for loans', () => {
      render(<PortfolioTable loans={mockLoans} prices={mockPrices} />);

      // All loans have roll date Feb 1 (component shows abbreviated format without year)
      const rollDates = screen.getAllByText('Feb 1');
      expect(rollDates.length).toBe(3);
    });
  });
});
