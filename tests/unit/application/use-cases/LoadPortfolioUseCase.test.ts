/**
 * LoadPortfolioUseCase Tests
 *
 * Clean Architecture Testing: Application Layer
 * - Tests use case orchestration logic
 * - Mocks port interfaces (IPortfolioRepository) ONLY
 * - Does NOT test business logic (that's in domain layer)
 * - Verifies DTO construction and error handling
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { LoadPortfolioUseCase } from '@/application/use-cases/LoadPortfolioUseCase';
import { LoadPortfolioRequest } from '@/application/dtos/LoadPortfolioDTOs';
import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { CryptoAsset, AssetType } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

describe('LoadPortfolioUseCase', () => {
  let useCase: LoadPortfolioUseCase;
  let mockRepository: jest.Mocked<IPortfolioRepository>;
  let testPortfolio: Portfolio;
  let testLoan: Loan;

  beforeEach(() => {
    // Create test loan
    testLoan = new Loan(
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

    // Create test portfolio
    testPortfolio = new Portfolio([testLoan], 10000000);

    // Create mock repository
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

    // Create use case with mocked repository
    useCase = new LoadPortfolioUseCase(mockRepository);
  });

  describe('execute - with specific portfolio ID', () => {
    it('should load portfolio by ID when found', () => {
      const portfolioId = 'PORTFOLIO-123';
      mockRepository.findById.mockReturnValue(testPortfolio);

      const request = new LoadPortfolioRequest(portfolioId);
      const response = useCase.execute(request);

      expect(mockRepository.findById).toHaveBeenCalledWith(portfolioId);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(response.portfolio).toBe(testPortfolio);
      expect(response.success).toBe(true);
      expect(response.wasCreated).toBe(false);
    });

    it('should return null when portfolio ID not found', () => {
      const portfolioId = 'NON-EXISTENT';
      mockRepository.findById.mockReturnValue(null);

      const request = new LoadPortfolioRequest(portfolioId);
      const response = useCase.execute(request);

      expect(mockRepository.findById).toHaveBeenCalledWith(portfolioId);
      expect(response.portfolio).toBeNull();
      expect(response.success).toBe(false);
      expect(response.wasCreated).toBe(false);
    });

    it('should not call findAll when specific ID provided', () => {
      const portfolioId = 'PORTFOLIO-123';
      mockRepository.findById.mockReturnValue(testPortfolio);

      const request = new LoadPortfolioRequest(portfolioId);
      useCase.execute(request);

      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });

    it('should not save when loading by ID', () => {
      const portfolioId = 'PORTFOLIO-123';
      mockRepository.findById.mockReturnValue(testPortfolio);

      const request = new LoadPortfolioRequest(portfolioId);
      useCase.execute(request);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('execute - without specific portfolio ID', () => {
    it('should load first portfolio when portfolios exist', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new LoadPortfolioRequest();
      const response = useCase.execute(request);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(response.portfolio).toBe(testPortfolio);
      expect(response.success).toBe(true);
      expect(response.wasCreated).toBe(false);
    });

    it('should load first portfolio from multiple portfolios', () => {
      const portfolio2 = new Portfolio([testLoan], 5000000);
      mockRepository.findAll.mockReturnValue([testPortfolio, portfolio2]);

      const request = new LoadPortfolioRequest();
      const response = useCase.execute(request);

      expect(response.portfolio).toBe(testPortfolio);
      expect(response.success).toBe(true);
    });

    it('should return null when no portfolio exists', () => {
      mockRepository.findAll.mockReturnValue([]);

      const request = new LoadPortfolioRequest();
      const response = useCase.execute(request);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(response.portfolio).toBeNull();
      expect(response.success).toBe(false);
      expect(response.wasCreated).toBe(false);
    });

    it('should not auto-create portfolio (separation of concerns)', () => {
      mockRepository.findAll.mockReturnValue([]);

      const request = new LoadPortfolioRequest();
      const response = useCase.execute(request);

      // LoadPortfolioUseCase does NOT auto-create portfolios
      // Demo data creation is handled by LoadDemoPortfolioUseCase
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(response.portfolio).toBeNull();
    });

    it('should delegate demo portfolio creation to LoadDemoPortfolioUseCase', () => {
      // This test documents the architectural decision:
      // LoadPortfolioUseCase is for loading existing portfolios only
      // LoadDemoPortfolioUseCase is for demo/sample data generation
      // The Presentation layer (MarketDataProvider) orchestrates both
      mockRepository.findAll.mockReturnValue([]);

      const response = useCase.execute(new LoadPortfolioRequest());

      expect(response.portfolio).toBeNull();
      // Caller (Presentation) will check for null and use LoadDemoPortfolioUseCase
    });
  });

  describe('LoadPortfolioRequest DTO', () => {
    it('should create request with portfolio ID', () => {
      const request = new LoadPortfolioRequest('PORTFOLIO-123');

      expect(request.portfolioId).toBe('PORTFOLIO-123');
    });

    it('should create request without portfolio ID', () => {
      const request = new LoadPortfolioRequest();

      expect(request.portfolioId).toBeUndefined();
    });
  });

  describe('LoadPortfolioResponse DTO', () => {
    it('should indicate success when portfolio is loaded', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const response = useCase.execute(new LoadPortfolioRequest());

      expect(response.success).toBe(true);
      expect(response.portfolio).not.toBeNull();
    });

    it('should indicate failure when portfolio is null', () => {
      mockRepository.findById.mockReturnValue(null);

      const response = useCase.execute(new LoadPortfolioRequest('NON-EXISTENT'));

      expect(response.success).toBe(false);
      expect(response.portfolio).toBeNull();
    });

    it('should never indicate wasCreated (LoadPortfolioUseCase does not create)', () => {
      // LoadPortfolioUseCase never creates portfolios, so wasCreated is always false
      mockRepository.findAll.mockReturnValue([]);

      const response = useCase.execute(new LoadPortfolioRequest());

      expect(response.wasCreated).toBe(false);
      expect(response.portfolio).toBeNull();
    });

    it('should not indicate wasCreated when existing portfolio loaded', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const response = useCase.execute(new LoadPortfolioRequest());

      expect(response.wasCreated).toBe(false);
    });
  });

  describe('dependency injection', () => {
    it('should accept repository through constructor', () => {
      const customRepository: jest.Mocked<IPortfolioRepository> = {
        ...mockRepository,
      };

      const customUseCase = new LoadPortfolioUseCase(customRepository);

      expect(customUseCase).toBeDefined();
    });

    it('should use injected repository for operations', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new LoadPortfolioRequest();
      useCase.execute(request);

      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });
});
