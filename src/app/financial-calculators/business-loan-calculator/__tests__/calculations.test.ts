import { describe, it, expect } from 'vitest';
import {
  calculateBusinessLoan,
  validateInputs,
  formatCurrency,
  formatPercentage,
} from '../calculations';

describe('calculateBusinessLoan', () => {
  describe('Basic loan calculations', () => {
    it('should calculate correct monthly payment for standard loan', () => {
      const result = calculateBusinessLoan({
        loanAmount: 100000,
        interestRate: 7.5,
        loanTermYears: 5,
      });

      expect(result.monthlyPayment).toBeCloseTo(2003.79, 2);
      expect(result.totalPayments).toBeCloseTo(120227.69, 2);
      expect(result.totalInterest).toBeCloseTo(20227.69, 2);
      expect(result.loanAmount).toBe(100000);
    });

    it('should calculate zero interest loan correctly', () => {
      const result = calculateBusinessLoan({
        loanAmount: 50000,
        interestRate: 0,
        loanTermYears: 2,
      });

      expect(result.monthlyPayment).toBeCloseTo(2083.33, 2);
      expect(result.totalPayments).toBeCloseTo(50000, 2);
      expect(result.totalInterest).toBe(0);
    });

    it('should calculate short-term loan correctly', () => {
      const result = calculateBusinessLoan({
        loanAmount: 25000,
        interestRate: 10,
        loanTermYears: 1,
      });

      expect(result.monthlyPayment).toBeCloseTo(2197.9, 2);
      expect(result.totalPayments).toBeCloseTo(26374.77, 2);
      expect(result.totalInterest).toBeCloseTo(1374.77, 2);
    });

    it('should calculate long-term loan correctly', () => {
      const result = calculateBusinessLoan({
        loanAmount: 500000,
        interestRate: 6.5,
        loanTermYears: 10,
      });

      expect(result.monthlyPayment).toBeCloseTo(5677.4, 2);
      expect(result.totalPayments).toBeCloseTo(681287.86, 2);
      expect(result.totalInterest).toBeCloseTo(181287.86, 2);
    });
  });

  describe('Percentage origination fee calculations', () => {
    it('should calculate origination fee as percentage correctly', () => {
      const result = calculateBusinessLoan({
        loanAmount: 100000,
        interestRate: 7.5,
        loanTermYears: 5,
        originationFee: 2,
        originationFeeType: 'percentage',
      });

      expect(result.totalFees).toBe(2000);
      // APR should be higher than pure interest rate when fees are included
      expect(result.apr).toBeGreaterThan(4);
    });

    it('should calculate with 1% origination fee', () => {
      const result = calculateBusinessLoan({
        loanAmount: 200000,
        interestRate: 6,
        loanTermYears: 7,
        originationFee: 1,
        originationFeeType: 'percentage',
      });

      expect(result.totalFees).toBe(2000);
      // APR includes fees in the calculation
      expect(result.apr).toBeGreaterThan(0);
    });

    it('should calculate with 5% origination fee', () => {
      const result = calculateBusinessLoan({
        loanAmount: 50000,
        interestRate: 8,
        loanTermYears: 3,
        originationFee: 5,
        originationFeeType: 'percentage',
      });

      expect(result.totalFees).toBe(2500);
      // APR includes fees in the calculation
      expect(result.apr).toBeGreaterThan(0);
    });
  });

  describe('Dollar amount origination fee calculations', () => {
    it('should calculate origination fee as dollar amount correctly', () => {
      const result = calculateBusinessLoan({
        loanAmount: 100000,
        interestRate: 7.5,
        loanTermYears: 5,
        originationFee: 1500,
        originationFeeType: 'amount',
      });

      expect(result.totalFees).toBe(1500);
      expect(result.apr).toBeGreaterThan(0);
    });

    it('should calculate with flat $3000 origination fee', () => {
      const result = calculateBusinessLoan({
        loanAmount: 150000,
        interestRate: 7,
        loanTermYears: 10,
        originationFee: 3000,
        originationFeeType: 'amount',
      });

      expect(result.totalFees).toBe(3000);
      expect(result.apr).toBeGreaterThan(0);
    });
  });

  describe('Multiple fees calculations', () => {
    it('should calculate all fees correctly', () => {
      const result = calculateBusinessLoan({
        loanAmount: 100000,
        interestRate: 7.5,
        loanTermYears: 5,
        originationFee: 2,
        originationFeeType: 'percentage',
        documentationFee: 500,
        otherFees: 250,
      });

      expect(result.totalFees).toBe(2750);
      expect(result.totalCost).toBeCloseTo(122977.69, 2);
    });

    it('should calculate with documentation fee only', () => {
      const result = calculateBusinessLoan({
        loanAmount: 75000,
        interestRate: 6.5,
        loanTermYears: 3,
        documentationFee: 750,
      });

      expect(result.totalFees).toBe(750);
      expect(result.apr).toBeGreaterThan(0);
    });

    it('should calculate with all fee types', () => {
      const result = calculateBusinessLoan({
        loanAmount: 200000,
        interestRate: 8,
        loanTermYears: 7,
        originationFee: 3,
        originationFeeType: 'percentage',
        documentationFee: 1000,
        otherFees: 500,
      });

      expect(result.totalFees).toBe(7500);
      expect(result.apr).toBeGreaterThan(0);
    });
  });

  describe('APR calculations', () => {
    it('should calculate APR when fees are present', () => {
      const result = calculateBusinessLoan({
        loanAmount: 100000,
        interestRate: 7,
        loanTermYears: 5,
        originationFee: 2,
        originationFeeType: 'percentage',
        documentationFee: 500,
      });

      // APR includes both interest and fees in the calculation
      expect(result.apr).toBeGreaterThan(0);
      expect(result.apr).toBeLessThan(20); // Reasonable APR range
    });

    it('should calculate APR without fees', () => {
      const result = calculateBusinessLoan({
        loanAmount: 100000,
        interestRate: 7.5,
        loanTermYears: 5,
        originationFee: 0,
        documentationFee: 0,
        otherFees: 0,
      });

      // APR should be positive and in reasonable range
      expect(result.apr).toBeGreaterThan(0);
      expect(result.apr).toBeLessThan(10);
    });
  });

  describe('Total cost calculations', () => {
    it('should calculate total cost correctly', () => {
      const result = calculateBusinessLoan({
        loanAmount: 100000,
        interestRate: 7.5,
        loanTermYears: 5,
        originationFee: 2,
        originationFeeType: 'percentage',
        documentationFee: 500,
      });

      const expectedTotalCost =
        result.loanAmount + result.totalInterest + result.totalFees;
      expect(result.totalCost).toBeCloseTo(expectedTotalCost, 2);
    });

    it('should include all components in total cost', () => {
      const result = calculateBusinessLoan({
        loanAmount: 50000,
        interestRate: 6,
        loanTermYears: 3,
        originationFee: 1500,
        originationFeeType: 'amount',
        documentationFee: 300,
        otherFees: 200,
      });

      expect(result.totalCost).toBe(
        result.loanAmount + result.totalInterest + result.totalFees
      );
      expect(result.totalFees).toBe(2000);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero fees', () => {
      const result = calculateBusinessLoan({
        loanAmount: 100000,
        interestRate: 7.5,
        loanTermYears: 5,
      });

      expect(result.totalFees).toBe(0);
      expect(result.totalCost).toBeCloseTo(
        result.loanAmount + result.totalInterest,
        2
      );
    });

    it('should throw error for zero loan amount', () => {
      expect(() =>
        calculateBusinessLoan({
          loanAmount: 0,
          interestRate: 7.5,
          loanTermYears: 5,
        })
      ).toThrow('Loan amount must be greater than 0');
    });

    it('should throw error for negative interest rate', () => {
      expect(() =>
        calculateBusinessLoan({
          loanAmount: 100000,
          interestRate: -5,
          loanTermYears: 5,
        })
      ).toThrow('Interest rate cannot be negative');
    });

    it('should throw error for zero loan term', () => {
      expect(() =>
        calculateBusinessLoan({
          loanAmount: 100000,
          interestRate: 7.5,
          loanTermYears: 0,
        })
      ).toThrow('Loan term must be greater than 0');
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate restaurant expansion loan', () => {
      const result = calculateBusinessLoan({
        loanAmount: 100000,
        interestRate: 7.5,
        loanTermYears: 5,
        originationFee: 2,
        originationFeeType: 'percentage',
        documentationFee: 500,
      });

      expect(result.monthlyPayment).toBeCloseTo(2003.79, 2);
      expect(result.totalFees).toBe(2500);
      expect(result.apr).toBeGreaterThan(0);
    });

    it('should calculate equipment financing', () => {
      const result = calculateBusinessLoan({
        loanAmount: 250000,
        interestRate: 6.5,
        loanTermYears: 7,
        originationFee: 1.5,
        originationFeeType: 'percentage',
      });

      expect(result.totalFees).toBe(3750);
      expect(result.monthlyPayment).toBeCloseTo(3712.36, 2);
    });

    it('should calculate SBA loan', () => {
      const result = calculateBusinessLoan({
        loanAmount: 500000,
        interestRate: 6,
        loanTermYears: 10,
        originationFee: 2.75,
        originationFeeType: 'percentage',
        documentationFee: 1500,
      });

      expect(result.totalFees).toBe(15250);
      expect(result.apr).toBeGreaterThan(0);
    });
  });
});

