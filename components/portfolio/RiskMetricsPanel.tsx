import React from 'react';
import { PortfolioMetrics } from '@/domain/entities/Portfolio';

interface RiskMetricsPanelProps {
  portfolioMetrics: PortfolioMetrics;
  riskCapital: number;
}

export function RiskMetricsPanel({ portfolioMetrics, riskCapital }: RiskMetricsPanelProps) {
  const formatMoney = (amount: number): string => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    return `$${(amount / 1_000).toFixed(0)}K`;
  };

  const utilizationPercent = (portfolioMetrics.totalExposureUSD / riskCapital) * 100;

  return (
    <div className="panel">
      <h2 className="panel-header">RISK METRICS</h2>

      <div className="grid grid-cols-4 gap-6">
        {/* VaR Metrics */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-text-secondary uppercase tracking-wider">
            Value at Risk
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono text-text-secondary">95% VaR</span>
              <span className="text-lg font-mono font-bold text-warning">
                {formatMoney(portfolioMetrics.valueAtRisk95)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono text-text-secondary">99% VaR</span>
              <span className="text-lg font-mono font-bold text-danger">
                {formatMoney(portfolioMetrics.valueAtRisk99)}
              </span>
            </div>
          </div>
        </div>

        {/* CVaR Metrics */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-text-secondary uppercase tracking-wider">
            Expected Shortfall
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono text-text-secondary">95% CVaR</span>
              <span className="text-lg font-mono font-bold text-warning">
                {formatMoney(portfolioMetrics.conditionalVaR95)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono text-text-secondary">99% CVaR</span>
              <span className="text-lg font-mono font-bold text-danger">
                {formatMoney(portfolioMetrics.conditionalVaR99)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk-Adjusted Returns */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-text-secondary uppercase tracking-wider">
            Risk-Adjusted Returns
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono text-text-secondary">Sharpe</span>
              <span className="text-lg font-mono font-bold text-primary">
                {portfolioMetrics.sharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono text-text-secondary">Sortino</span>
              <span className="text-lg font-mono font-bold text-primary">
                {portfolioMetrics.sortinoRatio.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Capital Utilization */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-text-secondary uppercase tracking-wider">
            Capital Management
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono text-text-secondary">Utilization</span>
              <span className="text-lg font-mono font-bold text-info">
                {utilizationPercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono text-text-secondary">Available</span>
              <span className="text-lg font-mono font-bold text-text-primary">
                {formatMoney(riskCapital - portfolioMetrics.totalExposureUSD)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Concentration Risk Bar */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">
          Collateral Concentration
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-6 bg-background-tertiary rounded overflow-hidden flex">
            <div
              className="bg-warning h-full flex items-center justify-center text-xs font-mono font-bold"
              style={{ width: `${portfolioMetrics.concentrationRisk.assetConcentration.BTC}%` }}
            >
              {portfolioMetrics.concentrationRisk.assetConcentration.BTC > 10 && 'BTC'}
            </div>
            <div
              className="bg-info h-full flex items-center justify-center text-xs font-mono font-bold"
              style={{ width: `${portfolioMetrics.concentrationRisk.assetConcentration.ETH}%` }}
            >
              {portfolioMetrics.concentrationRisk.assetConcentration.ETH > 10 && 'ETH'}
            </div>
            <div
              className="bg-primary h-full flex items-center justify-center text-xs font-mono font-bold text-background"
              style={{ width: `${portfolioMetrics.concentrationRisk.assetConcentration.SOL}%` }}
            >
              {portfolioMetrics.concentrationRisk.assetConcentration.SOL > 10 && 'SOL'}
            </div>
          </div>
          <div className="text-sm font-mono text-text-secondary whitespace-nowrap">
            HHI: {portfolioMetrics.concentrationRisk.borrowerConcentration.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}