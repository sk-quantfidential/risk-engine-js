/**
 * Market Data Provider Port Interface
 *
 * Defines the contract for market data operations.
 * Infrastructure layer implementations must satisfy this interface.
 *
 * Clean Architecture: Application Layer defines the interface,
 * Infrastructure Layer provides the implementation.
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

export interface MarketDataSnapshot {
  timestamp: Date;
  prices: Record<AssetType, number>;
  returns: Record<AssetType, number>;
}

export interface IMarketDataProvider {
  /**
   * Get current market prices for all assets
   * @returns Record of asset type to current price in USD
   */
  getCurrentPrices(): Record<AssetType, number>;

  /**
   * Get a complete market data snapshot with prices and returns
   * @returns MarketDataSnapshot with timestamp, prices, and returns
   */
  getCurrentSnapshot(): MarketDataSnapshot;

  /**
   * Simulate a price tick (for real-time updates)
   * @returns Updated MarketDataSnapshot after tick
   */
  simulateTick(): MarketDataSnapshot;

  /**
   * Get historical price bars for a specific asset
   * @param asset The asset type to get history for
   * @returns Array of price bars (OHLCV data)
   */
  getPriceHistory(asset: AssetType): PriceBar[];

  /**
   * Set current prices manually (for testing or manual price updates)
   * @param prices Record of asset type to price in USD
   */
  setCurrentPrices(prices: Record<AssetType, number>): void;

  /**
   * Calculate historical volatility for an asset
   * @param asset The asset type
   * @param windowDays Number of days to calculate volatility over
   * @returns Annualized volatility (e.g., 0.50 for 50%)
   */
  calculateVolatility(asset: AssetType, windowDays: number): number;

  /**
   * Get the maximum drawdown for an asset over its history
   * @param asset The asset type
   * @returns Maximum drawdown as a percentage (e.g., 0.65 for 65% drawdown)
   */
  getMaxDrawdown(asset: AssetType): number;
}
