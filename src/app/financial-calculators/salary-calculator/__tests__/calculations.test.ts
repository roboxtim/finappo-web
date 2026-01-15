import {
  calculateSalaryResults,
  validateSalaryInputs,
  convertSalary,
  calculateFederalTax,
  calculateStateTax,
  calculateFICATax,
  type SalaryInputs,
} from '../calculations';

describe('Salary Calculator', () => {
  describe('convertSalary', () => {
    it('should convert hourly to annual (40 hours/week)', () => {
      const result = convertSalary(25, 'hourly', 40, 5, 10, 10);
      // $25/hour * 40 hours/week * 52 weeks = $52,000
      // Adjusted: $25 * 40 * (52 - 10/5 - 10/5) = $25 * 40 * 48 = $48,000
      expect(result.annual.unadjusted).toBe(52000);
      expect(result.annual.adjusted).toBe(48000);
    });

    it('should convert annual to all periods', () => {
      const result = convertSalary(100000, 'annual', 40, 5, 10, 10);

      // Unadjusted calculations
      expect(result.annual.unadjusted).toBe(100000);
      expect(result.quarterly.unadjusted).toBe(25000); // 100000/4
      expect(result.monthly.unadjusted).toBeCloseTo(8333.33, 2); // 100000/12
      expect(result.semiMonthly.unadjusted).toBeCloseTo(4166.67, 2); // 100000/24
      expect(result.biWeekly.unadjusted).toBeCloseTo(3846.15, 2); // 100000/26
      expect(result.weekly.unadjusted).toBeCloseTo(1923.08, 2); // 100000/52
      expect(result.daily.unadjusted).toBeCloseTo(384.62, 2); // 100000/260
      expect(result.hourly.unadjusted).toBeCloseTo(48.08, 2); // 100000/2080
    });

    it('should handle part-time hours correctly', () => {
      const result = convertSalary(30, 'hourly', 20, 5, 0, 0);
      // $30/hour * 20 hours/week * 52 weeks = $31,200
      expect(result.annual.unadjusted).toBe(31200);
      expect(result.weekly.unadjusted).toBe(600); // 30 * 20
    });

    it('should handle daily rate conversion', () => {
      const result = convertSalary(500, 'daily', 40, 5, 10, 10);
      // $500/day * 260 working days = $130,000
      expect(result.annual.unadjusted).toBe(130000);
      // Adjusted: $500 * (260 - 20) = $120,000
      expect(result.annual.adjusted).toBe(120000);
    });

    it('should handle bi-weekly conversion', () => {
      const result = convertSalary(2000, 'biWeekly', 40, 5, 0, 0);
      // $2000 * 26 pay periods = $52,000
      expect(result.annual.unadjusted).toBe(52000);
      expect(result.monthly.unadjusted).toBeCloseTo(4333.33, 2);
    });

    it('should handle semi-monthly conversion', () => {
      const result = convertSalary(3000, 'semiMonthly', 40, 5, 0, 0);
      // $3000 * 24 pay periods = $72,000
      expect(result.annual.unadjusted).toBe(72000);
      expect(result.monthly.unadjusted).toBe(6000);
    });

    it('should handle monthly conversion', () => {
      const result = convertSalary(5000, 'monthly', 40, 5, 0, 0);
      // $5000 * 12 = $60,000
      expect(result.annual.unadjusted).toBe(60000);
      expect(result.biWeekly.unadjusted).toBeCloseTo(2307.69, 2);
    });

    it('should handle quarterly conversion', () => {
      const result = convertSalary(20000, 'quarterly', 40, 5, 0, 0);
      // $20000 * 4 = $80,000
      expect(result.annual.unadjusted).toBe(80000);
      expect(result.monthly.unadjusted).toBeCloseTo(6666.67, 2);
    });

    it('should handle 4-day work week', () => {
      const result = convertSalary(40, 'hourly', 32, 4, 10, 10);
      // Unadjusted: $40 * 32 * 52 = $66,560
      // 4 days/week = 208 working days/year
      // Adjusted working days = 208 - (10 * 4/5) - (10 * 4/5) = 192
      // Adjusted: $40 * 32 * 48 = $61,440
      expect(result.annual.unadjusted).toBe(66560);
      expect(result.annual.adjusted).toBe(61440);
    });

    it('should handle zero holidays and vacation', () => {
      const result = convertSalary(50, 'hourly', 40, 5, 0, 0);
      expect(result.annual.unadjusted).toBe(104000);
      expect(result.annual.adjusted).toBe(104000); // No adjustment needed
    });

    it('should handle maximum holidays and vacation', () => {
      const result = convertSalary(35, 'hourly', 40, 5, 30, 25);
      // Unadjusted: $35 * 40 * 52 = $72,800
      // Adjusted: $35 * 40 * (52 - 30/5 - 25/5) = $35 * 40 * 41 = $57,400
      expect(result.annual.unadjusted).toBe(72800);
      expect(result.annual.adjusted).toBe(57400);
    });
  });

  describe('calculateFederalTax', () => {
    it('should calculate federal tax for single filer - low income', () => {
      const tax = calculateFederalTax(30000, 'single', 0);
      // Taxable income: $30,000 - $15,750 = $14,250
      // Tax: $1,192.50 + ($14,250 - $11,925) * 0.12 = $1,192.50 + $279 = $1,471.50
      expect(tax).toBeCloseTo(1471.5, 2);
    });

    it('should calculate federal tax for single filer - middle income', () => {
      const tax = calculateFederalTax(75000, 'single', 0);
      // Taxable income: $75,000 - $15,750 = $59,250
      // Tax: 10% of $11,925 = $1,192.50
      //     + 12% of ($48,475 - $11,925) = $4,386
      //     + 22% of ($59,250 - $48,475) = $2,370.50
      // Total = $7,949
      expect(tax).toBeCloseTo(7949, 1);
    });

    it('should calculate federal tax for single filer - high income', () => {
      const tax = calculateFederalTax(200000, 'single', 0);
      // Taxable income: $200,000 - $15,750 = $184,250
      // Calculation through brackets up to 24%
      expect(tax).toBeCloseTo(37067, 1);
    });

    it('should calculate federal tax for married filing jointly', () => {
      const tax = calculateFederalTax(150000, 'married', 0);
      // Taxable income: $150,000 - $31,500 = $118,500
      expect(tax).toBeCloseTo(15898, 1);
    });

    it('should calculate federal tax for head of household', () => {
      const tax = calculateFederalTax(90000, 'head', 0);
      // Taxable income: $90,000 - $23,625 = $66,375
      expect(tax).toBeCloseTo(7777.5, 1);
    });

    it('should handle income below standard deduction', () => {
      const tax = calculateFederalTax(10000, 'single', 0);
      expect(tax).toBe(0);
    });

    it('should handle pre-tax deductions', () => {
      const tax = calculateFederalTax(100000, 'single', 20000);
      // Taxable income: ($100,000 - $20,000) - $15,750 = $64,250
      expect(tax).toBeCloseTo(9049, 1);
    });

    it('should handle very high income (37% bracket)', () => {
      const tax = calculateFederalTax(700000, 'single', 0);
      // Taxable income: $700,000 - $15,750 = $684,250
      expect(tax).toBeCloseTo(210192.75, 1);
    });
  });

  describe('calculateFICATax', () => {
    it('should calculate FICA for income below SS limit', () => {
      const fica = calculateFICATax(50000);
      // SS: $50,000 * 0.062 = $3,100
      // Medicare: $50,000 * 0.0145 = $725
      expect(fica.socialSecurity).toBe(3100);
      expect(fica.medicare).toBe(725);
      expect(fica.additionalMedicare).toBe(0);
      expect(fica.total).toBe(3825);
    });

    it('should cap Social Security at wage base limit', () => {
      const fica = calculateFICATax(200000);
      // SS: $176,100 * 0.062 = $10,918.20
      // Medicare: $200,000 * 0.0145 = $2,900
      expect(fica.socialSecurity).toBe(10918.2);
      expect(fica.medicare).toBe(2900);
      expect(fica.additionalMedicare).toBe(0);
      expect(fica.total).toBe(13818.2);
    });

    it('should calculate additional Medicare tax for high earners', () => {
      const fica = calculateFICATax(250000);
      // SS: $176,100 * 0.062 = $10,918.20
      // Medicare: $250,000 * 0.0145 = $3,625
      // Additional Medicare: ($250,000 - $200,000) * 0.009 = $450
      expect(fica.socialSecurity).toBe(10918.2);
      expect(fica.medicare).toBe(3625);
      expect(fica.additionalMedicare).toBe(450);
      expect(fica.total).toBe(14993.2);
    });

    it('should handle very high income', () => {
      const fica = calculateFICATax(500000);
      // SS: $176,100 * 0.062 = $10,918.20
      // Medicare: $500,000 * 0.0145 = $7,250
      // Additional Medicare: ($500,000 - $200,000) * 0.009 = $2,700
      expect(fica.socialSecurity).toBe(10918.2);
      expect(fica.medicare).toBe(7250);
      expect(fica.additionalMedicare).toBe(2700);
      expect(fica.total).toBe(20868.2);
    });

    it('should handle low income', () => {
      const fica = calculateFICATax(20000);
      expect(fica.socialSecurity).toBe(1240);
      expect(fica.medicare).toBe(290);
      expect(fica.additionalMedicare).toBe(0);
      expect(fica.total).toBe(1530);
    });
  });

  describe('calculateStateTax', () => {
    it('should calculate California state tax', () => {
      const tax = calculateStateTax(100000, 'CA');
      // CA has progressive tax brackets
      // Rough estimate based on CA tax tables
      expect(tax).toBeGreaterThan(5000);
      expect(tax).toBeLessThan(10000);
    });

    it('should handle Texas (no state income tax)', () => {
      const tax = calculateStateTax(100000, 'TX');
      expect(tax).toBe(0);
    });

    it('should handle Florida (no state income tax)', () => {
      const tax = calculateStateTax(150000, 'FL');
      expect(tax).toBe(0);
    });

    it('should calculate New York state tax', () => {
      const tax = calculateStateTax(100000, 'NY');
      // NY has progressive tax brackets
      expect(tax).toBeGreaterThan(4000);
      expect(tax).toBeLessThan(9000);
    });

    it('should handle zero income', () => {
      const tax = calculateStateTax(0, 'CA');
      expect(tax).toBe(0);
    });
  });

  describe('calculateSalaryResults', () => {
    it('should calculate complete salary breakdown', () => {
      const inputs: SalaryInputs = {
        salary: 75000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 5000,
          healthInsurance: 2400,
          hsa: 3650,
          other: 0,
        },
        postTaxDeductions: 500,
      };

      const results = calculateSalaryResults(inputs);

      // Verify gross calculations
      expect(results.gross.annual).toBe(75000);
      expect(results.gross.monthly).toBeCloseTo(6250, 2);
      expect(results.gross.biWeekly).toBeCloseTo(2884.62, 2);

      // Verify federal tax
      expect(results.federalTax.annual).toBeGreaterThan(0);

      // Verify FICA
      expect(results.fica.socialSecurity.annual).toBe(4650); // 75000 * 0.062
      expect(results.fica.medicare.annual).toBe(1087.5); // 75000 * 0.0145

      // Verify state tax
      expect(results.stateTax.annual).toBeGreaterThan(0); // CA has state tax

      // Verify deductions
      expect(results.preTaxDeductions.annual).toBe(11050);
      expect(results.postTaxDeductions.annual).toBe(500);

      // Verify net pay
      expect(results.net.annual).toBeLessThan(75000);
      expect(results.net.annual).toBeGreaterThan(45000); // Reasonable range

      // Verify effective tax rate
      expect(results.effectiveTaxRate).toBeGreaterThan(0);
      expect(results.effectiveTaxRate).toBeLessThan(40);
    });

    it('should handle hourly wage input', () => {
      const inputs: SalaryInputs = {
        salary: 25,
        salaryPeriod: 'hourly',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 10,
        federalFilingStatus: 'single',
        state: 'TX',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 0,
          healthInsurance: 0,
          hsa: 0,
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const results = calculateSalaryResults(inputs);

      // $25/hour * 40 hours * 52 weeks = $52,000
      expect(results.gross.annual).toBe(52000);
      expect(results.gross.hourly).toBe(25);

      // Texas has no state tax
      expect(results.stateTax.annual).toBe(0);
    });

    it('should handle high income with additional Medicare tax', () => {
      const inputs: SalaryInputs = {
        salary: 250000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 23000, // 2025 401k limit
          healthInsurance: 5000,
          hsa: 4300, // 2025 HSA limit for individual
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const results = calculateSalaryResults(inputs);

      expect(results.gross.annual).toBe(250000);

      // Should have additional Medicare tax
      expect(results.fica.additionalMedicare.annual).toBeGreaterThan(0);
      expect(results.fica.additionalMedicare.annual).toBe(450); // (250000-200000)*0.009

      // Social Security should be capped
      expect(results.fica.socialSecurity.annual).toBe(10918.2);
    });

    it('should handle married filing jointly', () => {
      const inputs: SalaryInputs = {
        salary: 120000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'married',
        state: 'NY',
        stateFilingStatus: 'married',
        preTaxDeductions: {
          retirement401k: 10000,
          healthInsurance: 7000,
          hsa: 0,
          other: 1000,
        },
        postTaxDeductions: 2000,
      };

      const results = calculateSalaryResults(inputs);

      expect(results.gross.annual).toBe(120000);
      expect(results.preTaxDeductions.annual).toBe(18000);
      expect(results.postTaxDeductions.annual).toBe(2000);

      // Federal tax should use married filing jointly brackets
      expect(results.federalTax.annual).toBeLessThan(20000);
    });

    it('should calculate all pay periods correctly', () => {
      const inputs: SalaryInputs = {
        salary: 100000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 10,
        federalFilingStatus: 'single',
        state: 'FL',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 0,
          healthInsurance: 0,
          hsa: 0,
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const results = calculateSalaryResults(inputs);

      // Check all gross pay periods
      expect(results.gross.annual).toBe(100000);
      expect(results.gross.quarterly).toBe(25000);
      expect(results.gross.monthly).toBeCloseTo(8333.33, 2);
      expect(results.gross.semiMonthly).toBeCloseTo(4166.67, 2);
      expect(results.gross.biWeekly).toBeCloseTo(3846.15, 2);
      expect(results.gross.weekly).toBeCloseTo(1923.08, 2);
      expect(results.gross.daily).toBeCloseTo(384.62, 2);
      expect(results.gross.hourly).toBeCloseTo(48.08, 2);

      // Verify all pay periods have corresponding net amounts
      expect(results.net.quarterly).toBeLessThan(25000);
      expect(results.net.monthly).toBeLessThan(8333.33);
      expect(results.net.semiMonthly).toBeLessThan(4166.67);
      expect(results.net.biWeekly).toBeLessThan(3846.15);
      expect(results.net.weekly).toBeLessThan(1923.08);
      expect(results.net.daily).toBeLessThan(384.62);
      expect(results.net.hourly).toBeLessThan(48.08);
    });
  });

  describe('validateSalaryInputs', () => {
    it('should validate correct inputs', () => {
      const inputs: SalaryInputs = {
        salary: 50000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 5000,
          healthInsurance: 2000,
          hsa: 3000,
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const errors = validateSalaryInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should validate negative salary', () => {
      const inputs: SalaryInputs = {
        salary: -1000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 0,
          healthInsurance: 0,
          hsa: 0,
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const errors = validateSalaryInputs(inputs);
      expect(errors).toContain('Salary must be a positive number');
    });

    it('should validate zero salary', () => {
      const inputs: SalaryInputs = {
        salary: 0,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 0,
          healthInsurance: 0,
          hsa: 0,
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const errors = validateSalaryInputs(inputs);
      expect(errors).toContain('Salary must be greater than 0');
    });

    it('should validate excessive hours per week', () => {
      const inputs: SalaryInputs = {
        salary: 50000,
        salaryPeriod: 'annual',
        hoursPerWeek: 200,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 0,
          healthInsurance: 0,
          hsa: 0,
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const errors = validateSalaryInputs(inputs);
      expect(errors).toContain('Hours per week must be between 1 and 168');
    });

    it('should validate excessive 401k contribution', () => {
      const inputs: SalaryInputs = {
        salary: 50000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 30000, // Exceeds 2025 limit of $23,000
          healthInsurance: 0,
          hsa: 0,
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const errors = validateSalaryInputs(inputs);
      expect(errors).toContain(
        '401(k) contribution cannot exceed $23,000 (2025 limit)'
      );
    });

    it('should validate excessive HSA contribution for individual', () => {
      const inputs: SalaryInputs = {
        salary: 50000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 0,
          healthInsurance: 0,
          hsa: 5000, // Exceeds 2025 individual limit of $4,300
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const errors = validateSalaryInputs(inputs);
      expect(errors).toContain(
        'HSA contribution cannot exceed $4,300 for individual coverage (2025 limit)'
      );
    });

    it('should allow higher HSA contribution for family', () => {
      const inputs: SalaryInputs = {
        salary: 100000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'married',
        state: 'CA',
        stateFilingStatus: 'married',
        preTaxDeductions: {
          retirement401k: 0,
          healthInsurance: 0,
          hsa: 8500, // Within 2025 family limit of $8,550
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const errors = validateSalaryInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should validate total deductions exceed salary', () => {
      const inputs: SalaryInputs = {
        salary: 30000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 10,
        vacationDays: 15,
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 15000,
          healthInsurance: 10000,
          hsa: 4000,
          other: 5000,
        },
        postTaxDeductions: 0,
      };

      const errors = validateSalaryInputs(inputs);
      expect(errors).toContain(
        'Total pre-tax deductions cannot exceed gross salary'
      );
    });

    it('should validate excessive vacation days', () => {
      const inputs: SalaryInputs = {
        salary: 50000,
        salaryPeriod: 'annual',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        holidaysPerYear: 20,
        vacationDays: 300, // Excessive vacation days
        federalFilingStatus: 'single',
        state: 'CA',
        stateFilingStatus: 'single',
        preTaxDeductions: {
          retirement401k: 0,
          healthInsurance: 0,
          hsa: 0,
          other: 0,
        },
        postTaxDeductions: 0,
      };

      const errors = validateSalaryInputs(inputs);
      expect(errors).toContain(
        'Vacation days cannot exceed 260 working days per year'
      );
    });
  });
});
