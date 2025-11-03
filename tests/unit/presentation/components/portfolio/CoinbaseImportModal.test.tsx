/**
 * CoinbaseImportModal Tests - Presentation Layer
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import { CoinbaseImportModal } from '@/presentation/components/portfolio/CoinbaseImportModal';

describe('CoinbaseImportModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('rendering', () => {
    it('should not render when closed', () => {
      render(<CoinbaseImportModal isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByText('IMPORT FROM COINBASE API')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(<CoinbaseImportModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('IMPORT FROM COINBASE API')).toBeInTheDocument();
    });

    it('should display API information', () => {
      render(<CoinbaseImportModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText(/Coinbase Advanced Trade API/)).toBeInTheDocument();
      expect(screen.getByText(/35,000 candles per asset/)).toBeInTheDocument();
      expect(screen.getByText(/2-3 minutes/)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<CoinbaseImportModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('CANCEL')).toBeInTheDocument();
      expect(screen.getByText('FETCH DATA')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when cancel clicked', () => {
      render(<CoinbaseImportModal isOpen={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('CANCEL'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when X clicked', () => {
      render(<CoinbaseImportModal isOpen={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('×'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
