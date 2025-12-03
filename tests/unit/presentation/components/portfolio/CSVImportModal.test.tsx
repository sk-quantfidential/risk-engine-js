/**
 * CSVImportModal Tests - Presentation Layer
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import { CSVImportModal } from '@/presentation/components/portfolio/CSVImportModal';

describe('CSVImportModal', () => {
  const mockOnImport = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnImport.mockClear();
    mockOnClose.mockClear();
  });

  describe('rendering', () => {
    it('should not render when closed', () => {
      render(<CSVImportModal isOpen={false} onImport={mockOnImport} onClose={mockOnClose} />);
      expect(screen.queryByText('IMPORT HISTORICAL PRICE DATA')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(<CSVImportModal isOpen={true} onImport={mockOnImport} onClose={mockOnClose} />);
      expect(screen.getByText('IMPORT HISTORICAL PRICE DATA')).toBeInTheDocument();
    });

    it('should render file inputs for all assets', () => {
      render(<CSVImportModal isOpen={true} onImport={mockOnImport} onClose={mockOnClose} />);

      expect(screen.getByText('BTC Price History *')).toBeInTheDocument();
      expect(screen.getByText('ETH Price History *')).toBeInTheDocument();
      expect(screen.getByText('SOL Price History *')).toBeInTheDocument();
    });

    it('should render format instructions', () => {
      render(<CSVImportModal isOpen={true} onImport={mockOnImport} onClose={mockOnClose} />);

      expect(screen.getByText(/timestamp,open,high,low,close,volume/)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when cancel clicked', () => {
      render(<CSVImportModal isOpen={true} onImport={mockOnImport} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('CANCEL'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
