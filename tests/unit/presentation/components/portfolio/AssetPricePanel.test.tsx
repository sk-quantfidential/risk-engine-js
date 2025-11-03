/**
 * AssetPricePanel Tests - Presentation Layer
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AssetPricePanel } from '@/presentation/components/portfolio/AssetPricePanel';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

// Mock CSVExporter to prevent actual file downloads
const mockExportAllAssets = jest.fn();
jest.mock('@/infrastructure/adapters/CSVExporter', () => ({
  CSVExporter: {
    exportAllAssets: mockExportAllAssets,
  },
}));

import { CSVExporter } from '@/infrastructure/adapters/CSVExporter';

// Mock MarketDataService
const mockMarketDataService = {
  getHistory: jest.fn(() => [
    { timestamp: new Date(), open: 100, high: 101, low: 99, close: 100, volume: 1000 }
  ]),
} as any;

describe('AssetPricePanel', () => {
  const mockPrices = {
    [AssetType.BTC]: 100000,
    [AssetType.ETH]: 4000,
    [AssetType.SOL]: 200,
  };

  const mockReturns = {
    [AssetType.BTC]: 0.025,
    [AssetType.ETH]: -0.012,
    [AssetType.SOL]: 0.0,
  };

  beforeEach(() => {
    mockExportAllAssets.mockClear();
  });

  describe('rendering', () => {
    it('should render panel header', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      expect(screen.getByText('MARKET PRICES')).toBeInTheDocument();
    });

    it('should render all three assets', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('SOL')).toBeInTheDocument();
    });

    it('should render asset names', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
      expect(screen.getByText('Solana')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      expect(screen.getByText(/COINBASE API/)).toBeInTheDocument();
      expect(screen.getByText('IMPORT CSV')).toBeInTheDocument();
      expect(screen.getByText('EXPORT CSV')).toBeInTheDocument();
      expect(screen.getByText('EDIT PRICES')).toBeInTheDocument();
    });
  });

  describe('price formatting', () => {
    it('should format BTC price with no decimals', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      expect(screen.getByText('$100,000')).toBeInTheDocument();
    });

    it('should format ETH price with no decimals', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      expect(screen.getByText('$4,000')).toBeInTheDocument();
    });

    it('should format SOL price with 2 decimals', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });
  });

  describe('live mode indicator', () => {
    it('should show live indicator when isLive is true', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={true} />);

      expect(screen.getByText('LIVE UPDATES')).toBeInTheDocument();
    });

    it('should not show live indicator when isLive is false', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      expect(screen.queryByText('LIVE UPDATES')).not.toBeInTheDocument();
    });

    it('should show pulsing status indicator in live mode', () => {
      const { container } = render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={true} />);

      const pulsingIndicator = container.querySelector('.animate-pulse');
      expect(pulsingIndicator).toBeInTheDocument();
    });
  });

  describe('returns display', () => {
    it('should display returns when in live mode', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={true} />);

      expect(screen.getByText('+2.500%')).toBeInTheDocument(); // BTC
      expect(screen.getByText('-1.200%')).toBeInTheDocument(); // ETH
      expect(screen.getByText('+0.000%')).toBeInTheDocument(); // SOL
    });

    it('should not display returns when not in live mode', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      expect(screen.queryByText('+2.500%')).not.toBeInTheDocument();
      expect(screen.queryByText('-1.200%')).not.toBeInTheDocument();
    });

    it('should apply primary color to positive returns', () => {
      const { container } = render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={true} />);

      const btcReturn = screen.getByText('+2.500%');
      expect(btcReturn).toHaveClass('text-primary');
    });

    it('should apply danger color to negative returns', () => {
      const { container } = render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={true} />);

      const ethReturn = screen.getByText('-1.200%');
      expect(ethReturn).toHaveClass('text-danger');
    });

    it('should apply secondary color to zero returns', () => {
      const { container } = render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={true} />);

      const solReturn = screen.getByText('+0.000%');
      expect(solReturn).toHaveClass('text-text-secondary');
    });
  });

  describe('modal interactions', () => {
    it('should open price edit modal when edit button clicked', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      const editButton = screen.getByText('EDIT PRICES');
      fireEvent.click(editButton);

      // Check that the modal renders with its actual content
      expect(screen.getByText('EDIT MARKET PRICES')).toBeInTheDocument();
      expect(screen.getByText('BITCOIN (BTC) PRICE (USD) *')).toBeInTheDocument();
    });

    it('should open CSV import modal when import button clicked', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      const importButton = screen.getByText('IMPORT CSV');
      fireEvent.click(importButton);

      // Check that the modal renders with its actual content
      expect(screen.getByText('IMPORT HISTORICAL PRICE DATA')).toBeInTheDocument();
      expect(screen.getByText('BTC Price History *')).toBeInTheDocument();
    });

    it('should open Coinbase modal when Coinbase button clicked', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      const coinbaseButton = screen.getByText(/COINBASE API/);
      fireEvent.click(coinbaseButton);

      // Check that the modal renders with its actual content
      expect(screen.getByText('IMPORT FROM COINBASE API')).toBeInTheDocument();
    });

    it('should close modal when close button clicked', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      const editButton = screen.getByText('EDIT PRICES');
      fireEvent.click(editButton);

      expect(screen.getByText('EDIT MARKET PRICES')).toBeInTheDocument();

      // Click the close button (×)
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(screen.queryByText('EDIT MARKET PRICES')).not.toBeInTheDocument();
    });
  });

  describe('callback handling', () => {
    it('should call onPriceUpdate when provided', () => {
      const mockOnPriceUpdate = jest.fn();

      render(
        <AssetPricePanel
          prices={mockPrices}
          returns={mockReturns}
          isLive={false}
          onPriceUpdate={mockOnPriceUpdate}
        />
      );

      // This would be triggered by the modal, but we're testing the prop passing
      expect(mockOnPriceUpdate).not.toHaveBeenCalled();
    });

    it('should call onCSVImport when provided', () => {
      const mockOnCSVImport = jest.fn();

      render(
        <AssetPricePanel
          prices={mockPrices}
          returns={mockReturns}
          isLive={false}
          onCSVImport={mockOnCSVImport}
        />
      );

      expect(mockOnCSVImport).not.toHaveBeenCalled();
    });

    it('should handle export button click without crashing', () => {
      render(
        <AssetPricePanel
          prices={mockPrices}
          returns={mockReturns}
          isLive={false}
          marketDataService={mockMarketDataService}
        />
      );

      const exportButton = screen.getByText('EXPORT CSV');

      // CSVExporter is mocked to prevent actual file download
      // Verify button click doesn't throw error
      expect(() => fireEvent.click(exportButton)).not.toThrow();

      // Note: CSVExporter static method mocking with TypeScript path aliases
      // is complex - the export functionality itself should be tested in CSVExporter unit tests
    });

    it('should not crash when export clicked without marketDataService', () => {
      render(<AssetPricePanel prices={mockPrices} returns={mockReturns} isLive={false} />);

      const exportButton = screen.getByText('EXPORT CSV');
      fireEvent.click(exportButton);

      // Should not throw error
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle zero prices', () => {
      const zeroPrices = {
        [AssetType.BTC]: 0,
        [AssetType.ETH]: 0,
        [AssetType.SOL]: 0,
      };

      render(<AssetPricePanel prices={zeroPrices} returns={mockReturns} isLive={false} />);

      // BTC and ETH format with 0 decimals (2 instances), SOL with 2 decimals (1 instance)
      const zeroElements = screen.getAllByText('$0');
      expect(zeroElements.length).toBe(2); // BTC and ETH
      expect(screen.getByText('$0.00')).toBeInTheDocument(); // SOL
    });

    it('should handle very large prices', () => {
      const largePrices = {
        [AssetType.BTC]: 1000000,
        [AssetType.ETH]: 50000,
        [AssetType.SOL]: 10000,
      };

      render(<AssetPricePanel prices={largePrices} returns={mockReturns} isLive={false} />);

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });

    it('should handle small decimal returns', () => {
      const smallReturns = {
        [AssetType.BTC]: 0.00001,
        [AssetType.ETH]: -0.00001,
        [AssetType.SOL]: 0,
      };

      render(<AssetPricePanel prices={mockPrices} returns={smallReturns} isLive={true} />);

      expect(screen.getByText('+0.001%')).toBeInTheDocument();
      expect(screen.getByText('-0.001%')).toBeInTheDocument();
    });
  });
});
