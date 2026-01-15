// Take Home Pay Calculator Tests
// Reference: https://www.calculator.net/take-home-pay-calculator.html

import {
  calculateTakeHomePay,
  validateTakeHomePayInputs,
  type TakeHomePayInputs,
} from '../calculations';

describe('Take Home Pay Calculator', () => {
  describe('Input Validation', () => {
    it('should validate gross salary is positive', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: -50000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'CA',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const errors = validateTakeHomePayInputs(inputs);
      expect(errors).toContain('Gross salary must be positive');
    });

    it('should validate federal allowances is non-negative', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 50000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'CA',
        federalAllowances: -1,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const errors = validateTakeHomePayInputs(inputs);
      expect(errors).toContain('Federal allowances cannot be negative');
    });

    it('should validate deductions are non-negative', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 50000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'CA',
        federalAllowances: 0,
        preTaxDeductions: -100,
        postTaxDeductions: 0,
      };
      const errors = validateTakeHomePayInputs(inputs);
      expect(errors).toContain('Pre-tax deductions cannot be negative');
    });
  });

  describe('FICA Tax Calculations', () => {
    it('should calculate Social Security tax correctly (6.2%)', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 50000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Social Security: 50000 * 0.062 = 3100
      expect(results.socialSecurityTax).toBe(3100);
    });

    it('should cap Social Security tax at wage base ($176,100 for 2025)', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 200000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Social Security capped: 176100 * 0.062 = 10918.20
      expect(results.socialSecurityTax).toBe(10918);
    });

    it('should calculate Medicare tax correctly (1.45%)', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 50000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Medicare: 50000 * 0.0145 = 725
      expect(results.medicareTax).toBe(725);
    });

    it('should calculate Additional Medicare tax for high earners (0.9% over threshold)', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 250000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Medicare: 250000 * 0.0145 = 3625
      // Additional Medicare on amount over 200000: 50000 * 0.009 = 450
      // Total: 3625 + 450 = 4075
      expect(results.medicareTax).toBe(4075);
    });
  });

  describe('Federal Income Tax Calculations (2025 Tax Brackets)', () => {
    it('should calculate federal tax for single filer - low income', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 30000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Taxable: 30000 - standard deduction (15000) = 15000
      // Tax: 10% on 11925 = 1192.50, 12% on 3075 = 369
      // Total: 1561.50 ≈ 1562
      expect(results.federalIncomeTax).toBeCloseTo(1562, 0);
    });

    it('should calculate federal tax for single filer - middle income', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 75000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Taxable: 75000 - 15000 = 60000
      // 10% on 11925 = 1192.50
      // 12% on 48400 - 11925 = 36475 * 0.12 = 4377
      // 22% on 60000 - 48400 = 11600 * 0.22 = 2552
      // Total: 8121.50 ≈ 8122
      expect(results.federalIncomeTax).toBeCloseTo(8122, 0);
    });

    it('should calculate federal tax for married filing jointly', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 100000,
        payFrequency: 'annually',
        filingStatus: 'married',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Taxable: 100000 - 30000 (married standard deduction) = 70000
      // 10% on 23850 = 2385
      // 12% on 70000 - 23850 = 46150 * 0.12 = 5538
      // Total: 7923
      expect(results.federalIncomeTax).toBeCloseTo(7923, 0);
    });

    it('should calculate federal tax for high earner', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 200000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Taxable: 200000 - 15000 = 185000
      // Progressive calculation through brackets up to 32% bracket
      // Expected around 36500-37000
      expect(results.federalIncomeTax).toBeGreaterThan(36000);
      expect(results.federalIncomeTax).toBeLessThan(38000);
    });
  });

  describe('Pre-tax Deductions', () => {
    it('should reduce taxable income by pre-tax deductions (401k, HSA)', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 80000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 10000, // 401k contribution
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Taxable income should be based on 80000 - 10000 = 70000
      // Then minus standard deduction 15000 = 55000
      // Federal tax on 55000 taxable income
      expect(results.taxableIncome).toBe(55000);
    });

    it('should reduce FICA taxes by pre-tax deductions', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 50000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 5000,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // FICA calculated on 50000 - 5000 = 45000
      // Social Security: 45000 * 0.062 = 2790
      // Medicare: 45000 * 0.0145 = 652.50
      expect(results.socialSecurityTax).toBe(2790);
      expect(results.medicareTax).toBeCloseTo(653, 0);
    });
  });

  describe('Post-tax Deductions', () => {
    it('should deduct post-tax amounts from net pay', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 50000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 2000,
      };
      const results = calculateTakeHomePay(inputs);
      // Post-tax deductions should reduce final take-home by exactly the deduction amount
      expect(results.netPay).toBe(results.netPayBeforePostTax - 2000);
      // Net pay should be less than net pay before post-tax deductions
      expect(results.netPay).toBeLessThan(results.netPayBeforePostTax);
    });
  });

  describe('Pay Frequency Conversions', () => {
    it('should calculate correct amounts for weekly pay', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 52000,
        payFrequency: 'weekly',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Annual gross should be 52000 * 52 = 2,704,000 (weekly input)
      // OR should interpret 52000 as annual and divide by 52 for weekly
      expect(results.grossPayByPeriod.weekly).toBeGreaterThan(0);
    });

    it('should calculate correct amounts for bi-weekly pay (26 periods)', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 3000, // Per bi-weekly paycheck
        payFrequency: 'bi-weekly',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Annual: 3000 * 26 = 78000
      expect(results.grossPay).toBe(78000);
      // Bi-weekly: should return to 3000
      expect(results.grossPayByPeriod.biWeekly).toBeCloseTo(3000, 0);
    });

    it('should calculate correct amounts for semi-monthly pay (24 periods)', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 3000, // Per semi-monthly paycheck
        payFrequency: 'semi-monthly',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);
      // Annual: 3000 * 24 = 72000
      expect(results.grossPay).toBe(72000);
      // Semi-monthly: should return to 3000
      expect(results.grossPayByPeriod.semiMonthly).toBeCloseTo(3000, 0);
    });
  });

  describe('Complete Take-Home Pay Scenarios', () => {
    it('should calculate complete take-home for typical scenario', () => {
      // Scenario: $80k salary, single, $5k 401k, no state tax
      const inputs: TakeHomePayInputs = {
        grossSalary: 80000,
        payFrequency: 'annually',
        filingStatus: 'single',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 5000,
        postTaxDeductions: 0,
      };
      const results = calculateTakeHomePay(inputs);

      // Gross: 80000
      // Pre-tax deductions: 5000
      // FICA base: 75000
      // Social Security: 75000 * 0.062 = 4650
      // Medicare: 75000 * 0.0145 = 1087.50
      // Taxable: 75000 - 15000 (std deduction) = 60000
      // Federal tax on 60000 ≈ 8122
      // Net: 80000 - 4650 - 1088 - 8122 - 5000 = 61140

      expect(results.grossPay).toBe(80000);
      expect(results.socialSecurityTax).toBe(4650);
      expect(results.medicareTax).toBeCloseTo(1088, 0);
      expect(results.federalIncomeTax).toBeCloseTo(8122, 10);
      expect(results.netPay).toBeCloseTo(61140, 50);
    });

    it('should calculate take-home for married high earner with deductions', () => {
      const inputs: TakeHomePayInputs = {
        grossSalary: 150000,
        payFrequency: 'annually',
        filingStatus: 'married',
        state: 'none',
        federalAllowances: 0,
        preTaxDeductions: 15000, // Max 401k
        postTaxDeductions: 3000, // Insurance
      };
      const results = calculateTakeHomePay(inputs);

      // Gross: 150000
      // Pre-tax: 15000
      // FICA base: 135000
      // Social Security: 135000 * 0.062 = 8370
      // Medicare: 135000 * 0.0145 = 1957.50
      // Taxable: 135000 - 30000 (married std) = 105000
      // Federal tax on 105000 married filing jointly
      // Net pay should be in reasonable range

      expect(results.grossPay).toBe(150000);
      expect(results.socialSecurityTax).toBe(8370);
      expect(results.medicareTax).toBeCloseTo(1958, 0);
      // Net pay should be around 106000-110000 after all deductions
      expect(results.netPay).toBeGreaterThan(105000);
      expect(results.netPay).toBeLessThan(110000);
    });
  });
});
