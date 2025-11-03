/**
 * PriceEditModal Tests - Presentation Layer
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import { PriceEditModal } from '@/presentation/components/portfolio/PriceEditModal';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

describe('PriceEditModal', () => {
  const mockPrices = {
    [AssetType.BTC]: 100000,
    [AssetType.ETH]: 4000,
    [AssetType.SOL]: 200,
  };
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnClose.mockClear();
  });

  describe('rendering', () => {
    it('should not render when closed', () => {
      render(<PriceEditModal isOpen={false} currentPrices={mockPrices} onSave={mockOnSave} onClose={mockOnClose} />);
      expect(screen.queryByText('EDIT MARKET PRICES')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(<PriceEditModal isOpen={true} currentPrices={mockPrices} onSave={mockOnSave} onClose={mockOnClose} />);
      expect(screen.getByText('EDIT MARKET PRICES')).toBeInTheDocument();
    });

    it('should render price inputs for all assets', () => {
      render(<PriceEditModal isOpen={true} currentPrices={mockPrices} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText(/BITCOIN.*BTC.*PRICE/)).toBeInTheDocument();
      expect(screen.getByText(/ETHEREUM.*ETH.*PRICE/)).toBeInTheDocument();
      expect(screen.getByText(/SOLANA.*SOL.*PRICE/)).toBeInTheDocument();
    });

    it('should pre-fill inputs with current prices', () => {
      render(<PriceEditModal isOpen={true} currentPrices={mockPrices} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByDisplayValue('100000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when cancel clicked', () => {
      render(<PriceEditModal isOpen={true} currentPrices={mockPrices} onSave={mockOnSave} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('CANCEL'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when X clicked', () => {
      render(<PriceEditModal isOpen={true} currentPrices={mockPrices} onSave={mockOnSave} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('×'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
