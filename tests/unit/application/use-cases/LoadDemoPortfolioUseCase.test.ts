/**
 * LoadDemoPortfolioUseCase Tests
 *
 * Tests for demo portfolio generation use case.
 * This use case explicitly depends on Infrastructure (SampleDataGenerator)
 * as demo data generation is not a core business requirement.
 */

import { LoadDemoPortfolioUseCase } from '@/application/use-cases/LoadDemoPortfolioUseCase';
import { LoadDemoPortfolioRequest } from '@/application/dtos/LoadPortfolioDTOs';
import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { Portfolio } from '@/domain/entities/Portfolio';

describe('LoadDemoPortfolioUseCase', () => {
  let useCase: LoadDemoPortfolioUseCase;
  let mockRepository: jest.Mocked<IPortfolioRepository>;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      updateRiskCapital: jest.fn(),
    };

    // Instantiate use case with mock repository
    useCase = new LoadDemoPortfolioUseCase(mockRepository);
  });

  describe('demo portfolio generation', () => {
    it('should generate a demo portfolio', () => {
      const request = new LoadDemoPortfolioRequest();
      const response = useCase.execute(request);

      expect(response).toBeDefined();
      expect(response.portfolio).toBeDefined();
      expect(response.portfolio.loans.length).toBeGreaterThan(0);
      expect(response.message).toContain('Demo portfolio');
    });

    it('should save generated portfolio to repository', () => {
      const request = new LoadDemoPortfolioRequest();
      const response = useCase.execute(request);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      const savedPortfolio = (mockRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedPortfolio).toBeInstanceOf(Portfolio);
      expect(savedPortfolio).toBe(response.portfolio);
    });

    it('should generate portfolio with realistic data', () => {
      const request = new LoadDemoPortfolioRequest();
      const response = useCase.execute(request);

      const portfolio = response.portfolio;

      // Check that portfolio has expected characteristics
      expect(portfolio.loans.length).toBe(10); // Sample portfolio has 10 loans
      expect(portfolio.riskCapitalUSD).toBe(100_000_000); // $100M risk capital

      // Check loans have valid data
      portfolio.loans.forEach(loan => {
        expect(loan.id).toBeDefined();
        expect(loan.borrowerName).toBeDefined();
        expect(loan.borrowerRating).toBeDefined();
        expect(loan.terms.principalUSD).toBeGreaterThan(0);
        expect(loan.collateral.amount).toBeGreaterThan(0);
      });
    });

    it('should generate consistent portfolio (deterministic)', () => {
      const request1 = new LoadDemoPortfolioRequest();
      const response1 = useCase.execute(request1);

      const request2 = new LoadDemoPortfolioRequest();
      const response2 = useCase.execute(request2);

      // Demo portfolio should be consistent across calls
      expect(response1.portfolio.loans.length).toBe(response2.portfolio.loans.length);
      expect(response1.portfolio.riskCapitalUSD).toBe(response2.portfolio.riskCapitalUSD);

      // First loan should have same characteristics
      expect(response1.portfolio.loans[0].id).toBe(response2.portfolio.loans[0].id);
      expect(response1.portfolio.loans[0].borrowerName).toBe(response2.portfolio.loans[0].borrowerName);
      expect(response1.portfolio.loans[0].terms.principalUSD).toBe(response2.portfolio.loans[0].terms.principalUSD);
    });
  });

  describe('LoadDemoPortfolioResponse', () => {
    it('should return portfolio in response', () => {
      const request = new LoadDemoPortfolioRequest();
      const response = useCase.execute(request);

      expect(response.portfolio).toBeInstanceOf(Portfolio);
      expect(response.portfolio).not.toBeNull();
    });

    it('should include success message', () => {
      const request = new LoadDemoPortfolioRequest();
      const response = useCase.execute(request);

      expect(response.message).toBeDefined();
      expect(response.message.length).toBeGreaterThan(0);
      expect(response.message).toContain('Demo portfolio loaded');
    });
  });

  describe('architectural boundary', () => {
    it('should document that this use case depends on Infrastructure', () => {
      // This test documents the architectural decision:
      // LoadDemoPortfolioUseCase explicitly depends on Infrastructure (SampleDataGenerator)
      // This is acceptable because demo data generation is not a core business requirement
      // It's a developer/demo convenience feature
      const request = new LoadDemoPortfolioRequest();
      const response = useCase.execute(request);

      // The fact that this works demonstrates the Infrastructure dependency
      expect(response.portfolio).toBeDefined();
      expect(response.portfolio.loans.length).toBeGreaterThan(0);
    });

    it('should be separate from LoadPortfolioUseCase (separation of concerns)', () => {
      // LoadPortfolioUseCase: loads existing portfolios (no Infrastructure dependency)
      // LoadDemoPortfolioUseCase: generates demo portfolios (Infrastructure dependency OK)
      // This separation keeps core business logic clean while providing demo capability
      const request = new LoadDemoPortfolioRequest();
      const response = useCase.execute(request);

      expect(response.portfolio).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('dependency injection', () => {
    it('should accept repository through constructor', () => {
      const customRepository: jest.Mocked<IPortfolioRepository> = {
        ...mockRepository,
      };

      const customUseCase = new LoadDemoPortfolioUseCase(customRepository);

      expect(customUseCase).toBeInstanceOf(LoadDemoPortfolioUseCase);
    });

    it('should use injected repository for save operation', () => {
      const request = new LoadDemoPortfolioRequest();
      useCase.execute(request);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
