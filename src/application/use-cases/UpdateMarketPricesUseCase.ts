/**
 * Update Market Prices Use Case
 *
 * Updates current market prices and returns a new market data snapshot.
 *
 * Clean Architecture: Use cases orchestrate domain entities and infrastructure ports.
 * They contain no business logic themselves - that lives in the domain layer.
 */

import { IMarketDataProvider } from '@/application/ports/IMarketDataProvider';
import {
  UpdateMarketPricesRequest,
  UpdateMarketPricesResponse
} from '@/application/dtos/UpdateMarketPricesDTOs';

export class UpdateMarketPricesUseCase {
  constructor(
    private readonly marketDataProvider: IMarketDataProvider
  ) {}

  /**
   * Execute the use case
   *
   * @param request UpdateMarketPricesRequest with new prices
   * @returns UpdateMarketPricesResponse with updated snapshot
   */
  execute(request: UpdateMarketPricesRequest): UpdateMarketPricesResponse {
    try {
      // Update the prices in the market data provider
      this.marketDataProvider.setCurrentPrices(request.prices);

      // Get the updated snapshot
      const snapshot = this.marketDataProvider.getCurrentSnapshot();

      return new UpdateMarketPricesResponse(snapshot, true);
    } catch (error) {
      // If there's an error, return current snapshot
      const snapshot = this.marketDataProvider.getCurrentSnapshot();
      return new UpdateMarketPricesResponse(snapshot, false);
    }
  }
}
