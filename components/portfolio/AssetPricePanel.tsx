import React from 'react';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

interface AssetPricePanelProps {
  prices: Record<AssetType, number>;
  returns: Record<AssetType, number>;
  isLive: boolean;
}

export function AssetPricePanel({ prices, returns, isLive }: AssetPricePanelProps) {
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

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="panel-header mb-0">MARKET PRICES</h2>
        {isLive && (
          <div className="flex items-center space-x-2">
            <span className="status-indicator status-healthy animate-pulse"></span>
            <span className="text-xs font-mono text-primary font-bold">LIVE UPDATES</span>
          </div>
        )}
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
  );
}