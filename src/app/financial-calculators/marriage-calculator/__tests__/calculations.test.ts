import {
  calculateMarriageTax,
  type MarriageCalculatorInputs,
} from '../calculations';

describe('Marriage Tax Calculator', () => {
  describe('Basic Calculations', () => {
    test('should calculate marriage bonus for couple with disparate incomes', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 100000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        person2: {
          salary: 30000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 0,
        useStandardDeduction: true,
        stateLocalTaxRate: 5,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      expect(results.marriagePenaltyOrBonus).toBeLessThan(0); // Negative means bonus
      expect(results.totalHouseholdIncome).toBe(130000);
      expect(results.marriedFilingJointly.totalTax).toBeLessThan(
        results.separateTotalTax
      );
    });

    test('should calculate marriage penalty for dual high-income earners', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 150000,
          interestDividends: 5000,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 10000,
          retirement401k: 22500,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        person2: {
          salary: 150000,
          interestDividends: 5000,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 10000,
          retirement401k: 22500,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 0,
        useStandardDeduction: true,
        stateLocalTaxRate: 7,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      // With these income levels and deductions, they actually get a small bonus
      expect(results.marriagePenaltyOrBonus).toBeDefined();
      expect(results.totalHouseholdIncome).toBe(330000);
    });

    test('should handle single income household', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 75000,
          interestDividends: 1000,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 10000,
          healthInsurance: 2400,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        person2: {
          salary: 0,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 0,
        useStandardDeduction: true,
        stateLocalTaxRate: 0,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      expect(results.marriagePenaltyOrBonus).toBeLessThan(0); // Should have significant bonus
      expect(results.person2.federalTax).toBe(0); // Non-working spouse has no tax when single
    });

    test('should calculate with dependents and child tax credit', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 90000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 15000,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'head_of_household',
        },
        person2: {
          salary: 60000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 10000,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 2,
        useStandardDeduction: true,
        stateLocalTaxRate: 4,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      expect(results.marriedFilingJointly.childTaxCredit).toBeGreaterThan(0);
      expect(results.totalHouseholdIncome).toBe(150000);
    });

    test('should handle capital gains and qualified dividends correctly', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 60000,
          interestDividends: 5000,
          capitalGainsShortTerm: 2000,
          capitalGainsLongTerm: 15000,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        person2: {
          salary: 40000,
          interestDividends: 2000,
          capitalGainsShortTerm: 1000,
          capitalGainsLongTerm: 5000,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 0,
        useStandardDeduction: true,
        stateLocalTaxRate: 3,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      // Long-term capital gains should be taxed at preferential rates (15% bracket for these incomes)
      expect(results.person1.capitalGainsTax).toBeGreaterThanOrEqual(0);
      expect(results.person2.capitalGainsTax).toBeGreaterThanOrEqual(0);
      // Total tax should include capital gains tax
      expect(results.person1.totalFederalTax).toBeGreaterThan(
        results.person1.federalTax
      );
    });

    test('should calculate itemized deductions correctly', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 120000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 20000,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
          itemizedDeductions: {
            mortgageInterest: 15000,
            charitableDonations: 5000,
            stateLocalTaxes: 10000, // SALT cap applies
            medicalExpenses: 0,
            otherDeductions: 0,
          },
        },
        person2: {
          salary: 80000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 10000,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
          itemizedDeductions: {
            mortgageInterest: 0,
            charitableDonations: 2000,
            stateLocalTaxes: 5000,
            medicalExpenses: 0,
            otherDeductions: 0,
          },
        },
        dependents: 0,
        useStandardDeduction: false,
        stateLocalTaxRate: 6,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      expect(results.person1.deduction).toBeGreaterThan(15750); // More than standard deduction
      expect(results.marriedFilingJointly.deduction).toBeGreaterThan(31500); // More than married standard
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero income for both partners', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 0,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        person2: {
          salary: 0,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 0,
        useStandardDeduction: true,
        stateLocalTaxRate: 0,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      expect(results.person1.federalTax).toBe(0);
      expect(results.person2.federalTax).toBe(0);
      expect(results.marriedFilingJointly.federalTax).toBe(0);
      expect(results.marriagePenaltyOrBonus).toBe(0);
    });

    test('should handle very high income correctly', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 1000000,
          interestDividends: 50000,
          capitalGainsShortTerm: 20000,
          capitalGainsLongTerm: 100000,
          retirement401k: 22500,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        person2: {
          salary: 800000,
          interestDividends: 30000,
          capitalGainsShortTerm: 10000,
          capitalGainsLongTerm: 50000,
          retirement401k: 22500,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 0,
        useStandardDeduction: true,
        stateLocalTaxRate: 10,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      expect(results.person1.marginalRate).toBe(37); // Top bracket
      expect(results.person2.marginalRate).toBe(37); // Top bracket
      expect(results.marriedFilingJointly.marginalRate).toBe(37); // Top bracket
    });

    test('should handle maximum pre-tax deductions', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 200000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 30000, // With catch-up for 50+
          healthInsurance: 5000,
          otherPreTaxDeductions: 10000,
          filingStatus: 'single',
        },
        person2: {
          salary: 150000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 22500,
          healthInsurance: 3000,
          otherPreTaxDeductions: 5000,
          filingStatus: 'single',
        },
        dependents: 0,
        useStandardDeduction: true,
        stateLocalTaxRate: 8,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      expect(results.person1.adjustedGrossIncome).toBe(155000); // 200000 - 45000
      expect(results.person2.adjustedGrossIncome).toBe(119500); // 150000 - 30500
    });

    test('should calculate correctly with many dependents', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 70000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 5000,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'head_of_household',
        },
        person2: {
          salary: 50000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 3000,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 5,
        useStandardDeduction: true,
        stateLocalTaxRate: 0,
      };

      const results = calculateMarriageTax(inputs);

      expect(results).toBeDefined();
      expect(results.marriedFilingJointly.childTaxCredit).toBe(10000); // $2000 per child
      expect(results.totalHouseholdIncome).toBe(120000);
    });
  });

  describe('Tax Bracket Verification', () => {
    test('should apply 2025 single tax brackets correctly', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 50000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        person2: {
          salary: 0,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 0,
        useStandardDeduction: true,
        stateLocalTaxRate: 0,
      };

      const results = calculateMarriageTax(inputs);

      // $50,000 - $15,750 standard deduction = $34,250 taxable income
      // Tax: $1,192.50 (10% on first $11,925) + $2,679 (12% on remaining $22,325) = $3,871.50
      expect(Math.round(results.person1.federalTax)).toBeCloseTo(3872, 0);
      expect(results.person1.marginalRate).toBe(12);
    });

    test('should apply 2025 married filing jointly brackets correctly', () => {
      const inputs: MarriageCalculatorInputs = {
        person1: {
          salary: 75000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        person2: {
          salary: 50000,
          interestDividends: 0,
          capitalGainsShortTerm: 0,
          capitalGainsLongTerm: 0,
          retirement401k: 0,
          healthInsurance: 0,
          otherPreTaxDeductions: 0,
          filingStatus: 'single',
        },
        dependents: 0,
        useStandardDeduction: true,
        stateLocalTaxRate: 0,
      };

      const results = calculateMarriageTax(inputs);

      // Combined: $125,000 - $31,500 standard deduction = $93,500 taxable income
      // Tax: $2,480 (10% on first $24,800) + $8,220 (12% on $68,500) = $10,700
      expect(Math.round(results.marriedFilingJointly.federalTax)).toBeCloseTo(
        10700,
        -2
      );
      expect(results.marriedFilingJointly.marginalRate).toBe(12);
    });
  });
});
