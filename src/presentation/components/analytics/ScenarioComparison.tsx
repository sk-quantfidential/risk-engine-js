'use client';

import React, { useMemo } from 'react';
import { Portfolio } from '@/domain/entities/Portfolio';
import { ScenarioService } from '@/infrastructure/adapters/ScenarioService';
import { ScenarioParameters } from '@/application/ports/IScenarioService';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

interface ScenarioComparisonProps {
  portfolio: Portfolio;
  currentPrices: Record<AssetType, number>;
  scenarioService: ScenarioService;
  selectedScenarios: string[];
}

interface ScenarioMetrics {
  scenarioName: string;
  stressedPrices: Record<AssetType, number>;
  portfolioMetrics: any;
  totalExpectedLoss: number;
  totalRevenue: number;
  netReturn: number;
  sharpeRatio: number;
}

export function ScenarioComparison({ portfolio, currentPrices, scenarioService, selectedScenarios }: ScenarioComparisonProps) {
  const scenarioMetrics = useMemo<ScenarioMetrics[]>(() => {
    return selectedScenarios.map(scenarioId => {
      const scenario = scenarioService.getScenario(scenarioId);
      if (!scenario) return null;

      const stressedPrices = scenarioService.applyScenarioPrices(currentPrices, scenario);
      const portfolioMetrics = portfolio.calculateMetrics(stressedPrices, scenario.marketDrawdown);

      const totalRevenue = portfolioMetrics.totalDailyRevenueUSD * 365;
      const totalExpectedLoss = portfolioMetrics.totalExpectedLossUSD * scenario.pdMultiplier;
      const netReturn = totalRevenue - totalExpectedLoss;
      const sharpeRatio = netReturn / (portfolioMetrics.valueAtRisk95 || 1);

      return {
        scenarioName: scenario.name,
        stressedPrices,
        portfolioMetrics,
        totalExpectedLoss,
        totalRevenue,
        netReturn,
        sharpeRatio,
      };
    }).filter(Boolean) as ScenarioMetrics[];
  }, [portfolio, currentPrices, scenarioService, selectedScenarios]);

  const formatMoney = (amount: number): string => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    return `$${(amount / 1_000).toFixed(0)}K`;
  };

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="panel">
      <h2 className="panel-header">SCENARIO COMPARISON MATRIX</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-xs">Scenario</th>
              <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">BTC Price</th>
              <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">ETH Price</th>
              <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">SOL Price</th>
              <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Avg LTV</th>
              <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Expected Loss</th>
              <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Annual Revenue</th>
              <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Net Return</th>
              <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">95% VaR</th>
              <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Risk Ratio</th>
            </tr>
          </thead>
          <tbody>
            {scenarioMetrics.map(metrics => (
              <tr
                key={metrics.scenarioName}
                className="border-b border-border hover:bg-background-tertiary transition-colors"
              >
                <td className="py-3 px-2 text-text-primary font-bold">
                  {metrics.scenarioName}
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="text-text-primary">{formatMoney(metrics.stressedPrices.BTC)}</div>
                  <div className={`text-xs ${
                    metrics.stressedPrices.BTC >= currentPrices.BTC ? 'text-primary' : 'text-danger'
                  }`}>
                    {((metrics.stressedPrices.BTC / currentPrices.BTC - 1) * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="text-text-primary">{formatMoney(metrics.stressedPrices.ETH)}</div>
                  <div className={`text-xs ${
                    metrics.stressedPrices.ETH >= currentPrices.ETH ? 'text-primary' : 'text-danger'
                  }`}>
                    {((metrics.stressedPrices.ETH / currentPrices.ETH - 1) * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="text-text-primary">{formatMoney(metrics.stressedPrices.SOL)}</div>
                  <div className={`text-xs ${
                    metrics.stressedPrices.SOL >= currentPrices.SOL ? 'text-primary' : 'text-danger'
                  }`}>
                    {((metrics.stressedPrices.SOL / currentPrices.SOL - 1) * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={`font-bold ${
                    metrics.portfolioMetrics.aggregateLTV > 0.75 ? 'text-danger' :
                    metrics.portfolioMetrics.aggregateLTV > 0.65 ? 'text-warning' :
                    'text-primary'
                  }`}>
                    {formatPercent(metrics.portfolioMetrics.aggregateLTV)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-danger font-bold">
                  {formatMoney(metrics.totalExpectedLoss)}
                </td>
                <td className="py-3 px-2 text-right text-primary font-bold">
                  {formatMoney(metrics.totalRevenue)}
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={metrics.netReturn > 0 ? 'text-primary font-bold' : 'text-danger font-bold'}>
                    {formatMoney(metrics.netReturn)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-warning font-bold">
                  {formatMoney(metrics.portfolioMetrics.valueAtRisk95)}
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={`font-bold ${
                    metrics.sharpeRatio > 1 ? 'text-primary' :
                    metrics.sharpeRatio > 0.5 ? 'text-warning' :
                    'text-danger'
                  }`}>
                    {metrics.sharpeRatio.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Wrong-Way Risk Explanation */}
      <div className="mt-6 p-4 bg-background-tertiary border border-danger rounded">
        <div className="text-xs font-mono text-danger mb-2 font-bold">⚠️ WRONG-WAY RISK AMPLIFICATION</div>
        <div className="text-sm font-mono text-text-primary">
          In stress scenarios, defaults become correlated with collateral drawdowns. The stressed PD incorporates
          wrong-way risk: <code className="text-primary">PD_stressed = PD_base × PD_multiplier × (1 + drawdown × leverage)</code>.
          This captures the empirical observation that leveraged counterparties are more likely to default during
          market crashes when collateral values are already impaired.
        </div>
      </div>
    </div>
  );
}