'use client';

import { useMarketData } from '@/components/common/MarketDataProvider';
import { useMemo } from 'react';

export default function OptimizationPage() {
  const { portfolio, marketData } = useMarketData();

  const riskContributions = useMemo(() => {
    if (!portfolio || !marketData) return [];
    return portfolio.calculateRiskContributions(marketData.prices);
  }, [portfolio, marketData]);

  if (!portfolio || !marketData) {
    return <div className="text-center text-text-secondary font-mono">Loading...</div>;
  }

  const portfolioMetrics = portfolio.calculateMetrics(marketData.prices);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold text-primary">
          PORTFOLIO OPTIMIZATION
        </h1>
        <p className="text-sm text-text-secondary font-mono mt-1">
          Marginal risk vs. revenue analysis
        </p>
      </div>

      {/* Current Portfolio Efficiency */}
      <div className="panel">
        <h2 className="panel-header">PORTFOLIO EFFICIENCY METRICS</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="metric-label">Risk-Adjusted Return</div>
            <div className="metric-value text-primary">
              {((portfolioMetrics.totalDailyRevenueUSD * 365 - portfolioMetrics.totalExpectedLossUSD) / portfolioMetrics.valueAtRisk95).toFixed(3)}
            </div>
            <div className="text-xs text-text-muted font-mono mt-1">Revenue per unit VaR</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Capital Efficiency</div>
            <div className="metric-value text-info">
              {((portfolioMetrics.totalExposureUSD / portfolio.riskCapitalUSD) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-text-muted font-mono mt-1">Utilization rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Diversification Ratio</div>
            <div className="metric-value text-warning">
              {(1 / Math.sqrt(portfolioMetrics.concentrationRisk.borrowerConcentration / 10000)).toFixed(2)}
            </div>
            <div className="text-xs text-text-muted font-mono mt-1">1.0 = undiversified</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Loss Rate</div>
            <div className="metric-value text-danger">
              {((portfolioMetrics.totalExpectedLossUSD / portfolioMetrics.totalExposureUSD) * 100).toFixed(2)}%
            </div>
            <div className="text-xs text-text-muted font-mono mt-1">Of total exposure</div>
          </div>
        </div>
      </div>

      {/* Marginal Risk Contributions */}
      <div className="panel">
        <h2 className="panel-header">MARGINAL RISK CONTRIBUTION</h2>
        <p className="text-xs font-mono text-text-secondary mb-4">
          Shows incremental VaR contributed by each loan. High contributors may warrant reduction.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-xs">Loan</th>
                <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-xs">Borrower</th>
                <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Marginal VaR</th>
                <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">% of Portfolio Risk</th>
                <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Annual Revenue</th>
                <th className="text-right py-3 px-2 text-text-secondary font-bold uppercase text-xs">Revenue / Risk</th>
                <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-xs">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {riskContributions
                .sort((a, b) => b.percentOfPortfolioRisk - a.percentOfPortfolioRisk)
                .map(contrib => {
                  const loan = portfolio.loans.find(l => l.id === contrib.loanId)!;
                  const annualRevenue = loan.calculateDailyInterest() * 365;
                  const revenuePerRisk = annualRevenue / (contrib.marginalVaR || 1);

                  let recommendation = 'MAINTAIN';
                  let recColor = 'text-primary';

                  if (contrib.percentOfPortfolioRisk > 15 && revenuePerRisk < 2) {
                    recommendation = 'REDUCE';
                    recColor = 'text-danger';
                  } else if (contrib.percentOfPortfolioRisk < 5 && revenuePerRisk > 3) {
                    recommendation = 'INCREASE';
                    recColor = 'text-primary';
                  } else if (contrib.percentOfPortfolioRisk > 20) {
                    recommendation = 'REVIEW';
                    recColor = 'text-warning';
                  }

                  return (
                    <tr key={contrib.loanId} className="border-b border-border hover:bg-background-tertiary">
                      <td className="py-3 px-2 text-text-primary font-mono">{contrib.loanId}</td>
                      <td className="py-3 px-2 text-text-primary">{contrib.borrowerName}</td>
                      <td className="py-3 px-2 text-right text-warning font-bold">
                        ${(contrib.marginalVaR / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className={`font-bold ${
                          contrib.percentOfPortfolioRisk > 20 ? 'text-danger' :
                          contrib.percentOfPortfolioRisk > 10 ? 'text-warning' :
                          'text-primary'
                        }`}>
                          {contrib.percentOfPortfolioRisk.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-primary font-bold">
                        ${(annualRevenue / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-2 text-right text-info font-bold">
                        {revenuePerRisk.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`font-bold ${recColor}`}>
                          {recommendation}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="panel">
        <h2 className="panel-header">OPTIMIZATION OPPORTUNITIES</h2>
        <div className="space-y-4">
          <div className="p-4 bg-background-tertiary border-l-4 border-primary rounded">
            <div className="text-sm font-mono font-bold text-primary mb-2">✅ DIVERSIFICATION</div>
            <div className="text-sm font-mono text-text-primary">
              HHI of {portfolioMetrics.concentrationRisk.borrowerConcentration.toFixed(0)} suggests moderate concentration.
              Consider adding more borrowers or reducing top 3 exposures by 10-15% to improve diversification.
            </div>
          </div>

          <div className="p-4 bg-background-tertiary border-l-4 border-warning rounded">
            <div className="text-sm font-mono font-bold text-warning mb-2">⚡ ASSET ALLOCATION</div>
            <div className="text-sm font-mono text-text-primary">
              BTC: {portfolioMetrics.concentrationRisk.assetConcentration.BTC.toFixed(0)}% |
              ETH: {portfolioMetrics.concentrationRisk.assetConcentration.ETH.toFixed(0)}% |
              SOL: {portfolioMetrics.concentrationRisk.assetConcentration.SOL.toFixed(0)}%
              <br/>
              Consider rebalancing if any asset exceeds 50% to reduce single-asset correlation risk.
            </div>
          </div>

          <div className="p-4 bg-background-tertiary border-l-4 border-info rounded">
            <div className="text-sm font-mono font-bold text-info mb-2">💡 CAPACITY OPTIMIZATION</div>
            <div className="text-sm font-mono text-text-primary">
              ${((portfolio.riskCapitalUSD - portfolioMetrics.totalExposureUSD) / 1_000_000).toFixed(1)}M
              of unused risk capital. Target loans with Sharpe &gt; 1.5 and LTV &lt; 60% to deploy efficiently.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}