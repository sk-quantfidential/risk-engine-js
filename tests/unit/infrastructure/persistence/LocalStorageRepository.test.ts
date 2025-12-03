/**
 * LocalStorageRepository Tests - Infrastructure Layer
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { LocalStorageRepository } from '@/infrastructure/persistence/LocalStorageRepository';
import { Portfolio } from '@/domain/entities/Portfolio';
import { Loan } from '@/domain/entities/Loan';
import { CryptoAsset, AssetType } from '@/domain/value-objects/CryptoAsset';
import { CreditRating, RatingTier } from '@/domain/value-objects/CreditRating';

describe('LocalStorageRepository', () => {
  let repository: LocalStorageRepository;
  let testLoan1: Loan;
  let testLoan2: Loan;
  let testPortfolio: Portfolio;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Create test data
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

    repository = new LocalStorageRepository();
  });

  describe('save and findById', () => {
    it('should save portfolio to localStorage', () => {
      repository.save(testPortfolio);

      const item = localStorage.getItem('risk-engine:portfolio');
      expect(item).not.toBeNull();
      expect(item).toContain('LOAN-001');
      expect(item).toContain('LOAN-002');
    });

    it('should save last updated timestamp', () => {
      repository.save(testPortfolio);

      const timestamp = localStorage.getItem('risk-engine:last-updated');
      expect(timestamp).not.toBeNull();

      const date = new Date(timestamp!);
      expect(date.getTime()).toBeCloseTo(Date.now(), -2); // Within 100ms
    });

    it('should load portfolio by ID', () => {
      repository.save(testPortfolio);

      const loaded = repository.findById('any-id');

      expect(loaded).not.toBeNull();
      expect(loaded!.loans).toHaveLength(2);
      expect(loaded!.riskCapitalUSD).toBe(10000000);
    });

    it('should return null when no portfolio exists', () => {
      const loaded = repository.findById('any-id');
      expect(loaded).toBeNull();
    });

    it('should preserve loan properties on save/load', () => {
      repository.save(testPortfolio);

      const loaded = repository.findById('any-id');
      const loan1 = loaded!.loans.find(l => l.id === 'LOAN-001')!;

      expect(loan1).toBeDefined();
      expect(loan1.borrowerName).toBe('Test Borrower 1');
      expect(loan1.borrowerRating.tier).toBe(RatingTier.A);
      expect(loan1.terms.principalUSD).toBe(1000000);
      expect(loan1.collateral.type).toBe(AssetType.BTC);
      expect(loan1.collateral.amount).toBe(10.0);
      expect(loan1.leverage).toBe(2.0);
    });
  });

  describe('findAll', () => {
    it('should return array with single portfolio', () => {
      repository.save(testPortfolio);

      const portfolios = repository.findAll();

      expect(portfolios).toHaveLength(1);
      expect(portfolios[0].loans).toHaveLength(2);
    });

    it('should return empty array when no portfolio exists', () => {
      const portfolios = repository.findAll();
      expect(portfolios).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should clear all data when deleting portfolio', () => {
      repository.save(testPortfolio);
      expect(localStorage.getItem('risk-engine:portfolio')).not.toBeNull();

      repository.delete('any-id');

      expect(localStorage.getItem('risk-engine:portfolio')).toBeNull();
      expect(localStorage.getItem('risk-engine:last-updated')).toBeNull();
    });
  });

  describe('saveLoan', () => {
    it('should add new loan to existing portfolio', () => {
      repository.save(testPortfolio);

      const newLoan = new Loan(
        'LOAN-003',
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

      repository.saveLoan(newLoan);

      const loaded = repository.findById('any-id');
      expect(loaded!.loans).toHaveLength(3);
      expect(loaded!.loans.find(l => l.id === 'LOAN-003')).toBeDefined();
    });

    it('should update existing loan', () => {
      repository.save(testPortfolio);

      const updatedLoan = new Loan(
        'LOAN-001', // Same ID
        'Updated Borrower',
        new CreditRating(RatingTier.AA),
        {
          principalUSD: 1500000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate: new Date('2025-01-31'),
        },
        new CryptoAsset(AssetType.BTC, 15.0),
        2.5,
        new Date('2025-01-01')
      );

      repository.saveLoan(updatedLoan);

      const loaded = repository.findById('any-id');
      expect(loaded!.loans).toHaveLength(2); // Still 2 loans

      const loan1 = loaded!.loans.find(l => l.id === 'LOAN-001')!;
      expect(loan1.borrowerName).toBe('Updated Borrower');
      expect(loan1.terms.principalUSD).toBe(1500000);
    });

    it('should throw error when no portfolio exists', () => {
      const newLoan = new Loan(
        'LOAN-003',
        'New Borrower',
        new CreditRating(RatingTier.AA),
        testLoan1.terms,
        new CryptoAsset(AssetType.SOL, 3000.0),
        1.0,
        new Date('2025-01-01')
      );

      expect(() => repository.saveLoan(newLoan)).toThrow('Failed to persist loan data');
    });

    it('should preserve risk capital when adding loan', () => {
      repository.save(testPortfolio);

      const newLoan = new Loan(
        'LOAN-003',
        'New Borrower',
        new CreditRating(RatingTier.AA),
        testLoan1.terms,
        new CryptoAsset(AssetType.SOL, 3000.0),
        1.0,
        new Date('2025-01-01')
      );

      repository.saveLoan(newLoan);

      const loaded = repository.findById('any-id');
      expect(loaded!.riskCapitalUSD).toBe(10000000);
    });
  });

  describe('deleteLoan', () => {
    it('should remove loan from portfolio', () => {
      repository.save(testPortfolio);

      repository.deleteLoan('LOAN-001');

      const loaded = repository.findById('any-id');
      expect(loaded!.loans).toHaveLength(1);
      expect(loaded!.loans.find(l => l.id === 'LOAN-001')).toBeUndefined();
      expect(loaded!.loans.find(l => l.id === 'LOAN-002')).toBeDefined();
    });

    it('should handle deleting last loan', () => {
      const singleLoanPortfolio = new Portfolio([testLoan1], 5000000);
      repository.save(singleLoanPortfolio);

      repository.deleteLoan('LOAN-001');

      const loaded = repository.findById('any-id');
      expect(loaded!.loans).toHaveLength(0);
    });

    it('should throw error when no portfolio exists', () => {
      expect(() => repository.deleteLoan('LOAN-001')).toThrow('Failed to delete loan');
    });

    it('should preserve risk capital when deleting loan', () => {
      repository.save(testPortfolio);

      repository.deleteLoan('LOAN-001');

      const loaded = repository.findById('any-id');
      expect(loaded!.riskCapitalUSD).toBe(10000000);
    });
  });

  describe('getLoan', () => {
    it('should return loan by ID', () => {
      repository.save(testPortfolio);

      const loan = repository.getLoan('LOAN-001');

      expect(loan).not.toBeNull();
      expect(loan!.id).toBe('LOAN-001');
      expect(loan!.borrowerName).toBe('Test Borrower 1');
    });

    it('should return null when loan not found', () => {
      repository.save(testPortfolio);

      const loan = repository.getLoan('LOAN-999');
      expect(loan).toBeNull();
    });

    it('should return null when no portfolio exists', () => {
      const loan = repository.getLoan('LOAN-001');
      expect(loan).toBeNull();
    });
  });

  describe('getAllLoans', () => {
    it('should return all loans', () => {
      repository.save(testPortfolio);

      const loans = repository.getAllLoans();

      expect(loans).toHaveLength(2);
      expect(loans.map(l => l.id)).toContain('LOAN-001');
      expect(loans.map(l => l.id)).toContain('LOAN-002');
    });

    it('should return empty array when no portfolio exists', () => {
      const loans = repository.getAllLoans();
      expect(loans).toEqual([]);
    });
  });

  describe('updateRiskCapital', () => {
    it('should update risk capital for existing portfolio', () => {
      repository.save(testPortfolio);

      repository.updateRiskCapital('any-id', 15000000);

      const loaded = repository.findById('any-id');
      expect(loaded!.riskCapitalUSD).toBe(15000000);
      expect(loaded!.loans).toHaveLength(2); // Loans preserved
    });

    it('should create new portfolio when none exists', () => {
      repository.updateRiskCapital('any-id', 5000000);

      const loaded = repository.findById('any-id');
      expect(loaded).not.toBeNull();
      expect(loaded!.riskCapitalUSD).toBe(5000000);
      expect(loaded!.loans).toHaveLength(0);
    });

    it('should preserve loans when updating risk capital', () => {
      repository.save(testPortfolio);

      repository.updateRiskCapital('any-id', 20000000);

      const loaded = repository.findById('any-id');
      expect(loaded!.loans).toHaveLength(2);
    });
  });

  describe('clearAll', () => {
    it('should clear all localStorage keys', () => {
      repository.save(testPortfolio);
      expect(localStorage.getItem('risk-engine:portfolio')).not.toBeNull();
      expect(localStorage.getItem('risk-engine:last-updated')).not.toBeNull();

      repository.clearAll();

      expect(localStorage.getItem('risk-engine:portfolio')).toBeNull();
      expect(localStorage.getItem('risk-engine:last-updated')).toBeNull();
    });
  });

  describe('getLastUpdated', () => {
    it('should return timestamp when portfolio exists', () => {
      repository.save(testPortfolio);

      const timestamp = repository.getLastUpdated();

      expect(timestamp).not.toBeNull();
      expect(timestamp!.getTime()).toBeCloseTo(Date.now(), -2);
    });

    it('should return null when no portfolio exists', () => {
      const timestamp = repository.getLastUpdated();
      expect(timestamp).toBeNull();
    });
  });

  describe('hasData', () => {
    it('should return true when portfolio exists', () => {
      repository.save(testPortfolio);

      expect(repository.hasData()).toBe(true);
    });

    it('should return false when no portfolio exists', () => {
      expect(repository.hasData()).toBe(false);
    });

    it('should return false after clearAll', () => {
      repository.save(testPortfolio);
      repository.clearAll();

      expect(repository.hasData()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('risk-engine:portfolio', 'invalid-json');

      const loaded = repository.findById('any-id');
      expect(loaded).toBeNull();
    });

    it('should return empty array for findAll with invalid JSON', () => {
      localStorage.setItem('risk-engine:portfolio', 'invalid-json');

      const portfolios = repository.findAll();
      expect(portfolios).toEqual([]);
    });
  });

  describe('serialization and deserialization', () => {
    it('should correctly serialize and deserialize dates', () => {
      const rollDate = new Date('2025-06-15T12:00:00Z');
      const originationDate = new Date('2025-01-01T00:00:00Z');

      const loan = new Loan(
        'LOAN-TEST',
        'Test Borrower',
        new CreditRating(RatingTier.A),
        {
          principalUSD: 1000000,
          lendingRate: 0.0945,
          costOfCapital: 0.045,
          tenor: 30,
          rollDate,
        },
        new CryptoAsset(AssetType.BTC, 10.0),
        2.0,
        originationDate
      );

      const portfolio = new Portfolio([loan], 5000000);
      repository.save(portfolio);

      const loaded = repository.findById('any-id')!;
      const loadedLoan = loaded.loans[0];

      expect(loadedLoan.terms.rollDate.toISOString()).toBe(rollDate.toISOString());
      expect(loadedLoan.originationDate.toISOString()).toBe(originationDate.toISOString());
    });

    it('should correctly serialize and deserialize all loan properties', () => {
      repository.save(testPortfolio);

      const loaded = repository.findById('any-id')!;
      const loan2 = loaded.loans.find(l => l.id === 'LOAN-002')!;

      expect(loan2.borrowerName).toBe('Test Borrower 2');
      expect(loan2.borrowerRating.tier).toBe(RatingTier.BBB);
      expect(loan2.terms.principalUSD).toBe(2000000);
      expect(loan2.terms.lendingRate).toBe(0.0945);
      expect(loan2.terms.costOfCapital).toBe(0.045);
      expect(loan2.terms.tenor).toBe(30);
      expect(loan2.collateral.type).toBe(AssetType.ETH);
      expect(loan2.collateral.amount).toBe(500.0);
      expect(loan2.leverage).toBe(1.5);
    });
  });
});
