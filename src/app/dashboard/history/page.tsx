'use client';

import { useMarketData } from '@/components/common/MarketDataProvider';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

export default function HistoryPage() {
  const { portfolio, marketDataService } = useMarketData();

  const historicalData = useMemo(() => {
    if (!portfolio) return [];

    // Get 90 days of data, sampled every 6 hours
    const history = marketDataService.getHistory(AssetType.BTC, 90 * 24);
    const sampledHistory = history.filter((_, idx) => idx % 6 === 0);

    return sampledHistory.map(bar => {
      const prices = {
        [AssetType.BTC]: bar.close,
        [AssetType.ETH]: marketDataService.getHistory(AssetType.ETH, 90 * 24)[Math.floor(sampledHistory.indexOf(bar) * 6)]?.close || 0,
        [AssetType.SOL]: marketDataService.getHistory(AssetType.SOL, 90 * 24)[Math.floor(sampledHistory.indexOf(bar) * 6)]?.close || 0,
      };

      const metrics = portfolio.calculateMetrics(prices);

      return {
        timestamp: bar.timestamp.getTime(),
        date: bar.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        aggregateLTV: metrics.aggregateLTV * 100,
        expectedLoss: metrics.totalExpectedLossUSD / 1000,
        var95: metrics.valueAtRisk95 / 1000,
        collateralValue: metrics.totalCollateralValueUSD / 1_000_000,
      };
    });
  }, [portfolio, marketDataService]);

  if (!portfolio) {
    return <div className="text-center text-text-secondary font-mono">Loading...</div>;
  }

  const maxDrawdown = marketDataService.calculateMaxDrawdown(AssetType.BTC, 90 * 24);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold text-primary">
          HISTORICAL SIMULATION
        </h1>
        <p className="text-sm text-text-secondary font-mono mt-1">
          90-day portfolio backtest with margin drawdown analysis
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="metric-label">BTC Max Drawdown (90d)</div>
          <div className="metric-value text-danger">
            {(maxDrawdown * 100).toFixed(1)}%
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg LTV</div>
          <div className="metric-value text-warning">
            {(historicalData.reduce((sum, d) => sum + d.aggregateLTV, 0) / historicalData.length).toFixed(1)}%
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Peak Expected Loss</div>
          <div className="metric-value text-danger">
            ${Math.max(...historicalData.map(d => d.expectedLoss)).toFixed(0)}K
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Min Collateral Value</div>
          <div className="metric-value text-text-primary">
            ${Math.min(...historicalData.map(d => d.collateralValue)).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* LTV History Chart */}
      <div className="panel">
        <h2 className="panel-header">AGGREGATE LTV TIMELINE</h2>
        <div className="bg-background-tertiary rounded p-4">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111820',
                  border: '1px solid #374151',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
              <Area type="monotone" dataKey="aggregateLTV" fill="#ffaa0040" stroke="#ffaa00" strokeWidth={2} name="LTV %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expected Loss History */}
      <div className="panel">
        <h2 className="panel-header">EXPECTED LOSS EVOLUTION</h2>
        <div className="bg-background-tertiary rounded p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111820',
                  border: '1px solid #374151',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
              <Line type="monotone" dataKey="expectedLoss" stroke="#ff3366" strokeWidth={2} dot={false} name="Expected Loss ($K)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}