'use client';

import { useMarketData } from '@/components/common/MarketDataProvider';
import { DrawdownLTVChart } from '@/components/analytics/DrawdownLTVChart';
import { useState } from 'react';

export default function DrawdownPage() {
  const { portfolio, marketData, marketDataProvider } = useMarketData();
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  if (!portfolio || !marketData) {
    return <div className="text-center text-text-secondary font-mono">Loading...</div>;
  }

  const selectedLoan = selectedLoanId
    ? portfolio.loans.find(l => l.id === selectedLoanId)
    : portfolio.loans[0];

  if (!selectedLoan) {
    return <div className="text-center text-text-secondary font-mono">No loans available</div>;
  }

  const currentPrice = marketData.prices[selectedLoan.collateral.type];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold text-primary">
          DRAWDOWN & LTV ANALYSIS
        </h1>
        <p className="text-sm text-text-secondary font-mono mt-1">
          Real-time margin monitoring with historical price movements
        </p>
      </div>

      {/* Loan Selector */}
      <div className="panel">
        <h2 className="panel-header">SELECT LOAN</h2>
        <div className="grid grid-cols-5 gap-3">
          {portfolio.loans.map(loan => {
            const collateralValue = loan.collateral.calculateValue(marketData.prices[loan.collateral.type]);
            const metrics = loan.calculateMetrics(collateralValue);
            const isSelected = loan.id === selectedLoan.id;

            return (
              <button
                key={loan.id}
                onClick={() => setSelectedLoanId(loan.id)}
                className={`
                  p-3 rounded border-2 transition-all text-left
                  ${isSelected
                    ? 'border-primary bg-background-tertiary'
                    : 'border-border hover:border-border-light bg-background-secondary'
                  }
                `}
              >
                <div className="text-xs font-mono text-text-muted mb-1">{loan.id}</div>
                <div className="text-sm font-mono font-bold text-text-primary truncate">
                  {loan.borrowerName}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-mono text-text-secondary mb-1">
                    {loan.collateral.type}: ${(collateralValue / 1_000_000).toFixed(2)}M
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-text-muted">
                      LTV:
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      metrics.marginStatus === 'healthy' ? 'text-primary' :
                      metrics.marginStatus === 'warning' ? 'text-warning' :
                      'text-danger'
                    }`}>
                      {(metrics.loanToValue * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drawdown LTV Chart */}
      <DrawdownLTVChart
        loan={selectedLoan}
        currentPrice={currentPrice}
        marketDataProvider={marketDataProvider}
      />
    </div>
  );
}