'use client';

import { useMarketData } from '@/components/common/MarketDataProvider';
import { MetricCard } from '@/components/common/MetricCard';
import { PortfolioTable } from '@/components/portfolio/PortfolioTable';
import { AssetPricePanel } from '@/components/portfolio/AssetPricePanel';
import { RiskMetricsPanel } from '@/components/portfolio/RiskMetricsPanel';

export default function DashboardPage() {
  const { marketData, portfolio, marketDataProvider, isLive, toggleLive, updateLoan, updatePrices, reloadWithCSV } = useMarketData();

  if (!marketData || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-mono text-primary mb-2">Loading Portfolio...</div>
          <div className="text-sm text-text-secondary font-mono">Initializing market data</div>
        </div>
      </div>
    );
  }

  const portfolioMetrics = portfolio.calculateMetrics(marketData.prices);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-primary">
            PORTFOLIO OVERVIEW
          </h1>
          <p className="text-sm text-text-secondary font-mono mt-1">
            Real-time risk monitoring and portfolio analytics
          </p>
        </div>
        <button
          onClick={toggleLive}
          className={`px-6 py-3 rounded font-mono font-bold transition-all ${
            isLive
              ? 'bg-danger text-white hover:bg-danger-light'
              : 'bg-primary text-background hover:bg-primary-light'
          }`}
        >
          {isLive ? '⏸ PAUSE LIVE' : '▶ START LIVE'}
        </button>
      </div>

      {/* Asset Prices */}
      <AssetPricePanel
        prices={marketData.prices}
        returns={marketData.returns}
        isLive={isLive}
        onPriceUpdate={updatePrices}
        onCSVImport={reloadWithCSV}
        marketDataProvider={marketDataProvider}
      />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          label="TOTAL EXPOSURE"
          value={`$${(portfolioMetrics.totalExposureUSD / 1_000_000).toFixed(1)}M`}
          subtitle={`${portfolio.loans.length} active loans`}
        />
        <MetricCard
          label="COLLATERAL VALUE"
          value={`$${(portfolioMetrics.totalCollateralValueUSD / 1_000_000).toFixed(1)}M`}
          trend={isLive ? 'up' : 'neutral'}
          trendValue={isLive ? '+0.3%' : '—'}
        />
        <MetricCard
          label="AGGREGATE LTV"
          value={`${(portfolioMetrics.aggregateLTV * 100).toFixed(1)}%`}
          status={
            portfolioMetrics.aggregateLTV > 0.75
              ? 'critical'
              : portfolioMetrics.aggregateLTV > 0.65
              ? 'warning'
              : 'healthy'
          }
        />
        <MetricCard
          label="EXPECTED LOSS"
          value={`$${(portfolioMetrics.totalExpectedLossUSD / 1_000).toFixed(0)}K`}
          subtitle={`${((portfolioMetrics.totalExpectedLossUSD / portfolioMetrics.totalExposureUSD) * 100).toFixed(2)}% of exposure`}
        />
        <MetricCard
          label="DAILY REVENUE"
          value={`$${(portfolioMetrics.totalDailyRevenueUSD / 1_000).toFixed(1)}K`}
          subtitle={`$${(portfolioMetrics.totalDailyRevenueUSD * 365 / 1_000_000).toFixed(2)}M annual`}
          trend="up"
          trendValue="+4.5%"
        />
      </div>

      {/* Risk Metrics */}
      <RiskMetricsPanel portfolioMetrics={portfolioMetrics} riskCapital={portfolio.riskCapitalUSD} />

      {/* Portfolio Table */}
      <div className="panel">
        <h2 className="panel-header">ACTIVE LOANS</h2>
        <PortfolioTable loans={portfolio.loans} prices={marketData.prices} onLoanUpdate={updateLoan} />
      </div>
    </div>
  );
}