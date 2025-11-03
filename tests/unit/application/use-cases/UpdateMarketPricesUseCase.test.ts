/**
 * UpdateMarketPricesUseCase Tests - Application Layer
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { UpdateMarketPricesUseCase } from '@/application/use-cases/UpdateMarketPricesUseCase';
import { UpdateMarketPricesRequest } from '@/application/dtos/UpdateMarketPricesDTOs';
import { IMarketDataProvider } from '@/application/ports/IMarketDataProvider';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

describe('UpdateMarketPricesUseCase', () => {
  let useCase: UpdateMarketPricesUseCase;
  let mockProvider: jest.Mocked<IMarketDataProvider>;

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

    useCase = new UpdateMarketPricesUseCase(mockProvider);
  });

  it('should update prices and return snapshot', () => {
    const prices = { [AssetType.BTC]: 100000, [AssetType.ETH]: 4000, [AssetType.SOL]: 200 };
    const snapshot = { timestamp: new Date(), prices, returns: { [AssetType.BTC]: 0, [AssetType.ETH]: 0, [AssetType.SOL]: 0 } };
    
    mockProvider.getCurrentSnapshot.mockReturnValue(snapshot);

    const request = new UpdateMarketPricesRequest(prices);
    const response = useCase.execute(request);

    expect(mockProvider.setCurrentPrices).toHaveBeenCalledWith(prices);
    expect(response.success).toBe(true);
    expect(response.snapshot).toBe(snapshot);
  });

  it('should handle errors gracefully', () => {
    const prices = { [AssetType.BTC]: 100000, [AssetType.ETH]: 4000, [AssetType.SOL]: 200 };
    
    mockProvider.setCurrentPrices.mockImplementation(() => { throw new Error('Test error'); });
    mockProvider.getCurrentSnapshot.mockReturnValue({ 
      timestamp: new Date(), 
      prices, 
      returns: { [AssetType.BTC]: 0, [AssetType.ETH]: 0, [AssetType.SOL]: 0 } 
    });

    const request = new UpdateMarketPricesRequest(prices);
    const response = useCase.execute(request);

    expect(response.success).toBe(false);
  });
});
