'use client';

import React, { useState, useEffect } from 'react';
import { Loan } from '@/domain/entities/Loan';
import { AssetType, CryptoAsset } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

interface LoanEditModalProps {
  loan: Loan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLoan: Loan) => void;
}

export function LoanEditModal({ loan, isOpen, onClose, onSave }: LoanEditModalProps) {
  const [formData, setFormData] = useState({
    borrowerName: loan.borrowerName,
    principalUSD: loan.terms.principalUSD,
    collateralAmount: loan.collateral.amount,
    collateralType: loan.collateral.type,
    ratingTier: loan.borrowerRating.tier,
    leverage: loan.leverage,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        borrowerName: loan.borrowerName,
        principalUSD: loan.terms.principalUSD,
        collateralAmount: loan.collateral.amount,
        collateralType: loan.collateral.type,
        ratingTier: loan.borrowerRating.tier,
        leverage: loan.leverage,
      });
      setErrors({});
    }
  }, [isOpen, loan]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.borrowerName.trim()) {
      newErrors.borrowerName = 'Borrower name is required';
    }

    if (formData.principalUSD <= 0) {
      newErrors.principalUSD = 'Principal must be greater than 0';
    }

    if (formData.collateralAmount <= 0) {
      newErrors.collateralAmount = 'Collateral amount must be greater than 0';
    }

    if (formData.leverage < 0) {
      newErrors.leverage = 'Leverage cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create updated loan with new values
    const updatedLoan = new Loan(
      loan.id,
      formData.borrowerName,
      new CreditRating(formData.ratingTier as RatingTier),
      {
        principalUSD: formData.principalUSD,
        lendingRate: loan.terms.lendingRate,
        costOfCapital: loan.terms.costOfCapital,
        tenor: loan.terms.tenor,
        rollDate: loan.terms.rollDate,
      },
      new CryptoAsset(formData.collateralType as AssetType, formData.collateralAmount),
      formData.leverage,
      loan.originationDate
    );

    onSave(updatedLoan);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-background-secondary border-2 border-primary rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-mono font-bold text-primary">EDIT LOAN</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan ID (Read-only) */}
          <div>
            <label className="block text-sm font-mono text-text-secondary mb-2">
              LOAN ID
            </label>
            <input
              type="text"
              value={loan.id}
              disabled
              className="w-full bg-background-tertiary border border-border rounded px-4 py-2 font-mono text-text-muted"
            />
          </div>

          {/* Borrower Name */}
          <div>
            <label className="block text-sm font-mono text-text-secondary mb-2">
              BORROWER NAME *
            </label>
            <input
              type="text"
              value={formData.borrowerName}
              onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
              className={`w-full bg-background-tertiary border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-primary ${
                errors.borrowerName ? 'border-danger' : 'border-border'
              }`}
            />
            {errors.borrowerName && (
              <p className="text-danger text-xs font-mono mt-1">{errors.borrowerName}</p>
            )}
          </div>

          {/* Principal */}
          <div>
            <label className="block text-sm font-mono text-text-secondary mb-2">
              PRINCIPAL (USD) *
            </label>
            <input
              type="number"
              value={formData.principalUSD}
              onChange={(e) => setFormData({ ...formData, principalUSD: parseFloat(e.target.value) || 0 })}
              step="100000"
              min="0"
              className={`w-full bg-background-tertiary border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-primary ${
                errors.principalUSD ? 'border-danger' : 'border-border'
              }`}
            />
            {errors.principalUSD && (
              <p className="text-danger text-xs font-mono mt-1">{errors.principalUSD}</p>
            )}
          </div>

          {/* Collateral Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono text-text-secondary mb-2">
                COLLATERAL TYPE *
              </label>
              <select
                value={formData.collateralType}
                onChange={(e) => setFormData({ ...formData, collateralType: e.target.value as AssetType })}
                className="w-full bg-background-tertiary border border-border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-primary"
              >
                <option value={AssetType.BTC}>BTC</option>
                <option value={AssetType.ETH}>ETH</option>
                <option value={AssetType.SOL}>SOL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-mono text-text-secondary mb-2">
                COLLATERAL AMOUNT *
              </label>
              <input
                type="number"
                value={formData.collateralAmount}
                onChange={(e) => setFormData({ ...formData, collateralAmount: parseFloat(e.target.value) || 0 })}
                step="0.01"
                min="0"
                className={`w-full bg-background-tertiary border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-primary ${
                  errors.collateralAmount ? 'border-danger' : 'border-border'
                }`}
              />
              {errors.collateralAmount && (
                <p className="text-danger text-xs font-mono mt-1">{errors.collateralAmount}</p>
              )}
            </div>
          </div>

          {/* Rating and Leverage Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono text-text-secondary mb-2">
                CREDIT RATING *
              </label>
              <select
                value={formData.ratingTier}
                onChange={(e) => setFormData({ ...formData, ratingTier: e.target.value as RatingTier })}
                className="w-full bg-background-tertiary border border-border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="BBB">BBB</option>
                <option value="A">A</option>
                <option value="AA">AA</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-mono text-text-secondary mb-2">
                LEVERAGE *
              </label>
              <input
                type="number"
                value={formData.leverage}
                onChange={(e) => setFormData({ ...formData, leverage: parseFloat(e.target.value) || 0 })}
                step="0.1"
                min="0"
                max="10"
                className={`w-full bg-background-tertiary border rounded px-4 py-2 font-mono text-text-primary focus:outline-none focus:border-primary ${
                  errors.leverage ? 'border-danger' : 'border-border'
                }`}
              />
              {errors.leverage && (
                <p className="text-danger text-xs font-mono mt-1">{errors.leverage}</p>
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
              type="submit"
              className="px-6 py-2 bg-primary text-background rounded font-mono font-bold hover:bg-primary-light transition-colors"
            >
              SAVE CHANGES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}