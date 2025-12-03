/**
 * LoanEditModal Tests - Presentation Layer
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import { LoanEditModal } from '@/presentation/components/portfolio/LoanEditModal';
import { Loan } from '@/domain/entities/Loan';
import { AssetType, CryptoAsset } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';
import { Money } from '@/domain/value-objects/Money';

describe('LoanEditModal', () => {
  const createTestLoan = () => {
    return new Loan(
      'test-loan-1',
      'Test Borrower',
      new CreditRating(RatingTier.A),
      {
        principalUSD: 1000000,
        lendingRate: 0.0945,
        costOfCapital: 0.045,
        tenor: 30,
        rollDate: new Date('2025-02-01'),
      },
      new CryptoAsset(AssetType.BTC, 15),
      1.5,
      new Date('2025-01-01')
    );
  };

  const mockLoan = createTestLoan();
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnClose.mockClear();
  });

  describe('rendering when closed', () => {
    it('should not render when isOpen is false', () => {
      render(<LoanEditModal isOpen={false} loan={mockLoan} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.queryByText('EDIT LOAN')).not.toBeInTheDocument();
    });
  });

  describe('rendering when open', () => {
    it('should render modal header when open', () => {
      render(<LoanEditModal isOpen={true} loan={mockLoan} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText('EDIT LOAN')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<LoanEditModal isOpen={true} loan={mockLoan} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText(/BORROWER NAME/)).toBeInTheDocument();
      expect(screen.getByText(/CREDIT RATING/)).toBeInTheDocument();
      expect(screen.getByText(/PRINCIPAL/)).toBeInTheDocument();
      expect(screen.getByText(/COLLATERAL AMOUNT/)).toBeInTheDocument();
      expect(screen.getByText(/COLLATERAL TYPE/)).toBeInTheDocument();
      expect(screen.getByText(/LEVERAGE/)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<LoanEditModal isOpen={true} loan={mockLoan} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText('CANCEL')).toBeInTheDocument();
      expect(screen.getByText('SAVE CHANGES')).toBeInTheDocument();
    });

    it('should pre-fill form with loan data', () => {
      render(<LoanEditModal isOpen={true} loan={mockLoan} onSave={mockOnSave} onClose={mockOnClose} />);

      const borrowerInput = screen.getByDisplayValue('Test Borrower');
      expect(borrowerInput).toBeInTheDocument();

      const principalInput = screen.getByDisplayValue('1000000');
      expect(principalInput).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should call onClose when cancel button clicked', () => {
      render(<LoanEditModal isOpen={true} loan={mockLoan} onSave={mockOnSave} onClose={mockOnClose} />);

      const cancelButton = screen.getByText('CANCEL');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when close button (×) clicked', () => {
      render(<LoanEditModal isOpen={true} loan={mockLoan} onSave={mockOnSave} onClose={mockOnClose} />);

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('credit rating options', () => {
    it('should display all credit rating options', () => {
      render(<LoanEditModal isOpen={true} loan={mockLoan} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText(/BBB/)).toBeInTheDocument();
      expect(screen.getByText(/\bA\b/)).toBeInTheDocument();
      expect(screen.getByText(/AA/)).toBeInTheDocument();
    });
  });

  describe('asset type options', () => {
    it('should display all asset type options', () => {
      render(<LoanEditModal isOpen={true} loan={mockLoan} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('SOL')).toBeInTheDocument();
    });
  });
});
