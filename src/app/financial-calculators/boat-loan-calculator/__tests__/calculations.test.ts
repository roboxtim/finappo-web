import { describe, it, expect } from 'vitest';
import {
  calculateBoatLoan,
  validateInputs,
  formatCurrency,
  formatPercentage,
} from '../calculations';

describe('calculateBoatLoan', () => {
  describe('Basic loan calculations', () => {
    it('should calculate correct monthly payment for standard loan', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 7.5,
        loanTermYears: 15,
        downPayment: 10000,
        downPaymentType: 'amount',
      });

      expect(result.loanAmount).toBe(40000);
      expect(result.monthlyPayment).toBeCloseTo(370.8, 2);
      expect(result.totalPayments).toBeCloseTo(66744.89, 2);
      expect(result.totalInterest).toBeCloseTo(26744.89, 2);
    });

    it('should calculate zero interest loan correctly', () => {
      const result = calculateBoatLoan({
        boatPrice: 25000,
        interestRate: 0,
        loanTermYears: 5,
        downPayment: 5000,
        downPaymentType: 'amount',
      });

      expect(result.loanAmount).toBe(20000);
      expect(result.monthlyPayment).toBeCloseTo(333.33, 2);
      expect(result.totalPayments).toBeCloseTo(20000, 2);
      expect(result.totalInterest).toBe(0);
    });

    it('should calculate short-term loan correctly', () => {
      const result = calculateBoatLoan({
        boatPrice: 15000,
        interestRate: 8,
        loanTermYears: 3,
        downPayment: 3000,
        downPaymentType: 'amount',
      });

      expect(result.loanAmount).toBe(12000);
      expect(result.monthlyPayment).toBeCloseTo(376.04, 2);
      expect(result.totalInterest).toBeCloseTo(1537.31, 2);
    });

    it('should calculate long-term loan correctly', () => {
      const result = calculateBoatLoan({
        boatPrice: 200000,
        interestRate: 6,
        loanTermYears: 20,
        downPayment: 40000,
        downPaymentType: 'amount',
      });

      expect(result.loanAmount).toBe(160000);
      expect(result.monthlyPayment).toBeCloseTo(1146.29, 2);
      expect(result.totalInterest).toBeCloseTo(115109.53, 2);
    });
  });

  describe('Down payment calculations', () => {
    it('should calculate down payment as percentage correctly', () => {
      const result = calculateBoatLoan({
        boatPrice: 100000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 20,
        downPaymentType: 'percentage',
      });

      expect(result.downPaymentAmount).toBe(20000);
      expect(result.loanAmount).toBe(80000);
      expect(result.upfrontPayment).toBe(20000);
    });

    it('should calculate down payment as dollar amount correctly', () => {
      const result = calculateBoatLoan({
        boatPrice: 100000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 15000,
        downPaymentType: 'amount',
      });

      expect(result.downPaymentAmount).toBe(15000);
      expect(result.loanAmount).toBe(85000);
      expect(result.upfrontPayment).toBe(15000);
    });

    it('should handle zero down payment', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 8,
        loanTermYears: 10,
        downPayment: 0,
        downPaymentType: 'amount',
      });

      expect(result.downPaymentAmount).toBe(0);
      expect(result.loanAmount).toBe(50000);
      expect(result.upfrontPayment).toBe(0);
    });
  });

  describe('Trade-in value calculations', () => {
    it('should reduce loan amount by trade-in value', () => {
      const result = calculateBoatLoan({
        boatPrice: 75000,
        interestRate: 7.5,
        loanTermYears: 12,
        downPayment: 10000,
        downPaymentType: 'amount',
        tradeInValue: 15000,
      });

      expect(result.loanAmount).toBe(50000);
      expect(result.upfrontPayment).toBe(10000);
    });

    it('should handle zero trade-in value', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 10000,
        downPaymentType: 'amount',
        tradeInValue: 0,
      });

      expect(result.loanAmount).toBe(40000);
    });

    it('should handle large trade-in value', () => {
      const result = calculateBoatLoan({
        boatPrice: 60000,
        interestRate: 6.5,
        loanTermYears: 8,
        downPayment: 10000,
        downPaymentType: 'amount',
        tradeInValue: 25000,
      });

      expect(result.loanAmount).toBe(25000);
    });
  });

  describe('Sales tax calculations', () => {
    it('should calculate sales tax as percentage correctly', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 10000,
        downPaymentType: 'amount',
        salesTax: 7,
        salesTaxType: 'percentage',
      });

      expect(result.salesTaxAmount).toBe(3500);
      expect(result.loanAmount).toBe(43500); // 50000 - 10000 + 3500
    });

    it('should calculate sales tax as dollar amount correctly', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 10000,
        downPaymentType: 'amount',
        salesTax: 2500,
        salesTaxType: 'amount',
      });

      expect(result.salesTaxAmount).toBe(2500);
      expect(result.loanAmount).toBe(42500); // 50000 - 10000 + 2500
    });

    it('should handle zero sales tax', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 10000,
        downPaymentType: 'amount',
        salesTax: 0,
        salesTaxType: 'percentage',
      });

      expect(result.salesTaxAmount).toBe(0);
      expect(result.loanAmount).toBe(40000);
    });
  });

  describe('Fee calculations', () => {
    it('should include fees in loan amount when selected', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 10000,
        downPaymentType: 'amount',
        fees: 1000,
        includeFeesInLoan: true,
      });

      expect(result.loanAmount).toBe(41000); // 50000 - 10000 + 1000
      expect(result.upfrontPayment).toBe(10000);
    });

    it('should exclude fees from loan amount when not selected', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 10000,
        downPaymentType: 'amount',
        fees: 1000,
        includeFeesInLoan: false,
      });

      expect(result.loanAmount).toBe(40000);
      expect(result.upfrontPayment).toBe(11000); // 10000 + 1000
    });

    it('should handle zero fees', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 10000,
        downPaymentType: 'amount',
        fees: 0,
        includeFeesInLoan: true,
      });

      expect(result.loanAmount).toBe(40000);
      expect(result.upfrontPayment).toBe(10000);
    });
  });

  describe('Complex scenarios', () => {
    it('should calculate with all features combined', () => {
      const result = calculateBoatLoan({
        boatPrice: 100000,
        interestRate: 7.5,
        loanTermYears: 15,
        downPayment: 20,
        downPaymentType: 'percentage',
        tradeInValue: 10000,
        salesTax: 7,
        salesTaxType: 'percentage',
        fees: 1500,
        includeFeesInLoan: true,
      });

      // Boat: 100000
      // Down: 20000 (20%)
      // Trade-in: 10000
      // Sales Tax: 7000 (7%)
      // Fees: 1500
      // Loan = 100000 - 20000 - 10000 + 7000 + 1500 = 78500
      expect(result.downPaymentAmount).toBe(20000);
      expect(result.salesTaxAmount).toBe(7000);
      expect(result.loanAmount).toBe(78500);
      expect(result.upfrontPayment).toBe(20000);
    });

    it('should calculate total cost correctly', () => {
      const result = calculateBoatLoan({
        boatPrice: 50000,
        interestRate: 8,
        loanTermYears: 10,
        downPayment: 10000,
        downPaymentType: 'amount',
        salesTax: 3500,
        salesTaxType: 'amount',
        fees: 500,
        includeFeesInLoan: true,
      });

      // Total cost = boat price + sales tax + fees + interest
      const expectedTotalCost = 50000 + 3500 + 500 + result.totalInterest;
      expect(result.totalCost).toBeCloseTo(expectedTotalCost, 2);
    });

    it('should handle loan amount becoming zero with large down payment and trade-in', () => {
      const result = calculateBoatLoan({
        boatPrice: 30000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 15000,
        downPaymentType: 'amount',
        tradeInValue: 15000,
      });

      expect(result.loanAmount).toBe(0);
      expect(result.monthlyPayment).toBe(0);
      expect(result.totalInterest).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero loan amount', () => {
      const result = calculateBoatLoan({
        boatPrice: 20000,
        interestRate: 7,
        loanTermYears: 10,
        downPayment: 20000,
        downPaymentType: 'amount',
      });

      expect(result.loanAmount).toBe(0);
      expect(result.monthlyPayment).toBe(0);
      expect(result.totalInterest).toBe(0);
    });

    it('should throw error for zero boat price', () => {
      expect(() =>
        calculateBoatLoan({
          boatPrice: 0,
          interestRate: 7,
          loanTermYears: 10,
        })
      ).toThrow('Boat price must be greater than 0');
    });

    it('should throw error for negative interest rate', () => {
      expect(() =>
        calculateBoatLoan({
          boatPrice: 50000,
          interestRate: -5,
          loanTermYears: 10,
        })
      ).toThrow('Interest rate cannot be negative');
    });

    it('should throw error for zero loan term', () => {
      expect(() =>
        calculateBoatLoan({
          boatPrice: 50000,
          interestRate: 7,
          loanTermYears: 0,
        })
      ).toThrow('Loan term must be greater than 0');
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate small fishing boat loan', () => {
      const result = calculateBoatLoan({
        boatPrice: 15000,
        interestRate: 8.5,
        loanTermYears: 5,
        downPayment: 3000,
        downPaymentType: 'amount',
        salesTax: 6,
        salesTaxType: 'percentage',
        fees: 300,
        includeFeesInLoan: true,
      });

      expect(result.salesTaxAmount).toBe(900);
      expect(result.loanAmount).toBe(13200); // 15000 - 3000 + 900 + 300
      expect(result.upfrontPayment).toBe(3000);
    });

    it('should calculate luxury yacht loan', () => {
      const result = calculateBoatLoan({
        boatPrice: 500000,
        interestRate: 5.5,
        loanTermYears: 20,
        downPayment: 25,
        downPaymentType: 'percentage',
        tradeInValue: 50000,
        salesTax: 0,
        salesTaxType: 'percentage',
        fees: 5000,
        includeFeesInLoan: true,
      });

      expect(result.downPaymentAmount).toBe(125000);
      expect(result.loanAmount).toBe(330000); // 500000 - 125000 - 50000 + 5000
      expect(result.monthlyPayment).toBeCloseTo(2270.03, 2);
    });

    it('should calculate used boat with trade-in', () => {
      const result = calculateBoatLoan({
        boatPrice: 35000,
        interestRate: 9,
        loanTermYears: 7,
        downPayment: 5000,
        downPaymentType: 'amount',
        tradeInValue: 8000,
        salesTax: 6.5,
        salesTaxType: 'percentage',
        fees: 750,
        includeFeesInLoan: false,
      });

      expect(result.salesTaxAmount).toBe(2275);
      expect(result.loanAmount).toBe(24275); // 35000 - 5000 - 8000 + 2275
      expect(result.upfrontPayment).toBe(5750); // 5000 + 750
    });
  });
});

