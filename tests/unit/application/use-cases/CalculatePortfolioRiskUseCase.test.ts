/**
 * CalculatePortfolioRiskUseCase Tests - Application Layer
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CalculatePortfolioRiskUseCase } from '@/application/use-cases/CalculatePortfolioRiskUseCase';
import { CalculatePortfolioRiskRequest } from '@/application/dtos/CalculatePortfolioRiskDTOs';
import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { CryptoAsset, AssetType } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

describe('CalculatePortfolioRiskUseCase', () => {
  let useCase: CalculatePortfolioRiskUseCase;
  let mockRepository: jest.Mocked<IPortfolioRepository>;
  let testPortfolio: Portfolio;

  beforeEach(() => {
    const testLoan = new Loan(
      'LOAN-001',
      'Test Borrower',
      new CreditRating(RatingTier.A),
      {
        principalUSD: 1000000,
        lendingRate: 0.0945,
        costOfCapital: 0.045,
        tenor: 30,
        rollDate: new Date('2025-01-31'),
      },
      new CryptoAsset(AssetType.BTC, 10.0),
      2.0,
      new Date('2025-01-01')
    );
    
    testPortfolio = new Portfolio([testLoan], 10000000);

    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      saveLoan: jest.fn(),
      deleteLoan: jest.fn(),
      updateRiskCapital: jest.fn(),
      hasData: jest.fn(),
      getLastUpdated: jest.fn(),
      clearAll: jest.fn(),
    } as jest.Mocked<IPortfolioRepository>;

    useCase = new CalculatePortfolioRiskUseCase(mockRepository);
  });

  it('should calculate risk metrics for portfolio', () => {
    mockRepository.findById.mockReturnValue(testPortfolio);
    
    const prices = { [AssetType.BTC]: 100000, [AssetType.ETH]: 4000, [AssetType.SOL]: 200 };
    const request = new CalculatePortfolioRiskRequest('PORTFOLIO-001', prices);
    const response = useCase.execute(request);

    expect(mockRepository.findById).toHaveBeenCalledWith('PORTFOLIO-001');
    expect(response.success).toBe(true);
    expect(response.metrics).toBeDefined();
    expect(response.metrics!.totalExposureUSD).toBe(1000000);
  });

  it('should handle portfolio not found error', () => {
    mockRepository.findById.mockReturnValue(null);
    mockRepository.findAll.mockReturnValue([]);
    
    const prices = { [AssetType.BTC]: 100000, [AssetType.ETH]: 4000, [AssetType.SOL]: 200 };
    const request = new CalculatePortfolioRiskRequest('INVALID', prices);
    
    expect(() => useCase.execute(request)).toThrow('No portfolio found - cannot calculate risk metrics');
  });

  it('should fallback to first portfolio if ID not found', () => {
    mockRepository.findById.mockReturnValue(null);
    mockRepository.findAll.mockReturnValue([testPortfolio]);
    
    const prices = { [AssetType.BTC]: 100000, [AssetType.ETH]: 4000, [AssetType.SOL]: 200 };
    const request = new CalculatePortfolioRiskRequest('INVALID', prices);
    const response = useCase.execute(request);

    expect(response.success).toBe(true);
    expect(response.metrics).toBeDefined();
  });
});
