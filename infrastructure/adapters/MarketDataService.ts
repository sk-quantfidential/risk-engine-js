/**
 * Market Data Service
 * Generates synthetic price data with realistic correlations and volatility
 */

import { AssetType } from '@/domain/value-objects/CryptoAsset';

export interface PriceBar {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CorrelationMatrix {
  BTC_ETH: number;
  BTC_SOL: number;
  ETH_SOL: number;
}

export interface MarketDataSnapshot {
  timestamp: Date;
  prices: Record<AssetType, number>;
  returns: Record<AssetType, number>;
}

export class MarketDataService {
  private priceHistory: Map<AssetType, PriceBar[]> = new Map();
  private currentPrices: Record<AssetType, number>;
  private correlationMatrix: CorrelationMatrix;

  constructor() {
    // Initialize with realistic starting prices (as of late 2024)
    this.currentPrices = {
      [AssetType.BTC]: 95000,
      [AssetType.ETH]: 3400,
      [AssetType.SOL]: 180,
    };

    // Realistic correlation structure
    this.correlationMatrix = {
      BTC_ETH: 0.82,  // High correlation
      BTC_SOL: 0.68,  // Moderate correlation
      ETH_SOL: 0.75,  // Moderate-high correlation
    };

    this.generateHistoricalData();
  }

  /**
   * Generate 3 years of synthetic hourly price data
   * Uses correlated geometric Brownian motion
   */
  private generateHistoricalData(): void {
    const hoursIn3Years = 3 * 365 * 24;  // ~26,280 hours
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);

    // Asset-specific parameters
    const params = {
      [AssetType.BTC]: { drift: 0.0002, volatility: 0.04 },  // ~50% annual vol
      [AssetType.ETH]: { drift: 0.00025, volatility: 0.052 }, // ~65% annual vol
      [AssetType.SOL]: { drift: 0.0003, volatility: 0.072 },  // ~90% annual vol
    };

    // Starting prices 3 years ago (rough estimates)
    const startPrices = {
      [AssetType.BTC]: 20000,
      [AssetType.ETH]: 1500,
      [AssetType.SOL]: 35,
    };

    // Generate correlated random walks
    for (const asset of Object.values(AssetType)) {
      const bars: PriceBar[] = [];
      let currentPrice = startPrices[asset];

      for (let i = 0; i < hoursIn3Years; i++) {
        const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000);

        // Generate correlated return
        const correlatedReturn = this.generateCorrelatedReturn(
          asset,
          params[asset].drift,
          params[asset].volatility
        );

        // Apply return to get new price
        currentPrice *= (1 + correlatedReturn);

        // Generate OHLCV bar
        const intraHourVol = params[asset].volatility * 0.3;
        const high = currentPrice * (1 + Math.abs(this.randomNormal(0, intraHourVol)));
        const low = currentPrice * (1 - Math.abs(this.randomNormal(0, intraHourVol)));
        const open = currentPrice * (1 + this.randomNormal(0, intraHourVol * 0.5));
        const volume = this.generateVolume(asset);

        bars.push({
          timestamp,
          open,
          high,
          low,
          close: currentPrice,
          volume,
        });
      }

      this.priceHistory.set(asset, bars);
    }

