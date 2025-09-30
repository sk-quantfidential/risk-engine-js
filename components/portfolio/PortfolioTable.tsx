import React from 'react';
import { Loan } from '@/domain/entities/Loan';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

interface PortfolioTableProps {
  loans: Loan[];
  prices: Record<AssetType, number>;
}

export function PortfolioTable({ loans, prices }: PortfolioTableProps) {
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-primary';
      case 'warning': return 'text-warning';
      case 'call': return 'text-danger';
      case 'liquidation': return 'text-danger font-bold';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'healthy': return 'HEALTHY';
      case 'warning': return 'WARNING';
      case 'call': return 'MARGIN CALL';
      case 'liquidation': return 'LIQUIDATION';
      default: return status.toUpperCase();
    }
  };

  const loansWithMetrics = loans.map(loan => {
    const collateralValue = loan.collateral.calculateValue(prices[loan.collateral.type]);
    const metrics = loan.calculateMetrics(collateralValue);
    return { loan, metrics, collateralValue };
  });

  // Sort by LTV descending (riskiest first)
  loansWithMetrics.sort((a, b) => b.metrics.loanToValue - a.metrics.loanToValue);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-border-light">
            <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-xs">Borrower</th>
            <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-xs">Rating</th>
            <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Principal</th>
            <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-xs">Collateral (USD)</th>
            <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">LTV</th>
            <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-xs">Status</th>
            <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Exp. Loss</th>
            <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Roll Date</th>
          </tr>
        </thead>
        <tbody>
          {loansWithMetrics.map(({ loan, metrics, collateralValue }) => (
            <tr
              key={loan.id}
              className="border-b border-border hover:bg-background-tertiary transition-colors"
            >
              <td className="py-3 px-2 text-text-primary">
                <div>{loan.borrowerName}</div>
                <div className="text-xs text-text-muted">{loan.id}</div>
              </td>
              <td className="py-3 px-2">
                <span className={`
                  px-2 py-1 rounded text-xs font-bold
                  ${loan.borrowerRating.tier === 'AA' ? 'bg-primary text-background' : ''}
                  ${loan.borrowerRating.tier === 'A' ? 'bg-info text-background' : ''}
                  ${loan.borrowerRating.tier === 'BBB' ? 'bg-warning text-background' : ''}
                `}>
                  {loan.borrowerRating.tier}
                </span>
              </td>
              <td className="py-3 px-2 text-right text-text-primary font-bold">
                {formatMoney(loan.terms.principalUSD)}
              </td>
              <td className="py-3 px-2">
                <div className="text-text-primary font-bold">
                  {formatMoney(collateralValue)}
                </div>
                <div className="text-xs text-text-muted">
                  {loan.collateral.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {loan.collateral.type}
                </div>
              </td>
              <td className="py-3 px-2 text-right">
                <span className={`font-bold ${
                  metrics.loanToValue > 0.75 ? 'text-danger' :
                  metrics.loanToValue > 0.65 ? 'text-warning' :
                  'text-primary'
                }`}>
                  {(metrics.loanToValue * 100).toFixed(1)}%
                </span>
              </td>
              <td className="py-3 px-2">
                <span className={getStatusColor(metrics.marginStatus)}>
                  {getStatusBadge(metrics.marginStatus)}
                </span>
              </td>
              <td className="py-3 px-2 text-right text-danger font-bold">
                {formatMoney(metrics.expectedLossUSD)}
              </td>
              <td className="py-3 px-2 text-right text-text-secondary">
                {new Date(loan.terms.rollDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}