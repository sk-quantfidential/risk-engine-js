'use client';

import React, { useMemo } from 'react';
import { Portfolio } from '@/domain/entities/Portfolio';
import { ScenarioService } from '@/infrastructure/adapters/ScenarioService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PDCurveChartProps {
  portfolio: Portfolio;
  scenarioService: ScenarioService;
  selectedScenarios: string[];
}

export function PDCurveChart({ portfolio, scenarioService, selectedScenarios }: PDCurveChartProps) {
  const chartData = useMemo(() => {
    const horizons = [1, 3, 5, 7, 14, 30, 60, 90, 180, 365];

    // Calculate average PD for each scenario at each horizon
    const data = horizons.map(days => {
      const point: any = { days };

      selectedScenarios.forEach(scenarioId => {
        const scenario = scenarioService.getScenario(scenarioId);
        if (!scenario) return;

        // Calculate weighted average PD across all loans
        let totalPD = 0;
        let totalWeight = 0;

        portfolio.loans.forEach(loan => {
          const basePD = loan.borrowerRating.annualPD;
          const stressedPD = scenarioService.calculateStressedPD(basePD, scenario, loan.leverage);
          const horizonPD = stressedPD * (days / 365);
          const weight = loan.terms.principalUSD;

          totalPD += horizonPD * weight;
          totalWeight += weight;
        });

        const avgPD = totalWeight > 0 ? (totalPD / totalWeight) * 100 : 0;
        point[scenario.name] = avgPD;
      });

      return point;
    });

    return data;
  }, [portfolio, scenarioService, selectedScenarios]);

  const scenarioColors: Record<string, string> = {
    'Bull Market Rally': '#00ff88',
    '2020 COVID Crash': '#ff3366',
    '2022 Luna/FTX Collapse': '#ff5c85',
    'Stable Growth': '#00ccff',
    'High Volatility Regime': '#ffaa00',
  };

  return (
    <div className="panel">
      <h2 className="panel-header">PROBABILITY OF DEFAULT CURVES</h2>

      <div className="mb-4 p-4 bg-background-tertiary border border-border-light rounded">
        <div className="text-xs font-mono text-text-secondary mb-1">📈 INTERPRETATION</div>
        <div className="text-sm font-mono text-text-primary">
          PD curves show portfolio-weighted average probability of default over various time horizons.
          Steeper curves indicate higher near-term default risk. Wrong-way risk amplifies PD during market stress.
        </div>
      </div>

      <div className="bg-background-tertiary rounded p-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="days"
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
              label={{ value: 'Days', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af', fontFamily: 'monospace' } }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
              label={{ value: 'PD %', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontFamily: 'monospace' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111820',
                border: '1px solid #374151',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
              formatter={(value: any) => `${value.toFixed(3)}%`}
            />
            <Legend
              wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
            />

            {selectedScenarios.map(scenarioId => {
              const scenario = scenarioService.getScenario(scenarioId);
              if (!scenario) return null;

              return (
                <Line
                  key={scenarioId}
                  type="monotone"
                  dataKey={scenario.name}
                  stroke={scenarioColors[scenario.name] || '#9ca3af'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}