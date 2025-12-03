/**
 * Import CSV Data Use Case
 *
 * Imports historical price data from CSV files and returns updated market snapshot.
 *
 * Clean Architecture: Use cases orchestrate domain entities and infrastructure ports.
 * They contain no business logic themselves - that lives in the domain layer.
 */

import { IMarketDataProvider } from '@/application/ports/IMarketDataProvider';
import { IPriceHistoryService } from '@/application/ports/IPriceHistoryService';
import {
  ImportCSVDataRequest,
  ImportCSVDataResponse
} from '@/application/dtos/ImportCSVDataDTOs';

export class ImportCSVDataUseCase {
  constructor(
    private readonly marketDataProvider: IMarketDataProvider,
    private readonly priceHistoryService: IPriceHistoryService
  ) {}

  /**
   * Execute the use case
   *
   * @param request ImportCSVDataRequest with CSV data
   * @returns ImportCSVDataResponse with updated snapshot and import stats
   */
  execute(request: ImportCSVDataRequest): ImportCSVDataResponse {
    try {
      // Load the CSV data into the price history service
      this.priceHistoryService.loadFromCSV(request.csvData);

      // Count records imported
      let recordsImported = 0;
      const assetTypes = Object.keys(request.csvData);
      for (const assetType of assetTypes) {
        const lines = request.csvData[assetType as keyof typeof request.csvData].split('\n');
        // Subtract 1 for header line
        recordsImported += Math.max(0, lines.length - 1);
      }

      // Get updated market snapshot
      const snapshot = this.marketDataProvider.getCurrentSnapshot();

      return new ImportCSVDataResponse(
        snapshot,
        true,
        recordsImported
      );
    } catch (error) {
      // Return error response
      const snapshot = this.marketDataProvider.getCurrentSnapshot();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during CSV import';

      return new ImportCSVDataResponse(
        snapshot,
        false,
        0,
        errorMessage
      );
    }
  }
}
