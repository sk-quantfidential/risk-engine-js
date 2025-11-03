/**
 * Price History Service Port Interface
 *
 * Defines the contract for historical price data management.
 * Infrastructure layer implementations must satisfy this interface.
 *
 * Clean Architecture: Application Layer defines the interface,
 * Infrastructure Layer provides the implementation.
 */

import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { PriceBar } from './IMarketDataProvider';

export interface IPriceHistoryService {
  /**
   * Load historical price data from CSV strings
   * @param csvData Record of asset type to CSV string (format: timestamp,open,high,low,close,volume)
   */
  loadFromCSV(csvData: Record<AssetType, string>): void;

  /**
   * Generate synthetic historical price data
   * Used when no real data is available
   */
  generateHistoricalData(): void;

  /**
   * Get historical price bars for a specific asset
   * @param asset The asset type
   * @returns Array of price bars (OHLCV data)
   */
  getHistory(asset: AssetType): PriceBar[];

  /**
   * Get price history for a specific date range
   * @param asset The asset type
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Array of price bars within the date range
   */
  getHistoryRange(asset: AssetType, startDate: Date, endDate: Date): PriceBar[];

  /**
   * Check if historical data exists for an asset
   * @param asset The asset type
   * @returns true if history exists, false otherwise
   */
  hasHistory(asset: AssetType): boolean;

  /**
   * Get the earliest timestamp in the historical data
   * @param asset The asset type
   * @returns Earliest timestamp, or null if no data exists
   */
  getEarliestTimestamp(asset: AssetType): Date | null;

  /**
   * Get the latest timestamp in the historical data
   * @param asset The asset type
   * @returns Latest timestamp, or null if no data exists
   */
  getLatestTimestamp(asset: AssetType): Date | null;
}
