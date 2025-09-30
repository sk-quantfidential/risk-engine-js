'use client';

import React, { useState, useEffect } from 'react';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

interface PriceEditModalProps {
  currentPrices: Record<AssetType, number>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPrices: Record<AssetType, number>) => void;
}

export function PriceEditModal({ currentPrices, isOpen, onClose, onSave }: PriceEditModalProps) {
  const [prices, setPrices] = useState(currentPrices);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setPrices(currentPrices);
      setErrors({});
    }
  }, [isOpen, currentPrices]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    Object.entries(prices).forEach(([asset, price]) => {
      if (price <= 0) {
        newErrors[asset] = `${asset} price must be greater than 0`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(prices);
    onClose();
  };

  const handlePriceChange = (asset: AssetType, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPrices(prev => ({ ...prev, [asset]: numValue }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-background-secondary border-2 border-info rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-mono font-bold text-info">EDIT MARKET PRICES</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* BTC Price */}
          <div>
            <label className="block text-sm font-mono text-text-secondary mb-2">
              BITCOIN (BTC) PRICE (USD) *
            </label>
            <input
              type="number"
              value={prices[AssetType.BTC]}
              onChange={(e) => handlePriceChange(AssetType.BTC, e.target.value)}
              step="100"
              min="0"
              className={`w-full bg-background-tertiary border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-info ${
                errors[AssetType.BTC] ? 'border-danger' : 'border-border'
              }`}
            />
            {errors[AssetType.BTC] && (
              <p className="text-danger text-xs font-mono mt-1">{errors[AssetType.BTC]}</p>
            )}
          </div>

          {/* ETH Price */}
          <div>
            <label className="block text-sm font-mono text-text-secondary mb-2">
              ETHEREUM (ETH) PRICE (USD) *
            </label>
            <input
              type="number"
              value={prices[AssetType.ETH]}
              onChange={(e) => handlePriceChange(AssetType.ETH, e.target.value)}
              step="10"
              min="0"
              className={`w-full bg-background-tertiary border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-info ${
                errors[AssetType.ETH] ? 'border-danger' : 'border-border'
              }`}
            />
            {errors[AssetType.ETH] && (
              <p className="text-danger text-xs font-mono mt-1">{errors[AssetType.ETH]}</p>
            )}
          </div>

          {/* SOL Price */}
          <div>
            <label className="block text-sm font-mono text-text-secondary mb-2">
              SOLANA (SOL) PRICE (USD) *
            </label>
            <input
              type="number"
              value={prices[AssetType.SOL]}
              onChange={(e) => handlePriceChange(AssetType.SOL, e.target.value)}
              step="1"
              min="0"
              className={`w-full bg-background-tertiary border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-info ${
                errors[AssetType.SOL] ? 'border-danger' : 'border-border'
              }`}
            />
            {errors[AssetType.SOL] && (
              <p className="text-danger text-xs font-mono mt-1">{errors[AssetType.SOL]}</p>
            )}
          </div>

          {/* Info Notice */}
          <div className="bg-background-tertiary border-l-4 border-info rounded p-3">
            <p className="text-xs font-mono text-text-secondary">
              💡 These prices will be used to calculate collateral values for all loans.
              Changes take effect immediately across all dashboards.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-background-tertiary border border-border rounded font-mono text-text-primary hover:border-border-light transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-info text-background rounded font-mono font-bold hover:bg-info-light transition-colors"
            >
              UPDATE PRICES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}