describe('validateInputs', () => {
  it('should return no errors for valid inputs', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 15,
    });

    expect(errors).toHaveLength(0);
  });

  it('should return error for zero boat price', () => {
    const errors = validateInputs({
      boatPrice: 0,
      interestRate: 7.5,
      loanTermYears: 15,
    });

    expect(errors).toContain('Boat price must be greater than 0');
  });

  it('should return warning for unusually high boat price', () => {
    const errors = validateInputs({
      boatPrice: 15000000,
      interestRate: 7.5,
      loanTermYears: 15,
    });

    expect(errors).toContain('Boat price seems unusually high');
  });

  it('should return error for negative interest rate', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: -5,
      loanTermYears: 15,
    });

    expect(errors).toContain('Interest rate cannot be negative');
  });

  it('should return warning for very high interest rate', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 60,
      loanTermYears: 15,
    });

    expect(errors).toContain('Interest rate seems unusually high');
  });

  it('should return error for zero loan term', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 0,
    });

    expect(errors).toContain('Loan term must be greater than 0');
  });

  it('should return error for too long loan term', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 35,
    });

    expect(errors).toContain('Loan term cannot exceed 30 years');
  });

  it('should return error for negative down payment', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 15,
      downPayment: -5000,
    });

    expect(errors).toContain('Down payment cannot be negative');
  });

  it('should return error for down payment percentage over 100%', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 15,
      downPayment: 120,
      downPaymentType: 'percentage',
    });

    expect(errors).toContain('Down payment percentage cannot exceed 100%');
  });

  it('should return error for negative trade-in value', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 15,
      tradeInValue: -10000,
    });

    expect(errors).toContain('Trade-in value cannot be negative');
  });

  it('should return error for trade-in value exceeding boat price', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 15,
      tradeInValue: 60000,
    });

    expect(errors).toContain('Trade-in value cannot exceed boat price');
  });

  it('should return error for negative sales tax', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 15,
      salesTax: -5,
      salesTaxType: 'percentage',
    });

    expect(errors).toContain('Sales tax cannot be negative');
  });

  it('should return warning for unusually high sales tax percentage', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 15,
      salesTax: 25,
      salesTaxType: 'percentage',
    });

    expect(errors).toContain('Sales tax percentage seems unusually high');
  });

  it('should return error for negative fees', () => {
    const errors = validateInputs({
      boatPrice: 50000,
      interestRate: 7.5,
      loanTermYears: 15,
      fees: -500,
    });

    expect(errors).toContain('Fees cannot be negative');
  });

  it('should return multiple errors for multiple invalid inputs', () => {
    const errors = validateInputs({
      boatPrice: 0,
      interestRate: -5,
      loanTermYears: 0,
    });

    expect(errors.length).toBeGreaterThan(2);
  });
});

describe('formatCurrency', () => {
  it('should format whole numbers correctly', () => {
    expect(formatCurrency(50000)).toBe('$50,000.00');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatCurrency(370.82)).toBe('$370.82');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large numbers with commas', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });
});

describe('formatPercentage', () => {
  it('should format whole numbers correctly', () => {
    expect(formatPercentage(7.5)).toBe('7.50%');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatPercentage(8.125)).toBe('8.13%');
  });

  it('should format zero correctly', () => {
    expect(formatPercentage(0)).toBe('0.00%');
  });
});