    // Update current prices to end of generated data
    this.currentPrices = {
      [AssetType.BTC]: this.priceHistory.get(AssetType.BTC)![hoursIn3Years - 1].close,
      [AssetType.ETH]: this.priceHistory.get(AssetType.ETH)![hoursIn3Years - 1].close,
      [AssetType.SOL]: this.priceHistory.get(AssetType.SOL)![hoursIn3Years - 1].close,
    };
  }

  private lastReturns: Record<AssetType, number> = {
    [AssetType.BTC]: 0,
    [AssetType.ETH]: 0,
    [AssetType.SOL]: 0,
  };

  private generateCorrelatedReturn(
    asset: AssetType,
    drift: number,
    volatility: number
  ): number {
    // Generate independent normal random variable
    const independentShock = this.randomNormal(0, 1);

    // Apply correlation structure using Cholesky-like decomposition
    let correlatedShock = independentShock;

    if (asset === AssetType.ETH) {
      // ETH correlated with BTC
      correlatedShock = this.correlationMatrix.BTC_ETH * this.lastReturns[AssetType.BTC] +
                        Math.sqrt(1 - this.correlationMatrix.BTC_ETH ** 2) * independentShock;
    } else if (asset === AssetType.SOL) {
      // SOL correlated with both BTC and ETH
      const btcComponent = this.correlationMatrix.BTC_SOL * this.lastReturns[AssetType.BTC];
      const ethComponent = 0.4 * this.lastReturns[AssetType.ETH];
      const residual = Math.sqrt(1 - this.correlationMatrix.BTC_SOL ** 2 - 0.16) * independentShock;
      correlatedShock = btcComponent + ethComponent + residual;
    }

    const returnValue = drift + volatility * correlatedShock;
    this.lastReturns[asset] = correlatedShock;

    return returnValue;
  }

  private randomNormal(mean: number, stdDev: number): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z0;
  }

  private generateVolume(asset: AssetType): number {
    // Generate realistic volume based on asset
    const baseVolumes = {
      [AssetType.BTC]: 20000000000,  // $20B daily avg
      [AssetType.ETH]: 10000000000,  // $10B daily avg
      [AssetType.SOL]: 2000000000,   // $2B daily avg
    };

    const hourlyVolume = baseVolumes[asset] / 24;
    // Add randomness
    return hourlyVolume * (0.5 + Math.random());
  }

  /**
   * Get historical price data for an asset
   */
  getHistory(asset: AssetType, hoursBack?: number): PriceBar[] {
    const history = this.priceHistory.get(asset) || [];
    if (hoursBack) {
      return history.slice(-hoursBack);
    }
    return history;
  }

  /**
   * Get current prices for all assets
   */
  getCurrentPrices(): Record<AssetType, number> {
    return { ...this.currentPrices };
  }

  /**
   * Get price at specific timestamp
   */
  getPriceAtTime(asset: AssetType, timestamp: Date): number | undefined {
    const history = this.priceHistory.get(asset);
    if (!history) return undefined;

    const bar = history.find(b =>
      Math.abs(b.timestamp.getTime() - timestamp.getTime()) < 60 * 60 * 1000
    );
    return bar?.close;
  }

  /**
   * Calculate historical correlation between assets
   */
  calculateHistoricalCorrelation(
    asset1: AssetType,
    asset2: AssetType,
    hoursBack: number = 720  // 30 days default
  ): number {
    const history1 = this.getHistory(asset1, hoursBack);
    const history2 = this.getHistory(asset2, hoursBack);

    if (history1.length !== history2.length) return 0;

    // Calculate returns
    const returns1 = this.calculateReturns(history1);
    const returns2 = this.calculateReturns(history2);

    return this.pearsonCorrelation(returns1, returns2);
  }

  private calculateReturns(bars: PriceBar[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < bars.length; i++) {
      returns.push((bars[i].close - bars[i - 1].close) / bars[i - 1].close);
    }
    return returns;
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let sumSqX = 0;
    let sumSqY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      sumSqX += dx * dx;
      sumSqY += dy * dy;
    }

    const denominator = Math.sqrt(sumSqX * sumSqY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate historical volatility (annualized)
   */
  calculateHistoricalVolatility(asset: AssetType, hoursBack: number = 720): number {
    const history = this.getHistory(asset, hoursBack);
    const returns = this.calculateReturns(history);

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
    const hourlyVol = Math.sqrt(variance);

    // Annualize: sqrt(8760 hours in year)
    return hourlyVol * Math.sqrt(8760);
  }

  /**
   * Calculate maximum drawdown over period
   */
  calculateMaxDrawdown(asset: AssetType, hoursBack: number = 8760): number {
    const history = this.getHistory(asset, hoursBack);
    let maxPrice = history[0]?.close || 0;
    let maxDrawdown = 0;

    for (const bar of history) {
      if (bar.close > maxPrice) {
        maxPrice = bar.close;
      }
      const drawdown = (maxPrice - bar.close) / maxPrice;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * Simulate next price tick (for real-time updates)
   */
  simulateTick(): MarketDataSnapshot {
    const newPrices = { ...this.currentPrices };
    const returns: Record<AssetType, number> = {
      [AssetType.BTC]: 0,
      [AssetType.ETH]: 0,
      [AssetType.SOL]: 0,
    };

    // Simulate small price movements
    for (const asset of Object.values(AssetType)) {
      const volatility = asset === AssetType.BTC ? 0.04 : asset === AssetType.ETH ? 0.052 : 0.072;
      const tickReturn = this.randomNormal(0, volatility / Math.sqrt(24));  // Hourly movement
      newPrices[asset] *= (1 + tickReturn);
      returns[asset] = tickReturn;
    }

    this.currentPrices = newPrices;

    return {
      timestamp: new Date(),
      prices: newPrices,
      returns,
    };
  }

  /**
   * Update correlation matrix (for scenario analysis)
   */
  setCorrelationMatrix(matrix: Partial<CorrelationMatrix>): void {
    this.correlationMatrix = {
      ...this.correlationMatrix,
      ...matrix,
    };
  }

  getCorrelationMatrix(): CorrelationMatrix {
    return { ...this.correlationMatrix };
  }
}