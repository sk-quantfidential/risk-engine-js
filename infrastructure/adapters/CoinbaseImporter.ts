/**
 * Coinbase API Importer
 * Fetches historical hourly candle data from Coinbase Advanced Trade API
 */

import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { PriceBar } from './MarketDataService';

// Coinbase Advanced Trade API endpoint
const COINBASE_API_BASE = 'https://api.exchange.coinbase.com';

// Map our asset types to Coinbase product IDs
const PRODUCT_IDS: Record<AssetType, string> = {
  [AssetType.BTC]: 'BTC-USD',
  [AssetType.ETH]: 'ETH-USD',
  [AssetType.SOL]: 'SOL-USD',
};

interface CoinbaseCandle {
  time: number;      // Unix timestamp
  low: number;
  high: number;
  open: number;
  close: number;
  volume: number;
}

export class CoinbaseImporter {
  /**
   * Fetch historical candles from Coinbase
   * API rate limit: 10 requests/second for public endpoints
   */
  static async fetchCandles(
    asset: AssetType,
    start: Date,
    end: Date,
    granularity: number = 3600 // 3600 seconds = 1 hour
  ): Promise<PriceBar[]> {
    const productId = PRODUCT_IDS[asset];
    const bars: PriceBar[] = [];

    // Coinbase API returns max 300 candles per request
    // For 4 years of hourly data (35,040 candles), we need ~117 requests
    const maxCandles = 300;
    const timeWindow = maxCandles * granularity * 1000; // milliseconds

    let currentStart = start.getTime();
    const endTime = end.getTime();

    console.log(`[CoinbaseImporter] Fetching ${asset} data from ${start.toISOString()} to ${end.toISOString()}`);

    let requestCount = 0;

    while (currentStart < endTime) {
      const currentEnd = Math.min(currentStart + timeWindow, endTime);

      const startISO = new Date(currentStart).toISOString();
      const endISO = new Date(currentEnd).toISOString();

      const url = `${COINBASE_API_BASE}/products/${productId}/candles?start=${startISO}&end=${endISO}&granularity=${granularity}`;

      try {
        requestCount++;
        console.log(`[CoinbaseImporter] Request ${requestCount}: Fetching ${asset} from ${startISO} to ${endISO}`);

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`[CoinbaseImporter] HTTP ${response.status}: ${response.statusText}`);
          throw new Error(`Coinbase API error: ${response.status} ${response.statusText}`);
        }

        const data: number[][] = await response.json();

        // Coinbase returns: [timestamp, low, high, open, close, volume]
        for (const candle of data) {
          const [time, low, high, open, close, volume] = candle;

          bars.push({
            timestamp: new Date(time * 1000), // Convert Unix timestamp to Date
            open,
            high,
            low,
            close,
            volume,
          });
        }

        console.log(`[CoinbaseImporter] Received ${data.length} candles for ${asset}`);

        // Rate limiting: wait 100ms between requests (10 req/sec)
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`[CoinbaseImporter] Error fetching ${asset} data:`, error);
        throw error;
      }

      currentStart = currentEnd;
    }

    // Sort by timestamp (ascending)
    bars.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    console.log(`[CoinbaseImporter] Completed ${asset}: ${bars.length} total candles`);

    return bars;
  }

  /**
   * Fetch 4 years of hourly data for all three assets
   */
  static async fetchAllAssets(
    onProgress?: (asset: AssetType, progress: number) => void
  ): Promise<Record<AssetType, PriceBar[]>> {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 4);

    const results: Record<AssetType, PriceBar[]> = {
      [AssetType.BTC]: [],
      [AssetType.ETH]: [],
      [AssetType.SOL]: [],
    };

    // Fetch sequentially to avoid rate limits
    for (const asset of Object.values(AssetType)) {
      console.log(`[CoinbaseImporter] Starting fetch for ${asset}...`);

      if (onProgress) onProgress(asset, 0);

      results[asset] = await this.fetchCandles(asset, start, end);

      if (onProgress) onProgress(asset, 100);
    }

    return results;
  }

  /**
   * Convert PriceBar array to CSV string
   */
  static barsToCsv(bars: PriceBar[]): string {
    const header = 'timestamp,open,high,low,close,volume\n';
    const rows = bars.map(bar => {
      const timestamp = bar.timestamp.toISOString();
      return `${timestamp},${bar.open},${bar.high},${bar.low},${bar.close},${bar.volume}`;
    }).join('\n');

    return header + rows;
  }

  /**
   * Fetch data and return as CSV strings (ready for MarketDataService)
   */
  static async fetchAllAsCsv(
    onProgress?: (asset: AssetType, progress: number) => void
  ): Promise<Record<AssetType, string>> {
    const barData = await this.fetchAllAssets(onProgress);

    return {
      [AssetType.BTC]: this.barsToCsv(barData[AssetType.BTC]),
      [AssetType.ETH]: this.barsToCsv(barData[AssetType.ETH]),
      [AssetType.SOL]: this.barsToCsv(barData[AssetType.SOL]),
    };
  }
}