/**
 * DeleteLoanUseCase Tests
 *
 * Clean Architecture Testing: Application Layer
 * - Tests use case orchestration logic
 * - Mocks port interfaces (IPortfolioRepository) ONLY
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DeleteLoanUseCase } from '@/application/use-cases/DeleteLoanUseCase';
import { DeleteLoanRequest } from '@/application/dtos/DeleteLoanDTOs';
import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { CryptoAsset, AssetType } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

describe('DeleteLoanUseCase', () => {
  let useCase: DeleteLoanUseCase;
  let mockRepository: jest.Mocked<IPortfolioRepository>;
  let testPortfolio: Portfolio;
  let testLoan1: Loan;
  let testLoan2: Loan;

  beforeEach(() => {
    testLoan1 = new Loan(
      'LOAN-001',
      'Test Borrower 1',
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

    testLoan2 = new Loan(
      'LOAN-002',
      'Test Borrower 2',
      new CreditRating(RatingTier.BBB),
      {
        principalUSD: 2000000,
        lendingRate: 0.0945,
        costOfCapital: 0.045,
        tenor: 30,
        rollDate: new Date('2025-01-31'),
      },
      new CryptoAsset(AssetType.ETH, 500.0),
      1.5,
      new Date('2025-01-01')
    );

    testPortfolio = new Portfolio([testLoan1, testLoan2], 10000000);

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

    useCase = new DeleteLoanUseCase(mockRepository);
  });

  describe('execute - deleting existing loan', () => {
    it('should delete loan from portfolio', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new DeleteLoanRequest('LOAN-001');
      const response = useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.portfolio!.loans).toHaveLength(1);
      expect(response.portfolio!.loans[0].id).toBe('LOAN-002');
    });

    it('should preserve other loans', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new DeleteLoanRequest('LOAN-001');
      const response = useCase.execute(request);

      const remainingLoan = response.portfolio!.loans[0];
      expect(remainingLoan.terms.principalUSD).toBe(2000000);
    });

    it('should save updated portfolio', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new DeleteLoanRequest('LOAN-001');
      useCase.execute(request);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('execute - error cases', () => {
    it('should return failure when no portfolio exists', () => {
      mockRepository.findAll.mockReturnValue([]);

      const request = new DeleteLoanRequest('LOAN-001');
      const response = useCase.execute(request);

      expect(response.success).toBe(false);
      expect(response.portfolio).toBeNull();
      expect(response.errorMessage).toBeDefined();
    });

    it('should return failure when loan not found', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new DeleteLoanRequest('LOAN-999');
      const response = useCase.execute(request);

      expect(response.success).toBe(false);
      expect(response.errorMessage).toContain('not found');
    });

    it('should not save when loan not found', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new DeleteLoanRequest('LOAN-999');
      useCase.execute(request);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle deleting last loan', () => {
      const singleLoanPortfolio = new Portfolio([testLoan1], 5000000);
      mockRepository.findAll.mockReturnValue([singleLoanPortfolio]);

      const request = new DeleteLoanRequest('LOAN-001');
      const response = useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.portfolio!.loans).toHaveLength(0);
    });
  });
});
