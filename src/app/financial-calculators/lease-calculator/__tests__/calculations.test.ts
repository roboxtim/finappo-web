import { describe, it, expect } from 'vitest';
import {
  calculateLease,
  validateInputs,
  type LeaseInputs,
} from '../calculations';

describe('Lease Calculator - Fixed Rate Mode', () => {
  it('should calculate monthly payment for standard 3-year lease', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      interestRate: 5,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.depreciationFee).toBeCloseTo(416.67, 2); // (30000-15000)/36
    expect(result.financeFee).toBeGreaterThan(0);
    expect(result.totalPayments).toBeCloseTo(result.monthlyPayment * 36, 2);
    expect(result.totalDepreciation).toBe(15000);
  });

  it('should calculate with zero interest rate', () => {
    const inputs: LeaseInputs = {
      assetValue: 24000,
      residualValue: 12000,
      leaseTerm: 24,
      interestRate: 0,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeCloseTo(500, 2); // Only depreciation
    expect(result.depreciationFee).toBeCloseTo(500, 2);
    expect(result.financeFee).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  it('should calculate for high interest rate', () => {
    const inputs: LeaseInputs = {
      assetValue: 50000,
      residualValue: 25000,
      leaseTerm: 48,
      interestRate: 12,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(result.depreciationFee);
    expect(result.financeFee).toBeGreaterThan(0);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it('should calculate for short 12-month lease', () => {
    const inputs: LeaseInputs = {
      assetValue: 15000,
      residualValue: 10000,
      leaseTerm: 12,
      interestRate: 6,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.depreciationFee).toBeCloseTo(416.67, 2);
    expect(result.totalPayments).toBeCloseTo(result.monthlyPayment * 12, 2);
  });

  it('should calculate for long 60-month lease', () => {
    const inputs: LeaseInputs = {
      assetValue: 40000,
      residualValue: 16000,
      leaseTerm: 60,
      interestRate: 4.5,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalDepreciation).toBe(24000);
    expect(result.depreciationFee).toBeCloseTo(400, 2);
  });

  it('should calculate for equipment lease with low residual', () => {
    const inputs: LeaseInputs = {
      assetValue: 100000,
      residualValue: 20000,
      leaseTerm: 36,
      interestRate: 7,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalDepreciation).toBe(80000);
    expect(result.totalPayments).toBeGreaterThan(80000); // Should include interest
  });

  it('should calculate correctly with high residual value', () => {
    const inputs: LeaseInputs = {
      assetValue: 50000,
      residualValue: 40000,
      leaseTerm: 24,
      interestRate: 5,
    };

    const result = calculateLease(inputs);

    expect(result.totalDepreciation).toBe(10000);
    expect(result.depreciationFee).toBeCloseTo(416.67, 2);
    expect(result.financeFee).toBeGreaterThan(0);
  });
});

describe('Lease Calculator - Fixed Payment Mode', () => {
  it('should calculate effective rate for known payment', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      monthlyPayment: 500,
    };

    const result = calculateLease(inputs);

    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(50);
    expect(result.monthlyPayment).toBe(500);
    expect(result.totalPayments).toBe(18000);
  });

  it('should calculate rate for minimum payment (depreciation only)', () => {
    const inputs: LeaseInputs = {
      assetValue: 24000,
      residualValue: 12000,
      leaseTerm: 24,
      monthlyPayment: 500,
    };

    const result = calculateLease(inputs);

    expect(result.effectiveRate).toBeCloseTo(0, 1); // Very low rate
    expect(result.totalInterest).toBeCloseTo(0, 0);
  });

  it('should calculate rate for high payment', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      monthlyPayment: 600,
    };

    const result = calculateLease(inputs);

    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.totalPayments).toBe(21600);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it('should error if payment too low to cover depreciation', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      monthlyPayment: 300, // Less than 416.67 minimum
    };

    expect(() => calculateLease(inputs)).toThrow(
      'too low to cover depreciation'
    );
  });

  it('should calculate rate for different lease terms', () => {
    const inputs: LeaseInputs = {
      assetValue: 40000,
      residualValue: 20000,
      leaseTerm: 48,
      monthlyPayment: 500,
    };

    const result = calculateLease(inputs);

    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.totalPayments).toBe(24000);
  });
});

