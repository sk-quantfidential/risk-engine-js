import React, { useState } from 'react';
import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { PriceEditModal } from './PriceEditModal';
import { CSVImportModal } from './CSVImportModal';
import { CoinbaseImportModal } from './CoinbaseImportModal';
import { MarketDataService } from '@/infrastructure/adapters/MarketDataService';
import { CSVExporter } from '@/infrastructure/adapters/CSVExporter';

interface AssetPricePanelProps {
  prices: Record<AssetType, number>;
  returns: Record<AssetType, number>;
  isLive: boolean;
  onPriceUpdate?: (newPrices: Record<AssetType, number>) => void;
  onCSVImport?: (csvData: Record<AssetType, string>) => void;
  marketDataService?: MarketDataService;
}

export function AssetPricePanel({ prices, returns, isLive, onPriceUpdate, onCSVImport, marketDataService }: AssetPricePanelProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCoinbaseModalOpen, setIsCoinbaseModalOpen] = useState(false);
  const formatPrice = (price: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  };

  const formatReturn = (returnVal: number): string => {
    const sign = returnVal >= 0 ? '+' : '';
    return `${sign}${(returnVal * 100).toFixed(3)}%`;
  };

  const getReturnColor = (returnVal: number): string => {
    if (returnVal > 0) return 'text-primary';
    if (returnVal < 0) return 'text-danger';
    return 'text-text-secondary';
  };

  const assets = [
    { type: AssetType.BTC, name: 'Bitcoin', decimals: 0 },
    { type: AssetType.ETH, name: 'Ethereum', decimals: 0 },
    { type: AssetType.SOL, name: 'Solana', decimals: 2 },
  ];

  const handleSavePrices = (newPrices: Record<AssetType, number>) => {
    if (onPriceUpdate) {
      onPriceUpdate(newPrices);
    }
    setIsEditModalOpen(false);
  };

  const handleExportCSV = () => {
    if (marketDataService) {
      CSVExporter.exportAllAssets(marketDataService);
    }
  };

  const handleImportCSV = (csvData: Record<AssetType, string>) => {
    if (onCSVImport) {
      onCSVImport(csvData);
    }
    setIsImportModalOpen(false);
  };

  return (
    <>
      <div className="panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="panel-header mb-0">MARKET PRICES</h2>
          <div className="flex items-center space-x-3">
            {isLive && (
              <div className="flex items-center space-x-2">
                <span className="status-indicator status-healthy animate-pulse"></span>
                <span className="text-xs font-mono text-primary font-bold">LIVE UPDATES</span>
              </div>
            )}
            <button
              onClick={() => setIsCoinbaseModalOpen(true)}
              className="px-4 py-2 bg-primary text-background rounded text-xs font-mono font-bold hover:bg-primary-light transition-colors"
            >
              📡 COINBASE API
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-background-tertiary border border-primary rounded text-xs font-mono text-primary hover:bg-primary hover:text-background transition-colors"
            >
              IMPORT CSV
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-background-tertiary border border-border rounded text-xs font-mono text-text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              EXPORT CSV
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-background-tertiary border border-info rounded text-xs font-mono text-info hover:border-info-light hover:bg-background transition-colors"
            >
              EDIT PRICES
            </button>
          </div>
        </div>

      <div className="grid grid-cols-3 gap-4">
        {assets.map(({ type, name, decimals }) => (
          <div key={type} className="bg-background-tertiary border border-border-light rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-mono text-text-secondary uppercase">{type}</div>
              <div className="text-xs text-text-muted font-mono">{name}</div>
            </div>
            <div className="text-2xl font-mono font-bold text-text-primary mb-1">
              {formatPrice(prices[type], decimals)}
            </div>
            {isLive && (
              <div className={`text-sm font-mono font-bold ${getReturnColor(returns[type])}`}>
                {formatReturn(returns[type])}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    <PriceEditModal
      currentPrices={prices}
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      onSave={handleSavePrices}
    />

    <CSVImportModal
      isOpen={isImportModalOpen}
      onClose={() => setIsImportModalOpen(false)}
      onImport={handleImportCSV}
    />

    <CoinbaseImportModal
      isOpen={isCoinbaseModalOpen}
      onClose={() => setIsCoinbaseModalOpen(false)}
      onImport={handleImportCSV}
    />
    </>
  );
}