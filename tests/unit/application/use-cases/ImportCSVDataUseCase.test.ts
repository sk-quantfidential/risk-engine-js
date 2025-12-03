/**
 * ImportCSVDataUseCase Tests - Application Layer
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ImportCSVDataUseCase } from '@/application/use-cases/ImportCSVDataUseCase';
import { ImportCSVDataRequest } from '@/application/dtos/ImportCSVDataDTOs';
import { IMarketDataProvider } from '@/application/ports/IMarketDataProvider';
import { IPriceHistoryService } from '@/application/ports/IPriceHistoryService';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

describe('ImportCSVDataUseCase', () => {
  let useCase: ImportCSVDataUseCase;
  let mockProvider: jest.Mocked<IMarketDataProvider>;
  let mockHistoryService: jest.Mocked<IPriceHistoryService>;

  beforeEach(() => {
    mockProvider = {
      getCurrentPrices: jest.fn(),
      getCurrentSnapshot: jest.fn(),
      setCurrentPrices: jest.fn(),
      simulateTick: jest.fn(),
      getPriceHistory: jest.fn(),
      calculateVolatility: jest.fn(),
      getMaxDrawdown: jest.fn(),
    } as jest.Mocked<IMarketDataProvider>;

    mockHistoryService = {
      loadFromCSV: jest.fn(),
      generateHistoricalData: jest.fn(),
      getPriceHistory: jest.fn(),
      getHistoryRange: jest.fn(),
      hasHistory: jest.fn(),
      getEarliestTimestamp: jest.fn(),
      getLatestTimestamp: jest.fn(),
    } as jest.Mocked<IPriceHistoryService>;

    useCase = new ImportCSVDataUseCase(mockProvider, mockHistoryService);
  });

  it('should import CSV data and return snapshot', () => {
    const csvData = { [AssetType.BTC]: 'timestamp,open,high,low,close,volume\n', [AssetType.ETH]: '', [AssetType.SOL]: '' };
    const snapshot = { 
      timestamp: new Date(), 
      prices: { [AssetType.BTC]: 100000, [AssetType.ETH]: 4000, [AssetType.SOL]: 200 },
      returns: { [AssetType.BTC]: 0, [AssetType.ETH]: 0, [AssetType.SOL]: 0 }
    };
    
    mockProvider.getCurrentSnapshot.mockReturnValue(snapshot);

    const request = new ImportCSVDataRequest(csvData);
    const response = useCase.execute(request);

    expect(mockHistoryService.loadFromCSV).toHaveBeenCalledWith(csvData);
    expect(response.success).toBe(true);
    expect(response.snapshot).toBe(snapshot);
  });

  it('should handle import errors', () => {
    const csvData = { [AssetType.BTC]: 'invalid', [AssetType.ETH]: '', [AssetType.SOL]: '' };
    
    mockHistoryService.loadFromCSV.mockImplementation(() => { throw new Error('Parse error'); });

    const request = new ImportCSVDataRequest(csvData);
    const response = useCase.execute(request);

    expect(response.success).toBe(false);
    expect(response.errorMessage).toBeDefined();
  });
});