describe('Lease Calculator - Payment Components', () => {
  it('should correctly split payment into depreciation and finance fees', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      interestRate: 6,
    };

    const result = calculateLease(inputs);

    const reconstructedPayment = result.depreciationFee + result.financeFee;
    expect(reconstructedPayment).toBeCloseTo(result.monthlyPayment, 2);
    expect(result.depreciationFee).toBeCloseTo(416.67, 2);
    expect(result.financeFee).toBeGreaterThan(0);
  });

  it('should have zero finance fee with 0% interest', () => {
    const inputs: LeaseInputs = {
      assetValue: 20000,
      residualValue: 10000,
      leaseTerm: 24,
      interestRate: 0,
    };

    const result = calculateLease(inputs);

    expect(result.financeFee).toBe(0);
    expect(result.monthlyPayment).toBeCloseTo(result.depreciationFee, 2);
  });

  it('should calculate total interest correctly', () => {
    const inputs: LeaseInputs = {
      assetValue: 50000,
      residualValue: 30000,
      leaseTerm: 36,
      interestRate: 8,
    };

    const result = calculateLease(inputs);

    const expectedInterest = result.totalPayments - result.totalDepreciation;
    expect(result.totalInterest).toBeCloseTo(expectedInterest, 2);
  });
});

describe('Lease Calculator - Edge Cases', () => {
  it('should handle very small asset values', () => {
    const inputs: LeaseInputs = {
      assetValue: 1000,
      residualValue: 500,
      leaseTerm: 12,
      interestRate: 5,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalDepreciation).toBe(500);
  });

  it('should handle very large asset values', () => {
    const inputs: LeaseInputs = {
      assetValue: 1000000,
      residualValue: 500000,
      leaseTerm: 60,
      interestRate: 6,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalDepreciation).toBe(500000);
  });

  it('should handle very short lease term', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: 8000,
      leaseTerm: 1,
      interestRate: 5,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.depreciationFee).toBe(2000);
  });

  it('should handle very long lease term', () => {
    const inputs: LeaseInputs = {
      assetValue: 50000,
      residualValue: 10000,
      leaseTerm: 120,
      interestRate: 5,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.depreciationFee).toBeCloseTo(333.33, 2);
  });

  it('should handle near-zero residual value', () => {
    const inputs: LeaseInputs = {
      assetValue: 25000,
      residualValue: 100,
      leaseTerm: 36,
      interestRate: 6,
    };

    const result = calculateLease(inputs);

    expect(result.totalDepreciation).toBe(24900);
    expect(result.monthlyPayment).toBeGreaterThan(0);
  });

  it('should handle fractional interest rates', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      interestRate: 5.75,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.financeFee).toBeGreaterThan(0);
  });
});

describe('Lease Calculator - Validation', () => {
  it('should reject negative asset value', () => {
    const inputs: LeaseInputs = {
      assetValue: -1000,
      residualValue: 500,
      leaseTerm: 12,
      interestRate: 5,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Asset value must be greater than 0'
    );
  });

  it('should reject zero asset value', () => {
    const inputs: LeaseInputs = {
      assetValue: 0,
      residualValue: 0,
      leaseTerm: 12,
      interestRate: 5,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Asset value must be greater than 0'
    );
  });

  it('should reject negative residual value', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: -1000,
      leaseTerm: 12,
      interestRate: 5,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Residual value cannot be negative'
    );
  });

  it('should reject residual value >= asset value', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: 10000,
      leaseTerm: 12,
      interestRate: 5,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Residual value must be less than asset value'
    );
  });

  it('should reject residual value > asset value', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: 15000,
      leaseTerm: 12,
      interestRate: 5,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Residual value must be less than asset value'
    );
  });

  it('should reject zero lease term', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: 5000,
      leaseTerm: 0,
      interestRate: 5,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Lease term must be greater than 0'
    );
  });

  it('should reject negative lease term', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: 5000,
      leaseTerm: -12,
      interestRate: 5,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Lease term must be greater than 0'
    );
  });

  it('should reject negative interest rate', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: 5000,
      leaseTerm: 12,
      interestRate: -5,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Interest rate cannot be negative'
    );
  });

  it('should reject when neither rate nor payment provided', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: 5000,
      leaseTerm: 12,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Either interest rate or monthly payment must be provided'
    );
  });

  it('should reject zero monthly payment', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: 5000,
      leaseTerm: 12,
      monthlyPayment: 0,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Monthly payment must be greater than 0'
    );
  });

  it('should reject negative monthly payment', () => {
    const inputs: LeaseInputs = {
      assetValue: 10000,
      residualValue: 5000,
      leaseTerm: 12,
      monthlyPayment: -100,
    };

    expect(() => calculateLease(inputs)).toThrow(
      'Monthly payment must be greater than 0'
    );
  });
});

