'use client';

import { useMarketData } from '@/components/common/MarketDataProvider';
import { CorrelationHeatmap } from '@/components/analytics/CorrelationHeatmap';
import { useState, useMemo } from 'react';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

export default function CorrelationsPage() {
  const { portfolio, marketData, marketDataProvider } = useMarketData();

  // Correlation overrides (user can adjust via sliders)
  const [btcEthCorr, setBtcEthCorr] = useState(0.82);
  const [btcSolCorr, setBtcSolCorr] = useState(0.68);
  const [ethSolCorr, setEthSolCorr] = useState(0.75);

  // Default correlation with drawdown
  const [defaultCorr, setDefaultCorr] = useState(0.45);

  if (!portfolio || !marketData) {
    return <div className="text-center text-text-secondary font-mono">Loading...</div>;
  }

  // Calculate historical correlations
  const historicalCorrelations = useMemo(() => {
    return {
      BTC_ETH: marketDataProvider.calculateHistoricalCorrelation(AssetType.BTC, AssetType.ETH, 720),
      BTC_SOL: marketDataProvider.calculateHistoricalCorrelation(AssetType.BTC, AssetType.SOL, 720),
      ETH_SOL: marketDataProvider.calculateHistoricalCorrelation(AssetType.ETH, AssetType.SOL, 720),
    };
  }, [marketDataProvider]);

  // Simulate portfolio metrics with adjusted correlations
  const adjustedMetrics = useMemo(() => {
    // This is a simplified calculation - in reality, you'd re-run Monte Carlo
    const baseMetrics = portfolio.calculateMetrics(marketData.prices);

    // Rough approximation: higher correlations increase portfolio VaR
    const avgCorr = (btcEthCorr + btcSolCorr + ethSolCorr) / 3;
    const corrAdjustment = avgCorr / 0.75;  // Baseline is 0.75 avg

    return {
      ...baseMetrics,
      valueAtRisk95: baseMetrics.valueAtRisk95 * corrAdjustment,
      valueAtRisk99: baseMetrics.valueAtRisk99 * corrAdjustment,
      conditionalVaR95: baseMetrics.conditionalVaR95 * corrAdjustment,
      conditionalVaR99: baseMetrics.conditionalVaR99 * corrAdjustment,
    };
  }, [portfolio, marketData, btcEthCorr, btcSolCorr, ethSolCorr]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold text-primary">
          CORRELATION ANALYSIS
        </h1>
        <p className="text-sm text-text-secondary font-mono mt-1">
          Asset correlation impact on portfolio risk
        </p>
      </div>

      {/* Historical Correlations */}
      <div className="panel">
        <h2 className="panel-header">HISTORICAL CORRELATIONS (30 DAYS)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="metric-label">BTC-ETH</div>
            <div className="metric-value text-primary">
              {historicalCorrelations.BTC_ETH.toFixed(3)}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">BTC-SOL</div>
            <div className="metric-value text-info">
              {historicalCorrelations.BTC_SOL.toFixed(3)}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">ETH-SOL</div>
            <div className="metric-value text-warning">
              {historicalCorrelations.ETH_SOL.toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Adjustment Sliders */}
      <div className="panel">
        <h2 className="panel-header">ADJUST CORRELATIONS</h2>
        <div className="space-y-6">
          {/* BTC-ETH */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono text-text-secondary">BTC-ETH Correlation</span>
              <span className="text-lg font-mono font-bold text-primary">{btcEthCorr.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={btcEthCorr}
              onChange={(e) => setBtcEthCorr(parseFloat(e.target.value))}
              className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex items-center justify-between mt-1 text-xs font-mono text-text-muted">
              <span>0.00 (Uncorrelated)</span>
              <span>1.00 (Perfect)</span>
            </div>
          </div>

          {/* BTC-SOL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono text-text-secondary">BTC-SOL Correlation</span>
              <span className="text-lg font-mono font-bold text-info">{btcSolCorr.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={btcSolCorr}
              onChange={(e) => setBtcSolCorr(parseFloat(e.target.value))}
              className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-info"
            />
            <div className="flex items-center justify-between mt-1 text-xs font-mono text-text-muted">
              <span>0.00 (Uncorrelated)</span>
              <span>1.00 (Perfect)</span>
            </div>
          </div>

          {/* ETH-SOL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono text-text-secondary">ETH-SOL Correlation</span>
              <span className="text-lg font-mono font-bold text-warning">{ethSolCorr.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={ethSolCorr}
              onChange={(e) => setEthSolCorr(parseFloat(e.target.value))}
              className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-warning"
            />
            <div className="flex items-center justify-between mt-1 text-xs font-mono text-text-muted">
              <span>0.00 (Uncorrelated)</span>
              <span>1.00 (Perfect)</span>
            </div>
          </div>

          {/* Default-Asset Correlation */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono text-text-secondary">Default-to-Drawdown Correlation (Wrong-Way Risk)</span>
              <span className="text-lg font-mono font-bold text-danger">{defaultCorr.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={defaultCorr}
              onChange={(e) => setDefaultCorr(parseFloat(e.target.value))}
              className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-danger"
            />
            <div className="flex items-center justify-between mt-1 text-xs font-mono text-text-muted">
              <span>0.00 (Independent)</span>
              <span>1.00 (Fully Correlated)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Heatmap */}
      <CorrelationHeatmap
        btcEthCorr={btcEthCorr}
        btcSolCorr={btcSolCorr}
        ethSolCorr={ethSolCorr}
        defaultCorr={defaultCorr}
      />

      {/* Impact on Portfolio Risk */}
      <div className="panel">
        <h2 className="panel-header">PORTFOLIO RISK WITH ADJUSTED CORRELATIONS</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="metric-label">95% VaR</div>
            <div className="metric-value text-warning">
              ${(adjustedMetrics.valueAtRisk95 / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">99% VaR</div>
            <div className="metric-value text-danger">
              ${(adjustedMetrics.valueAtRisk99 / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">95% CVaR</div>
            <div className="metric-value text-warning">
              ${(adjustedMetrics.conditionalVaR95 / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">99% CVaR</div>
            <div className="metric-value text-danger">
              ${(adjustedMetrics.conditionalVaR99 / 1000).toFixed(0)}K
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-background-tertiary border border-border-light rounded">
          <div className="text-xs font-mono text-text-secondary mb-2">
            📊 CORRELATION IMPACT ANALYSIS
          </div>
          <div className="text-sm font-mono text-text-primary">
            Average correlation: <span className="font-bold text-primary">{((btcEthCorr + btcSolCorr + ethSolCorr) / 3).toFixed(3)}</span>
            {' '}• Higher correlations increase portfolio-level tail risk due to synchronized drawdowns.
            Wrong-way risk correlation of <span className="font-bold text-danger">{defaultCorr.toFixed(2)}</span> amplifies losses when defaults occur during market stress.
          </div>
        </div>
      </div>
    </div>
  );
}