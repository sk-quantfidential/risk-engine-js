'use client';

import React, { useState } from 'react';
import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { CoinbaseImporter } from '@/infrastructure/adapters/CoinbaseImporter';

interface CoinbaseImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (csvData: Record<AssetType, string>) => void;
}

type ImportStatus = 'idle' | 'fetching' | 'success' | 'error';

export function CoinbaseImportModal({ isOpen, onClose, onImport }: CoinbaseImportModalProps) {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState<Record<AssetType, number>>({
    [AssetType.BTC]: 0,
    [AssetType.ETH]: 0,
    [AssetType.SOL]: 0,
  });
  const [error, setError] = useState<string>('');

  const handleFetchData = async () => {
    setStatus('fetching');
    setError('');

    try {
      const csvData = await CoinbaseImporter.fetchAllAsCsv((asset, progress) => {
        setProgress(prev => ({ ...prev, [asset]: progress }));
      });

      setStatus('success');

      // Wait a moment to show success state
      setTimeout(() => {
        onImport(csvData);
        onClose();
        resetState();
      }, 1000);

    } catch (err) {
      console.error('Failed to fetch Coinbase data:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to fetch data from Coinbase API');
    }
  };

  const resetState = () => {
    setStatus('idle');
    setProgress({
      [AssetType.BTC]: 0,
      [AssetType.ETH]: 0,
      [AssetType.SOL]: 0,
    });
    setError('');
  };

  const handleClose = () => {
    if (status === 'fetching') {
      // Don't allow closing while fetching
      return;
    }
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-background-secondary border-2 border-primary rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-mono font-bold text-primary">IMPORT FROM COINBASE API</h2>
          <button
            onClick={handleClose}
            disabled={status === 'fetching'}
            className={`text-text-secondary hover:text-text-primary transition-colors ${
              status === 'fetching' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-text-secondary font-mono mb-4">
            Fetch 4 years of hourly OHLCV data directly from Coinbase Advanced Trade API.
          </p>
          <p className="text-xs text-text-muted font-mono mb-2">
            This will download approximately <span className="text-primary">35,000 candles per asset</span> (~117 API requests per asset).
          </p>
          <p className="text-xs text-text-muted font-mono">
            Estimated time: <span className="text-primary">~2-3 minutes</span> (due to rate limiting)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger bg-opacity-10 border border-danger rounded">
            <p className="text-danger text-sm font-mono">{error}</p>
          </div>
        )}

        {/* Progress Indicators */}
        {status !== 'idle' && (
          <div className="space-y-4 mb-6">
            {Object.values(AssetType).map(asset => {
              const assetProgress = progress[asset];
              const statusIcon = assetProgress === 100 ? '✓' : assetProgress > 0 ? '⏳' : '⏸';

              return (
                <div key={asset}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-text-secondary">
                      {statusIcon} {asset}
                    </span>
                    <span className="text-xs font-mono text-text-muted">
                      {assetProgress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-background-tertiary rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        assetProgress === 100 ? 'bg-primary' : 'bg-info'
                      }`}
                      style={{ width: `${assetProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Status Messages */}
        {status === 'fetching' && (
          <div className="mb-6 p-3 bg-info bg-opacity-10 border border-info rounded">
            <p className="text-info text-sm font-mono">
              ⏳ Fetching data from Coinbase... Please do not close this window.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="mb-6 p-3 bg-primary bg-opacity-10 border border-primary rounded">
            <p className="text-primary text-sm font-mono">
              ✓ Successfully imported all data! Loading into application...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleClose}
            disabled={status === 'fetching'}
            className={`px-6 py-2 bg-background-tertiary border border-border rounded font-mono text-text-primary hover:border-border-light transition-colors ${
              status === 'fetching' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {status === 'success' ? 'CLOSE' : 'CANCEL'}
          </button>
          <button
            onClick={handleFetchData}
            disabled={status === 'fetching' || status === 'success'}
            className={`px-6 py-2 bg-primary text-background rounded font-mono font-bold hover:bg-primary-light transition-colors ${
              status === 'fetching' || status === 'success' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {status === 'fetching' ? 'FETCHING...' : status === 'success' ? 'COMPLETE' : 'FETCH DATA'}
          </button>
        </div>
      </div>
    </div>
  );
}