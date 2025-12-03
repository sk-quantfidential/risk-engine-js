/**
 * Money Value Object Tests
 *
 * Clean Architecture Testing: Domain Layer
 * - Pure unit tests with NO mocks
 * - Tests business rules and invariants
 * - No infrastructure dependencies
 */

import { describe, it, expect } from '@jest/globals';
import { Money } from '@/domain/value-objects/Money';

describe('Money Value Object', () => {
  describe('constructor', () => {
    it('should create Money with positive amount', () => {
      const money = new Money(100.50);
      expect(money.amountUSD).toBe(100.50);
    });

    it('should create Money with zero amount', () => {
      const money = new Money(0);
      expect(money.amountUSD).toBe(0);
    });

    it('should create Money with negative amount', () => {
      const money = new Money(-50.25);
      expect(money.amountUSD).toBe(-50.25);
    });

    it('should throw error for non-finite amount', () => {
      expect(() => new Money(NaN)).toThrow('Money amount must be a finite number');
      expect(() => new Money(Infinity)).toThrow('Money amount must be a finite number');
    });
  });

  describe('add', () => {
    it('should add two positive amounts', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      const result = money1.add(money2);

      expect(result.amountUSD).toBe(150);
    });

    it('should add positive and negative amounts', () => {
      const money1 = new Money(100);
      const money2 = new Money(-30);
      const result = money1.add(money2);

      expect(result.amountUSD).toBe(70);
    });

    it('should handle decimal precision', () => {
      const money1 = new Money(10.55);
      const money2 = new Money(5.45);
      const result = money1.add(money2);

      expect(result.amountUSD).toBeCloseTo(16.00, 2);
    });

    it('should not mutate original Money objects', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      money1.add(money2);

      expect(money1.amountUSD).toBe(100);
      expect(money2.amountUSD).toBe(50);
    });
  });

  describe('subtract', () => {
    it('should subtract two positive amounts', () => {
      const money1 = new Money(100);
      const money2 = new Money(30);
      const result = money1.subtract(money2);

      expect(result.amountUSD).toBe(70);
    });

    it('should result in negative when subtracting larger from smaller', () => {
      const money1 = new Money(50);
      const money2 = new Money(100);
      const result = money1.subtract(money2);

      expect(result.amountUSD).toBe(-50);
    });

    it('should handle decimal precision', () => {
      const money1 = new Money(10.75);
      const money2 = new Money(5.25);
      const result = money1.subtract(money2);

      expect(result.amountUSD).toBeCloseTo(5.50, 2);
    });
  });

  describe('multiply', () => {
    it('should multiply by positive integer', () => {
      const money = new Money(100);
      const result = money.multiply(3);

      expect(result.amountUSD).toBe(300);
    });

    it('should multiply by decimal', () => {
      const money = new Money(100);
      const result = money.multiply(1.5);

      expect(result.amountUSD).toBe(150);
    });

    it('should multiply by zero', () => {
      const money = new Money(100);
      const result = money.multiply(0);

      expect(result.amountUSD).toBe(0);
    });

    it('should multiply by negative number', () => {
      const money = new Money(100);
      const result = money.multiply(-2);

      expect(result.amountUSD).toBe(-200);
    });
  });

  describe('divide', () => {
    it('should divide by positive integer', () => {
      const money = new Money(100);
      const result = money.divide(4);

      expect(result.amountUSD).toBe(25);
    });

    it('should divide by decimal', () => {
      const money = new Money(100);
      const result = money.divide(2.5);

      expect(result.amountUSD).toBe(40);
    });

    it('should throw error when dividing by zero', () => {
      const money = new Money(100);

      expect(() => money.divide(0)).toThrow('Cannot divide by zero');
    });
  });

  describe('comparison methods', () => {
    describe('isGreaterThan', () => {
      it('should return true when first is greater', () => {
        const money1 = new Money(100);
        const money2 = new Money(50);

        expect(money1.isGreaterThan(money2)).toBe(true);
      });

      it('should return false when first is less', () => {
        const money1 = new Money(50);
        const money2 = new Money(100);

        expect(money1.isGreaterThan(money2)).toBe(false);
      });

      it('should return false when equal', () => {
        const money1 = new Money(100);
        const money2 = new Money(100);

        expect(money1.isGreaterThan(money2)).toBe(false);
      });
    });

    describe('isLessThan', () => {
      it('should return true when first is less', () => {
        const money1 = new Money(50);
        const money2 = new Money(100);

        expect(money1.isLessThan(money2)).toBe(true);
      });

      it('should return false when first is greater', () => {
        const money1 = new Money(100);
        const money2 = new Money(50);

        expect(money1.isLessThan(money2)).toBe(false);
      });

      it('should return false when equal', () => {
        const money1 = new Money(100);
        const money2 = new Money(100);

        expect(money1.isLessThan(money2)).toBe(false);
      });
    });
  });

  describe('toFixed', () => {
    it('should format with 2 decimal places by default', () => {
      const money = new Money(1234.567);

      expect(money.toFixed()).toBe('1234.57');
    });

    it('should format with custom decimal places', () => {
      const money = new Money(1234.5678);

      expect(money.toFixed(3)).toBe('1234.568');
    });

    it('should handle zero', () => {
      const money = new Money(0);

      expect(money.toFixed()).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      const money = new Money(-1234.56);

      expect(money.toFixed()).toBe('-1234.56');
    });
  });

  describe('format', () => {
    it('should format as USD currency', () => {
      const money = new Money(1234.56);

      expect(money.format()).toBe('$1,234.56');
    });

    it('should handle zero', () => {
      const money = new Money(0);

      expect(money.format()).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      const money = new Money(-1234.56);

      expect(money.format()).toBe('-$1,234.56');
    });

    it('should handle large amounts with commas', () => {
      const money = new Money(1234567.89);

      expect(money.format()).toBe('$1,234,567.89');
    });

    it('should handle small amounts', () => {
      const money = new Money(0.99);

      expect(money.format()).toBe('$0.99');
    });
  });

  describe('fromJSON', () => {
    it('should deserialize Money from JSON', () => {
      const json = { amountUSD: 1234.56 };
      const money = Money.fromJSON(json);

      expect(money.amountUSD).toBe(1234.56);
    });
  });

  describe('toJSON', () => {
    it('should serialize Money to JSON', () => {
      const money = new Money(1234.56);
      const json = money.toJSON();

      expect(json).toEqual({ amountUSD: 1234.56 });
    });
  });

  describe('ZERO constant', () => {
    it('should provide a Money.ZERO constant', () => {
      expect(Money.ZERO.amountUSD).toBe(0);
    });
  });
});
