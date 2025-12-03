'use client';

import React, { useState } from 'react';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (csvData: Record<AssetType, string>) => void;
}

export function CSVImportModal({ isOpen, onClose, onImport }: CSVImportModalProps) {
  const [csvFiles, setCsvFiles] = useState<Record<AssetType, string>>({
    [AssetType.BTC]: '',
    [AssetType.ETH]: '',
    [AssetType.SOL]: '',
  });
  const [fileNames, setFileNames] = useState<Record<AssetType, string>>({
    [AssetType.BTC]: '',
    [AssetType.ETH]: '',
    [AssetType.SOL]: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = async (asset: AssetType, file: File) => {
    try {
      const text = await file.text();

      // Basic validation
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setErrors({ ...errors, [asset]: 'CSV file must have at least 2 rows (header + data)' });
        return;
      }

      const header = lines[0].toLowerCase();
      if (!header.includes('timestamp') || !header.includes('close')) {
        setErrors({ ...errors, [asset]: 'CSV must have "timestamp" and "close" columns' });
        return;
      }

      setCsvFiles({ ...csvFiles, [asset]: text });
      setFileNames({ ...fileNames, [asset]: file.name });
      setErrors({ ...errors, [asset]: '' });
    } catch (err) {
      setErrors({ ...errors, [asset]: 'Failed to read file' });
    }
  };

  const handleSubmit = () => {
    // Validate all files are uploaded
    const allUploaded = Object.values(AssetType).every(asset => csvFiles[asset]);

    if (!allUploaded) {
      setErrors({ general: 'Please upload CSV files for all three assets (BTC, ETH, SOL)' });
      return;
    }

    onImport(csvFiles);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-background-secondary border-2 border-primary rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-mono font-bold text-primary">IMPORT HISTORICAL PRICE DATA</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-text-secondary font-mono mb-4">
            Upload CSV files with 4 years of hourly OHLCV data for each asset.
          </p>
          <p className="text-xs text-text-muted font-mono mb-2">
            Expected format: <span className="text-primary">timestamp,open,high,low,close,volume</span>
          </p>
          <p className="text-xs text-text-muted font-mono">
            Example: <span className="text-primary">2021-09-30T00:00:00.000Z,43000,43500,42800,43200,1000000</span>
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-danger bg-opacity-10 border border-danger rounded">
            <p className="text-danger text-sm font-mono">{errors.general}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* BTC Upload */}
          <div>
            <label className="block text-sm font-mono text-text-secondary mb-2">
              BTC Price History *
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(AssetType.BTC, file);
              }}
              className="w-full bg-background-tertiary border border-border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-mono file:bg-primary file:text-background hover:file:bg-primary-light"
            />
            {fileNames[AssetType.BTC] && (
              <p className="text-xs text-primary font-mono mt-1">✓ {fileNames[AssetType.BTC]}</p>
            )}
            {errors[AssetType.BTC] && (
              <p className="text-danger text-xs font-mono mt-1">{errors[AssetType.BTC]}</p>
            )}
          </div>

          {/* ETH Upload */}
          <div>
            <label className="block text-sm font-mono text-text-secondary mb-2">
              ETH Price History *
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(AssetType.ETH, file);
              }}
              className="w-full bg-background-tertiary border border-border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-mono file:bg-primary file:text-background hover:file:bg-primary-light"
            />
            {fileNames[AssetType.ETH] && (
              <p className="text-xs text-primary font-mono mt-1">✓ {fileNames[AssetType.ETH]}</p>
            )}
            {errors[AssetType.ETH] && (
              <p className="text-danger text-xs font-mono mt-1">{errors[AssetType.ETH]}</p>
            )}
          </div>

          {/* SOL Upload */}
          <div>
            <label className="block text-sm font-mono text-text-secondary mb-2">
              SOL Price History *
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(AssetType.SOL, file);
              }}
              className="w-full bg-background-tertiary border border-border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-mono file:bg-primary file:text-background hover:file:bg-primary-light"
            />
            {fileNames[AssetType.SOL] && (
              <p className="text-xs text-primary font-mono mt-1">✓ {fileNames[AssetType.SOL]}</p>
            )}
            {errors[AssetType.SOL] && (
              <p className="text-danger text-xs font-mono mt-1">{errors[AssetType.SOL]}</p>
            )}
          </div>
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
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-background rounded font-mono font-bold hover:bg-primary-light transition-colors"
          >
            IMPORT DATA
          </button>
        </div>
      </div>
    </div>
  );
}