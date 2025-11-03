/**
 * Money Value Object
 * Represents USD monetary amounts with proper precision
 */

export class Money {
  constructor(public readonly amountUSD: number) {
    if (!Number.isFinite(amountUSD)) {
      throw new Error('Money amount must be a finite number');
    }
  }

  add(other: Money): Money {
    return new Money(this.amountUSD + other.amountUSD);
  }

  subtract(other: Money): Money {
    return new Money(this.amountUSD - other.amountUSD);
  }

  multiply(factor: number): Money {
    return new Money(this.amountUSD * factor);
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Money(this.amountUSD / divisor);
  }

  isGreaterThan(other: Money): boolean {
    return this.amountUSD > other.amountUSD;
  }

  isLessThan(other: Money): boolean {
    return this.amountUSD < other.amountUSD;
  }

  toFixed(decimals: number = 2): string {
    return this.amountUSD.toFixed(decimals);
  }

  format(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(this.amountUSD);
  }

  static fromUSD(amountUSD: number): Money {
    return new Money(amountUSD);
  }

  static fromJSON(data: { amountUSD: number }): Money {
    return new Money(data.amountUSD);
  }

  toJSON() {
    return {
      amountUSD: this.amountUSD,
    };
  }

  static ZERO = new Money(0);
}