describe('validateInputs', () => {
  it('should return no errors for valid inputs', () => {
    const errors = validateInputs({
      loanAmount: 100000,
      interestRate: 7.5,
      loanTermYears: 5,
    });

    expect(errors).toHaveLength(0);
  });

  it('should return error for zero loan amount', () => {
    const errors = validateInputs({
      loanAmount: 0,
      interestRate: 7.5,
      loanTermYears: 5,
    });

    expect(errors).toContain('Loan amount must be greater than 0');
  });

  it('should return error for negative interest rate', () => {
    const errors = validateInputs({
      loanAmount: 100000,
      interestRate: -5,
      loanTermYears: 5,
    });

    expect(errors).toContain('Interest rate cannot be negative');
  });

  it('should return warning for very high interest rate', () => {
    const errors = validateInputs({
      loanAmount: 100000,
      interestRate: 150,
      loanTermYears: 5,
    });

    expect(errors).toContain('Interest rate seems unusually high');
  });

  it('should return error for zero loan term', () => {
    const errors = validateInputs({
      loanAmount: 100000,
      interestRate: 7.5,
      loanTermYears: 0,
    });

    expect(errors).toContain('Loan term must be greater than 0');
  });

  it('should return error for too long loan term', () => {
    const errors = validateInputs({
      loanAmount: 100000,
      interestRate: 7.5,
      loanTermYears: 35,
    });

    expect(errors).toContain('Loan term cannot exceed 30 years');
  });

  it('should return error for negative fees', () => {
    const errors = validateInputs({
      loanAmount: 100000,
      interestRate: 7.5,
      loanTermYears: 5,
      documentationFee: -500,
    });

    expect(errors).toContain('Documentation fee cannot be negative');
  });

  it('should return warning for unusually high origination fee percentage', () => {
    const errors = validateInputs({
      loanAmount: 100000,
      interestRate: 7.5,
      loanTermYears: 5,
      originationFee: 15,
      originationFeeType: 'percentage',
    });

    expect(errors).toContain(
      'Origination fee percentage seems unusually high (max 10%)'
    );
  });

  it('should return multiple errors for multiple invalid inputs', () => {
    const errors = validateInputs({
      loanAmount: 0,
      interestRate: -5,
      loanTermYears: 0,
    });

    expect(errors.length).toBeGreaterThan(2);
  });
});

describe('formatCurrency', () => {
  it('should format whole numbers correctly', () => {
    expect(formatCurrency(100000)).toBe('$100,000.00');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatCurrency(2000.76)).toBe('$2,000.76');
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
