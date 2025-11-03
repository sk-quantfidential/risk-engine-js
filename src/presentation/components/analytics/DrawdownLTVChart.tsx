'use client';

import React, { useMemo } from 'react';
import { Loan } from '@/domain/entities/Loan';
import { MarketDataService } from '@/infrastructure/adapters/MarketDataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';

interface DrawdownLTVChartProps {
  loan: Loan;
  currentPrice: number;
  marketDataService: MarketDataService;
}

export function DrawdownLTVChart({ loan, currentPrice, marketDataService }: DrawdownLTVChartProps) {
  const chartData = useMemo(() => {
    // Get last 6 months of hourly price data
    const history = marketDataService.getHistoryWindow(loan.collateral.type, 6 * 30 * 24);

    // Calculate LTV for each price point
    return history.map(bar => {
      const collateralValue = loan.collateral.calculateValue(bar.close);
      const ltv = loan.calculateLTV(collateralValue);
      const marginStatus = loan.getMarginStatus(ltv);

      return {
        timestamp: bar.timestamp.getTime(),
        date: bar.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: bar.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        price: bar.close,
        ltv: ltv * 100,
        ltvDecimal: ltv,
        marginStatus,
      };
    });
  }, [loan, marketDataService]);

  const marginPolicy = loan.collateral.marginPolicy;
  const currentCollateralValue = loan.collateral.calculateValue(currentPrice);
  const currentMetrics = loan.calculateMetrics(currentCollateralValue);

  // Calculate margin event probabilities (720 hours = 30 days)
  const volatility = marketDataService.calculateVolatility(loan.collateral.type, 30);
  const marginCallProb3d = loan.calculateMarginEventProbability(currentPrice, volatility, 3, 'call');
  const marginCallProb5d = loan.calculateMarginEventProbability(currentPrice, volatility, 5, 'call');
  const liquidationProb3d = loan.calculateMarginEventProbability(currentPrice, volatility, 3, 'liquidation');
  const liquidationProb5d = loan.calculateMarginEventProbability(currentPrice, volatility, 5, 'liquidation');

  return (
    <div className="panel">
      <h2 className="panel-header">LTV TIMELINE WITH MARGIN BANDS</h2>

      {/* Current Status */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="metric-card">
          <div className="metric-label">Collateral Value</div>
          <div className="metric-value text-primary">
            ${(currentCollateralValue / 1_000_000).toFixed(2)}M
          </div>
          <div className="text-xs text-text-muted font-mono mt-1">
            {loan.collateral.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {loan.collateral.type}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Current LTV</div>
          <div className={`metric-value ${
            currentMetrics.marginStatus === 'healthy' ? 'text-primary' :
            currentMetrics.marginStatus === 'warning' ? 'text-warning' :
            'text-danger'
          }`}>
            {(currentMetrics.loanToValue * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-text-muted font-mono mt-1">
            Status: {currentMetrics.marginStatus.toUpperCase()}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Margin Call (3d/5d)</div>
          <div className="metric-value text-warning">
            {(marginCallProb3d * 100).toFixed(1)}% / {(marginCallProb5d * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-text-muted font-mono mt-1">
            Threshold: {(marginPolicy.callThreshold * 100).toFixed(0)}%
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Liquidation (3d/5d)</div>
          <div className="metric-value text-danger">
            {(liquidationProb3d * 100).toFixed(2)}% / {(liquidationProb5d * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-text-muted font-mono mt-1">
            Threshold: {(marginPolicy.liquidationThreshold * 100).toFixed(0)}%
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Excess Collateral</div>
          <div className={`metric-value ${currentMetrics.excessCollateral > 0 ? 'text-primary' : 'text-danger'}`}>
            ${(currentMetrics.excessCollateral / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-text-muted font-mono mt-1">
            Above liquidation threshold
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-background-tertiary rounded p-4">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
              label={{ value: 'LTV %', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontFamily: 'monospace' } }}
              domain={[0, 'auto']}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111820',
                border: '1px solid #374151',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
              formatter={(value: any, name: string) => {
                if (name === 'LTV') return [`${value.toFixed(2)}%`, name];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
            />

            {/* Margin bands as reference areas */}
            <ReferenceLine
              y={marginPolicy.warnThreshold * 100}
              stroke="#ffaa00"
              strokeDasharray="5 5"
              label={{ value: 'WARN', position: 'right', fill: '#ffaa00', fontFamily: 'monospace', fontSize: '10px' }}
            />
            <ReferenceLine
              y={marginPolicy.callThreshold * 100}
              stroke="#ff5c85"
              strokeDasharray="5 5"
              label={{ value: 'CALL', position: 'right', fill: '#ff5c85', fontFamily: 'monospace', fontSize: '10px' }}
            />
            <ReferenceLine
              y={marginPolicy.liquidationThreshold * 100}
              stroke="#ff3366"
              strokeWidth={2}
              label={{ value: 'LIQUIDATION', position: 'right', fill: '#ff3366', fontFamily: 'monospace', fontSize: '10px', fontWeight: 'bold' }}
            />

            {/* LTV line */}
            <Line
              type="monotone"
              dataKey="ltv"
              stroke="#00ff88"
              strokeWidth={2}
              dot={false}
              name="LTV"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-primary"></div>
          <span className="text-text-secondary">Healthy: &lt; {(marginPolicy.warnThreshold * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-warning"></div>
          <span className="text-text-secondary">Warning: {(marginPolicy.warnThreshold * 100).toFixed(0)}-{(marginPolicy.callThreshold * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-danger"></div>
          <span className="text-text-secondary">Margin Call: {(marginPolicy.callThreshold * 100).toFixed(0)}-{(marginPolicy.liquidationThreshold * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-danger"></div>
          <span className="text-text-secondary">Liquidation: &gt; {(marginPolicy.liquidationThreshold * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}