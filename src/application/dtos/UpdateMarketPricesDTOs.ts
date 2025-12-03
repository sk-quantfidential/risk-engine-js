/**
 * Update Market Prices Use Case DTOs
 *
 * Request and Response data transfer objects for updating market prices.
 */

import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { MarketDataSnapshot } from '@/application/ports/IMarketDataProvider';

/**
 * Request to update market prices
 */
export class UpdateMarketPricesRequest {
  constructor(
    public readonly prices: Record<AssetType, number>
  ) {}
}

/**
 * Response from updating market prices
 */
export class UpdateMarketPricesResponse {
  constructor(
    public readonly snapshot: MarketDataSnapshot,
    public readonly success: boolean
  ) {}
}
