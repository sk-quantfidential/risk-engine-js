/**
 * Import CSV Data Use Case DTOs
 *
 * Request and Response data transfer objects for importing CSV price data.
 */

import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { MarketDataSnapshot } from '@/application/ports/IMarketDataProvider';

/**
 * Request to import CSV price data
 */
export class ImportCSVDataRequest {
  constructor(
    public readonly csvData: Record<AssetType, string>
  ) {}
}

/**
 * Response from importing CSV data
 */
export class ImportCSVDataResponse {
  constructor(
    public readonly snapshot: MarketDataSnapshot,
    public readonly success: boolean,
    public readonly recordsImported: number = 0,
    public readonly errorMessage?: string
  ) {}
}
