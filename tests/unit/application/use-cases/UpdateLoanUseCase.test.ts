/**
 * UpdateLoanUseCase Tests
 *
 * Clean Architecture Testing: Application Layer
 * - Tests use case orchestration logic
 * - Mocks port interfaces (IPortfolioRepository) ONLY
 * - Does NOT test business logic (that's in domain layer)
 * - Verifies DTO construction and error handling
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { UpdateLoanUseCase } from '@/application/use-cases/UpdateLoanUseCase';
import { UpdateLoanRequest } from '@/application/dtos/UpdateLoanDTOs';
import { IPortfolioRepository } from '@/application/ports/IPortfolioRepository';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { CryptoAsset, AssetType } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

describe('UpdateLoanUseCase', () => {
  let useCase: UpdateLoanUseCase;
  let mockRepository: jest.Mocked<IPortfolioRepository>;
  let testPortfolio: Portfolio;
  let testLoan1: Loan;
  let testLoan2: Loan;
  let updatedLoan: Loan;

  beforeEach(() => {
    // Create test loans
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

    // Updated version of testLoan1 with different principal
    updatedLoan = new Loan(
      'LOAN-001', // Same ID
      'Test Borrower 1',
      new CreditRating(RatingTier.A),
      {
        principalUSD: 1500000, // Changed from 1M to 1.5M
        lendingRate: 0.0945,
        costOfCapital: 0.045,
        tenor: 30,
        rollDate: new Date('2025-01-31'),
      },
      new CryptoAsset(AssetType.BTC, 15.0), // Changed from 10 to 15
      2.0,
      new Date('2025-01-01')
    );

    // Create test portfolio with two loans
    testPortfolio = new Portfolio([testLoan1, testLoan2], 10000000);

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
    useCase = new UpdateLoanUseCase(mockRepository);
  });

  describe('execute - updating existing loan', () => {
    it('should update existing loan in portfolio', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      const response = useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.portfolio).not.toBeNull();
      expect(response.errorMessage).toBeUndefined();
    });

    it('should replace existing loan with updated version', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      const response = useCase.execute(request);

      const updatedLoanInPortfolio = response.portfolio!.loans.find(
        l => l.id === 'LOAN-001'
      );

      expect(updatedLoanInPortfolio).toBeDefined();
      expect(updatedLoanInPortfolio!.terms.principalUSD).toBe(1500000);
      expect(updatedLoanInPortfolio!.collateral.amount).toBe(15.0);
    });

    it('should preserve other loans when updating one', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      const response = useCase.execute(request);

      expect(response.portfolio!.loans).toHaveLength(2);
      const loan2 = response.portfolio!.loans.find(l => l.id === 'LOAN-002');
      expect(loan2).toBeDefined();
      expect(loan2!.terms.principalUSD).toBe(2000000); // Unchanged
    });

    it('should preserve portfolio risk capital', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      const response = useCase.execute(request);

      expect(response.portfolio!.riskCapitalUSD).toBe(10000000);
    });

    it('should save updated portfolio to repository', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      useCase.execute(request);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should save portfolio with correct loans', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      useCase.execute(request);

      const savedPortfolio = (mockRepository.save as jest.Mock).mock.calls[0][0] as Portfolio;
      expect(savedPortfolio.loans).toHaveLength(2);
    });
  });

  describe('execute - adding new loan', () => {
    it('should add new loan to portfolio', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const newLoan = new Loan(
        'LOAN-003', // New ID
        'New Borrower',
        new CreditRating(RatingTier.AA),
        {
          principalUSD: 500000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: new Date('2025-01-31'),
        },
        new CryptoAsset(AssetType.SOL, 3000.0),
        1.0,
        new Date('2025-01-01')
      );

      const request = new UpdateLoanRequest(newLoan);
      const response = useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.portfolio!.loans).toHaveLength(3);
    });

    it('should preserve existing loans when adding new one', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const newLoan = new Loan(
        'LOAN-003',
        'New Borrower',
        new CreditRating(RatingTier.AA),
        testLoan1.terms,
        new CryptoAsset(AssetType.SOL, 3000.0),
        1.0,
        new Date('2025-01-01')
      );

      const request = new UpdateLoanRequest(newLoan);
      const response = useCase.execute(request);

      const loan1 = response.portfolio!.loans.find(l => l.id === 'LOAN-001');
      const loan2 = response.portfolio!.loans.find(l => l.id === 'LOAN-002');

      expect(loan1).toBeDefined();
      expect(loan2).toBeDefined();
    });

    it('should add new loan at end of array', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const newLoan = new Loan(
        'LOAN-003',
        'New Borrower',
        new CreditRating(RatingTier.AA),
        testLoan1.terms,
        new CryptoAsset(AssetType.SOL, 3000.0),
        1.0,
        new Date('2025-01-01')
      );

      const request = new UpdateLoanRequest(newLoan);
      const response = useCase.execute(request);

      expect(response.portfolio!.loans[2].id).toBe('LOAN-003');
    });
  });

  describe('execute - error cases', () => {
    it('should return failure when no portfolio exists', () => {
      mockRepository.findAll.mockReturnValue([]);

      const request = new UpdateLoanRequest(testLoan1);
      const response = useCase.execute(request);

      expect(response.success).toBe(false);
      expect(response.portfolio).toBeNull();
      expect(response.errorMessage).toBe('No portfolio found - cannot update loan');
    });

    it('should not save when no portfolio exists', () => {
      mockRepository.findAll.mockReturnValue([]);

      const request = new UpdateLoanRequest(testLoan1);
      useCase.execute(request);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle empty portfolio (no loans)', () => {
      const emptyPortfolio = new Portfolio([], 5000000);
      mockRepository.findAll.mockReturnValue([emptyPortfolio]);

      const request = new UpdateLoanRequest(testLoan1);
      const response = useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.portfolio!.loans).toHaveLength(1);
      expect(response.portfolio!.loans[0].id).toBe('LOAN-001');
    });
  });

  describe('UpdateLoanRequest DTO', () => {
    it('should create request with loan', () => {
      const request = new UpdateLoanRequest(testLoan1);

      expect(request.loan).toBe(testLoan1);
    });

    it('should accept any loan type', () => {
      const btcLoan = testLoan1;
      const ethLoan = testLoan2;

      const request1 = new UpdateLoanRequest(btcLoan);
      const request2 = new UpdateLoanRequest(ethLoan);

      expect(request1.loan.collateral.type).toBe(AssetType.BTC);
      expect(request2.loan.collateral.type).toBe(AssetType.ETH);
    });
  });

  describe('UpdateLoanResponse DTO', () => {
    it('should indicate success when loan updated', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      const response = useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.portfolio).not.toBeNull();
    });

    it('should include error message on failure', () => {
      mockRepository.findAll.mockReturnValue([]);

      const request = new UpdateLoanRequest(testLoan1);
      const response = useCase.execute(request);

      expect(response.success).toBe(false);
      expect(response.errorMessage).toBeDefined();
      expect(typeof response.errorMessage).toBe('string');
    });

    it('should not include error message on success', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      const response = useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.errorMessage).toBeUndefined();
    });
  });

  describe('dependency injection', () => {
    it('should accept repository through constructor', () => {
      const customRepository: jest.Mocked<IPortfolioRepository> = {
        ...mockRepository,
      };

      const customUseCase = new UpdateLoanUseCase(customRepository);

      expect(customUseCase).toBeDefined();
    });

    it('should use injected repository for operations', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      useCase.execute(request);

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('portfolio selection', () => {
    it('should use first portfolio when multiple exist', () => {
      const portfolio2 = new Portfolio([testLoan1], 5000000);
      mockRepository.findAll.mockReturnValue([testPortfolio, portfolio2]);

      const request = new UpdateLoanRequest(updatedLoan);
      const response = useCase.execute(request);

      // Should update first portfolio (with 2 loans)
      expect(response.portfolio!.loans).toHaveLength(2);
    });

    it('should call findAll only once', () => {
      mockRepository.findAll.mockReturnValue([testPortfolio]);

      const request = new UpdateLoanRequest(updatedLoan);
      useCase.execute(request);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