describe('Lease Calculator - validateInputs function', () => {
  it('should return empty array for valid fixed rate inputs', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      interestRate: 5,
    };

    const errors = validateInputs(inputs);
    expect(errors).toHaveLength(0);
  });

  it('should return empty array for valid fixed payment inputs', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      monthlyPayment: 500,
    };

    const errors = validateInputs(inputs);
    expect(errors).toHaveLength(0);
  });

  it('should detect unusually high asset value', () => {
    const inputs: LeaseInputs = {
      assetValue: 200000000,
      residualValue: 100000000,
      leaseTerm: 36,
      interestRate: 5,
    };

    const errors = validateInputs(inputs);
    expect(errors).toContain('Asset value seems unusually high');
  });

  it('should detect unusually long lease term', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 400,
      interestRate: 5,
    };

    const errors = validateInputs(inputs);
    expect(errors).toContain('Lease term cannot exceed 360 months (30 years)');
  });

  it('should detect unusually high interest rate', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      interestRate: 60,
    };

    const errors = validateInputs(inputs);
    expect(errors).toContain('Interest rate seems unusually high');
  });

  it('should detect payment too low to cover depreciation', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 15000,
      leaseTerm: 36,
      monthlyPayment: 300,
    };

    const errors = validateInputs(inputs);
    expect(errors.some((e) => e.includes('too low'))).toBe(true);
  });

  it('should return multiple errors for multiple issues', () => {
    const inputs: LeaseInputs = {
      assetValue: -1000,
      residualValue: 5000,
      leaseTerm: -12,
      interestRate: -5,
    };

    const errors = validateInputs(inputs);
    expect(errors.length).toBeGreaterThan(1);
  });
});

describe('Lease Calculator - Real-world Scenarios', () => {
  it('should calculate for typical vehicle lease', () => {
    const inputs: LeaseInputs = {
      assetValue: 35000,
      residualValue: 18000,
      leaseTerm: 36,
      interestRate: 4.5,
    };

    const result = calculateLease(inputs);

    expect(result.monthlyPayment).toBeGreaterThan(400);
    expect(result.monthlyPayment).toBeLessThan(600);
    expect(result.totalDepreciation).toBe(17000);
  });

  it('should calculate for equipment lease with low residual', () => {
    const inputs: LeaseInputs = {
      assetValue: 75000,
      residualValue: 15000,
      leaseTerm: 48,
      interestRate: 7,
    };

    const result = calculateLease(inputs);

    expect(result.totalDepreciation).toBe(60000);
    expect(result.depreciationFee).toBeCloseTo(1250, 2);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it('should calculate for luxury vehicle lease', () => {
    const inputs: LeaseInputs = {
      assetValue: 80000,
      residualValue: 48000,
      leaseTerm: 36,
      interestRate: 3.9,
    };

    const result = calculateLease(inputs);

    expect(result.totalDepreciation).toBe(32000);
    expect(result.monthlyPayment).toBeGreaterThan(800);
  });

  it('should calculate effective rate for known vehicle payment', () => {
    const inputs: LeaseInputs = {
      assetValue: 30000,
      residualValue: 18000,
      leaseTerm: 36,
      monthlyPayment: 400,
    };

    const result = calculateLease(inputs);

    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(10);
    expect(result.totalPayments).toBe(14400);
  });
});
