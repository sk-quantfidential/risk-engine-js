'use client';

import { useMarketData } from '@/components/common/MarketDataProvider';
import { ScenarioComparison } from '@/components/analytics/ScenarioComparison';
import { PDCurveChart } from '@/components/analytics/PDCurveChart';
import { ScenarioService } from '@/infrastructure/adapters/ScenarioService';
import { useState, useMemo } from 'react';

export default function ScenariosPage() {
  const { portfolio, marketData } = useMarketData();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['stable-growth', 'covid-crash']);

  const scenarioService = useMemo(() => new ScenarioService(), []);
  const allScenarios = useMemo(() => scenarioService.getAllScenarios(), [scenarioService]);

  if (!portfolio || !marketData) {
    return <div className="text-center text-text-secondary font-mono">Loading...</div>;
  }

  const toggleScenario = (scenarioId: string) => {
    setSelectedScenarios(prev =>
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold text-primary">
          SCENARIO LABORATORY
        </h1>
        <p className="text-sm text-text-secondary font-mono mt-1">
          Stress testing with realistic market scenarios
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="panel">
        <h2 className="panel-header">SELECT SCENARIOS TO COMPARE</h2>
        <div className="grid grid-cols-5 gap-3">
          {allScenarios.map(scenario => {
            const scenarioId = scenarioService.getScenarioIds().find(
              id => scenarioService.getScenario(id)?.name === scenario.name
            );
            const isSelected = scenarioId ? selectedScenarios.includes(scenarioId) : false;

            return (
              <button
                key={scenario.name}
                onClick={() => scenarioId && toggleScenario(scenarioId)}
                className={`
                  p-4 rounded border-2 transition-all text-left
                  ${isSelected
                    ? 'border-primary bg-background-tertiary'
                    : 'border-border hover:border-border-light bg-background-secondary'
                  }
                `}
              >
                <div className="text-sm font-mono font-bold text-text-primary mb-2">
                  {scenario.name}
                </div>
                <div className="text-xs font-mono text-text-muted mb-3">
                  {scenario.timeframe}
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Drawdown:</span>
                    <span className={`font-bold ${scenario.marketDrawdown > 0.3 ? 'text-danger' : 'text-warning'}`}>
                      {(scenario.marketDrawdown * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">PD Mult:</span>
                    <span className={`font-bold ${scenario.pdMultiplier > 2 ? 'text-danger' : 'text-warning'}`}>
                      {scenario.pdMultiplier.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PD Curves */}
      <PDCurveChart
        portfolio={portfolio}
        scenarioService={scenarioService}
        selectedScenarios={selectedScenarios}
      />

      {/* Scenario Comparison Table */}
      <ScenarioComparison
        portfolio={portfolio}
        currentPrices={marketData.prices}
        scenarioService={scenarioService}
        selectedScenarios={selectedScenarios}
      />
    </div>
  );
}