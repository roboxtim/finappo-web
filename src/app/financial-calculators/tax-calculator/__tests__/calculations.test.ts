import {
  calculateTax,
  calculateTaxByBracket,
  getStandardDeduction,
  calculateChildTaxCredit,
  calculateEITC,
  formatCurrency,
  formatPercentage,
  type TaxInputs,
} from '../calculations';

describe('Tax Calculator', () => {
  describe('Standard Deduction', () => {
    it('should return correct standard deduction for single filer', () => {
      expect(getStandardDeduction('single')).toBe(15750);
    });

    it('should return correct standard deduction for married filing jointly', () => {
      expect(getStandardDeduction('marriedJointly')).toBe(31500);
    });

    it('should return correct standard deduction for married filing separately', () => {
      expect(getStandardDeduction('marriedSeparately')).toBe(15750);
    });

    it('should return correct standard deduction for head of household', () => {
      expect(getStandardDeduction('headOfHousehold')).toBe(23625);
    });
  });

  describe('Tax Bracket Calculations', () => {
    it('should calculate tax correctly for single filer in 10% bracket', () => {
      const taxableIncome = 10000;
      const result = calculateTaxByBracket(taxableIncome, 'single');
      expect(result.federalTax).toBe(1000); // 10% of $10,000
      expect(result.marginalRate).toBe(10);
      expect(Math.round(result.effectiveRate * 100) / 100).toBe(10);
    });

    it('should calculate tax correctly for single filer across multiple brackets', () => {
      const taxableIncome = 50000;
      const result = calculateTaxByBracket(taxableIncome, 'single');
      // $11,925 at 10% = $1,192.50
      // $36,550 at 12% = $4,386.00 (48,475 - 11,925)
      // $1,525 at 22% = $335.50 (50,000 - 48,475)
      const expectedTax = 1192.5 + 4386.0 + 335.5;
      expect(result.federalTax).toBeCloseTo(expectedTax, 2);
      expect(result.marginalRate).toBe(22);
    });

    it('should calculate tax correctly for married filing jointly', () => {
      const taxableIncome = 100000;
      const result = calculateTaxByBracket(taxableIncome, 'marriedJointly');
      // $23,850 at 10% = $2,385.00
      // $73,100 at 12% = $8,772.00 (96,950 - 23,850)
      // $3,050 at 22% = $671.00 (100,000 - 96,950)
      const expectedTax = 2385.0 + 8772.0 + 671.0;
      expect(result.federalTax).toBeCloseTo(expectedTax, 2);
      expect(result.marginalRate).toBe(22);
    });
  });

  describe('Child Tax Credit', () => {
    it('should calculate full credit for qualifying children', () => {
      const credit = calculateChildTaxCredit(2, 0, 50000, 'single');
      expect(credit.total).toBe(4400); // 2 * $2,200
      expect(credit.refundable).toBe(3400); // 2 * $1,700
    });

    it('should phase out credit for high income single filer', () => {
      const credit = calculateChildTaxCredit(1, 0, 250000, 'single');
      // Phase out starts at $200,000, reduces by $50 per $1,000 over
      // $50,000 over = 50 * $50 = $2,500 reduction
      // But max reduction is $2,200, so credit becomes 0
      expect(credit.total).toBe(0);
    });

    it('should phase out credit for high income married filing jointly', () => {
      const credit = calculateChildTaxCredit(2, 0, 450000, 'marriedJointly');
      // Phase out starts at $400,000, $50,000 over
      // 50 * $50 = $2,500 reduction total
      // $2,200 * 2 = $4,400 total credit - $2,500 reduction = $1,900
      expect(credit.total).toBe(1900);
    });

    it('should include credit for other dependents', () => {
      const credit = calculateChildTaxCredit(1, 2, 100000, 'single');
      expect(credit.total).toBe(3200); // 1 * $2,200 + 2 * $500
      expect(credit.refundable).toBe(1700); // Only child credit is refundable
    });
  });

  describe('Earned Income Tax Credit', () => {
    it('should calculate EITC for single filer with no children', () => {
      const eitc = calculateEITC(15000, 'single', 0);
      expect(eitc).toBeGreaterThan(0);
      expect(eitc).toBeLessThanOrEqual(649);
    });

    it('should calculate maximum EITC for single filer with 2 children', () => {
      const eitc = calculateEITC(20000, 'single', 2);
      expect(eitc).toBeGreaterThan(0);
      expect(eitc).toBeLessThanOrEqual(7152);
    });

    it('should return 0 EITC for high income', () => {
      const eitc = calculateEITC(100000, 'single', 1);
      expect(eitc).toBe(0);
    });

    it('should calculate EITC for married filing jointly with 3 children', () => {
      const eitc = calculateEITC(30000, 'marriedJointly', 3);
      expect(eitc).toBeGreaterThan(0);
      expect(eitc).toBeLessThanOrEqual(8046);
    });
  });

  describe('Full Tax Calculation', () => {
    describe('Test Case 1: Single filer, $50,000 income', () => {
      it('should calculate correct tax', () => {
        const inputs: TaxInputs = {
          filingStatus: 'single',
          grossIncome: 50000,
          dependentsUnder17: 0,
          dependentsOver17: 0,
          preTaxDeductions: 0,
          itemizedDeductions: 0,
          federalWithholding: 0,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        // AGI = $50,000
        // Standard deduction = $15,750
        // Taxable income = $34,250
        // Tax = $11,925 * 0.10 + $22,325 * 0.12 = $1,192.50 + $2,679 = $3,871.50
        expect(result.taxableIncome).toBe(34250);
        expect(result.federalTax).toBeCloseTo(3871.5, 2);
        expect(result.marginalRate).toBe(12);
        // Effective rate is based on taxable income: 3871.50 / 34250 = 11.3%
        expect(result.effectiveRate).toBeCloseTo(11.3, 1);
      });
    });

    describe('Test Case 2: Single filer, $100,000 income', () => {
      it('should calculate correct tax', () => {
        const inputs: TaxInputs = {
          filingStatus: 'single',
          grossIncome: 100000,
          dependentsUnder17: 0,
          dependentsOver17: 0,
          preTaxDeductions: 0,
          itemizedDeductions: 0,
          federalWithholding: 0,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        // Taxable income = $100,000 - $15,750 = $84,250
        expect(result.taxableIncome).toBe(84250);
        expect(result.marginalRate).toBe(22);
        expect(result.federalTax).toBeGreaterThan(10000);
        expect(result.federalTax).toBeLessThan(20000);
      });
    });

    describe('Test Case 3: Married filing jointly, $120,000 income', () => {
      it('should calculate correct tax', () => {
        const inputs: TaxInputs = {
          filingStatus: 'marriedJointly',
          grossIncome: 120000,
          dependentsUnder17: 0,
          dependentsOver17: 0,
          preTaxDeductions: 0,
          itemizedDeductions: 0,
          federalWithholding: 0,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        // Taxable income = $120,000 - $31,500 = $88,500
        expect(result.taxableIncome).toBe(88500);
        expect(result.marginalRate).toBe(12);
      });
    });

    describe('Test Case 4: High earner single, $200,000 income', () => {
      it('should calculate correct tax', () => {
        const inputs: TaxInputs = {
          filingStatus: 'single',
          grossIncome: 200000,
          dependentsUnder17: 0,
          dependentsOver17: 0,
          preTaxDeductions: 0,
          itemizedDeductions: 0,
          federalWithholding: 0,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        // Taxable income = $200,000 - $15,750 = $184,250
        expect(result.taxableIncome).toBe(184250);
        expect(result.marginalRate).toBe(24);
        expect(result.federalTax).toBeGreaterThan(30000);
      });
    });

    describe('Test Case 5: Family with children', () => {
      it('should calculate correct tax with child tax credit', () => {
        const inputs: TaxInputs = {
          filingStatus: 'marriedJointly',
          grossIncome: 80000,
          dependentsUnder17: 2,
          dependentsOver17: 0,
          preTaxDeductions: 0,
          itemizedDeductions: 0,
          federalWithholding: 5000,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        // Taxable income = $80,000 - $31,500 = $48,500
        expect(result.taxableIncome).toBe(48500);
        expect(result.childTaxCredit.total).toBe(4400); // 2 * $2,200
        expect(result.taxAfterCredits).toBeLessThan(result.federalTax);
        expect(result.refundOrOwed).toBeGreaterThan(0); // Should get refund
      });
    });

    describe('Test Case 6: Itemized deductions', () => {
      it('should use itemized deductions when greater than standard', () => {
        const inputs: TaxInputs = {
          filingStatus: 'single',
          grossIncome: 150000,
          dependentsUnder17: 0,
          dependentsOver17: 0,
          preTaxDeductions: 5000,
          itemizedDeductions: 25000, // Greater than $15,750 standard
          federalWithholding: 20000,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        // AGI = $150,000 - $5,000 = $145,000
        // Taxable income = $145,000 - $25,000 = $120,000
        expect(result.adjustedGrossIncome).toBe(145000);
        expect(result.taxableIncome).toBe(120000);
        expect(result.deductionUsed).toBe(25000);
        expect(result.deductionType).toBe('itemized');
      });
    });

    describe('Test Case 7: EITC eligibility', () => {
      it('should calculate EITC for low income family', () => {
        const inputs: TaxInputs = {
          filingStatus: 'marriedJointly',
          grossIncome: 35000,
          dependentsUnder17: 2,
          dependentsOver17: 0,
          preTaxDeductions: 0,
          itemizedDeductions: 0,
          federalWithholding: 1000,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        expect(result.earnedIncomeCredit).toBeGreaterThan(0);
        expect(result.childTaxCredit.total).toBe(4400);
        // Low income with credits should result in refund
        expect(result.refundOrOwed).toBeGreaterThan(0);
      });
    });

    describe('Test Case 8: Head of household', () => {
      it('should calculate correct tax for head of household', () => {
        const inputs: TaxInputs = {
          filingStatus: 'headOfHousehold',
          grossIncome: 75000,
          dependentsUnder17: 1,
          dependentsOver17: 0,
          preTaxDeductions: 2000,
          itemizedDeductions: 0,
          federalWithholding: 8000,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        // AGI = $75,000 - $2,000 = $73,000
        // Standard deduction for HOH = $23,625
        // Taxable income = $73,000 - $23,625 = $49,375
        expect(result.adjustedGrossIncome).toBe(73000);
        expect(result.taxableIncome).toBe(49375);
        expect(result.childTaxCredit.total).toBe(2200);
      });
    });

    describe('Test Case 9: Maximum tax bracket', () => {
      it('should calculate correct tax for highest bracket', () => {
        const inputs: TaxInputs = {
          filingStatus: 'single',
          grossIncome: 1000000,
          dependentsUnder17: 0,
          dependentsOver17: 0,
          preTaxDeductions: 0,
          itemizedDeductions: 50000,
          federalWithholding: 300000,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        expect(result.marginalRate).toBe(37);
        expect(result.federalTax).toBeGreaterThan(200000);
      });
    });

    describe('Test Case 10: Pre-tax deductions (401k, etc)', () => {
      it('should correctly reduce AGI with pre-tax deductions', () => {
        const inputs: TaxInputs = {
          filingStatus: 'single',
          grossIncome: 85000,
          dependentsUnder17: 0,
          dependentsOver17: 0,
          preTaxDeductions: 22500, // Max 401k contribution
          itemizedDeductions: 0,
          federalWithholding: 10000,
          stateWithholding: 0,
          otherCredits: 0,
        };

        const result = calculateTax(inputs);

        // AGI = $85,000 - $22,500 = $62,500
        expect(result.adjustedGrossIncome).toBe(62500);
        // Taxable = $62,500 - $15,750 = $46,750
        expect(result.taxableIncome).toBe(46750);
      });
    });
  });

  describe('Formatting Functions', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-500)).toBe('-$500.00');
    });

    it('should format percentage correctly', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%');
      expect(formatPercentage(0.05)).toBe('5.00%');
      expect(formatPercentage(1)).toBe('100.00%');
    });
  });
});
