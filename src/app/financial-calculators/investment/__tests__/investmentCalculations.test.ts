import { calculateInvestment, InvestmentInputs } from '../utils/calculations';

describe('Investment Calculator', () => {
  describe('Basic Compound Interest Calculations', () => {
    it('should calculate investment growth with monthly contributions', () => {
      // Starting Amount: $20,000
      // Additional Contribution: $1,000/month
      // Length: 10 years (120 months)
      // Return Rate: 8% annually
      // Compound Frequency: Monthly
      // Contribution Timing: End of period
      //
      // Mathematical calculation:
      // Principal FV = $20,000 × (1 + 0.08/12)^120 = $44,392.80
      // Contributions FV = $1,000 × [((1 + 0.08/12)^120 - 1) / (0.08/12)] = $182,946.04
      // Total = $227,338.84
      const inputs: InvestmentInputs = {
        startingAmount: 20000,
        additionalContribution: 1000,
        contributionFrequency: 'monthly',
        lengthYears: 10,
        returnRate: 8.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Using standard compound interest formula
      expect(results.endBalance).toBeCloseTo(227338.84, 0);
      // Total Contributions = $20,000 + ($1,000 × 120) = $140,000
      expect(results.totalContributions).toBeCloseTo(140000, 0);
      // Total Interest = $227,338.84 - $140,000 = $87,338.84
      expect(results.totalInterest).toBeCloseTo(87338.84, 0);
    });

    it('should calculate investment with annual contributions', () => {
      // Starting: $10,000
      // Annual Contribution: $5,000
      // Length: 15 years
      // Return: 7% annually
      // Compound: Annually
      const inputs: InvestmentInputs = {
        startingAmount: 10000,
        additionalContribution: 5000,
        contributionFrequency: 'annually',
        lengthYears: 15,
        returnRate: 7.0,
        compoundFrequency: 'annually',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Starting: $10,000 × (1.07)^15 = $27,590.32
      // Contributions at end of each year (14 periods for first contribution):
      // Sum from i=0 to 14: $5,000 × (1.07)^i
      // Using annuity formula: FV = $5,000 × [((1.07)^14 - 1) / 0.07] = $125,644.83
      // (Note: 14 periods because end-of-year contribution in year 1 grows for 14 years)
      // Total ≈ $153,235
      expect(results.endBalance).toBeCloseTo(153235, 0);
      expect(results.totalContributions).toBeCloseTo(85000, 0); // $10,000 + ($5,000 × 15)
      expect(results.totalInterest).toBeCloseTo(68235, 0);
    });

    it('should calculate with quarterly contributions and quarterly compounding', () => {
      // Starting: $25,000
      // Quarterly Contribution: $500
      // Length: 5 years (20 quarters)
      // Return: 6% annually (1.5% quarterly)
      // Compound: Quarterly
      const inputs: InvestmentInputs = {
        startingAmount: 25000,
        additionalContribution: 500,
        contributionFrequency: 'quarterly',
        lengthYears: 5,
        returnRate: 6.0,
        compoundFrequency: 'quarterly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Quarterly rate = 1.5%
      // Starting: $25,000 × (1.015)^20 = $33,597.91
      // Contributions at end (19 periods for first): FV = 500 × [((1.015)^19 - 1) / 0.015] = $11,635.30
      // Total ≈ $45,233
      expect(results.endBalance).toBeCloseTo(45233, 0);
      expect(results.totalContributions).toBeCloseTo(35000, 0); // $25,000 + ($500 × 20)
    });
  });

  describe('Contribution Timing (Beginning vs End)', () => {
    it('should calculate higher returns with contributions at beginning of period', () => {
      // Contributions at beginning earn interest for the full period
      const inputs: InvestmentInputs = {
        startingAmount: 10000,
        additionalContribution: 1000,
        contributionFrequency: 'monthly',
        lengthYears: 5,
        returnRate: 8.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'beginning',
      };

      const results = calculateInvestment(inputs);

      // With contributions at beginning, each payment earns interest for one extra period
      // This should be higher than end-of-period contributions
      expect(results.endBalance).toBeGreaterThan(88000); // More than just contributions
    });

    it('should calculate lower returns with contributions at end of period', () => {
      const inputsEnd: InvestmentInputs = {
        startingAmount: 10000,
        additionalContribution: 1000,
        contributionFrequency: 'monthly',
        lengthYears: 5,
        returnRate: 8.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const inputsBeginning: InvestmentInputs = {
        ...inputsEnd,
        contributionTiming: 'beginning',
      };

      const resultsEnd = calculateInvestment(inputsEnd);
      const resultsBeginning = calculateInvestment(inputsBeginning);

      // Beginning should be higher than end
      expect(resultsBeginning.endBalance).toBeGreaterThan(
        resultsEnd.endBalance
      );
    });
  });

  describe('Different Compound Frequencies', () => {
    it('should calculate with daily compounding', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 50000,
        additionalContribution: 0,
        contributionFrequency: 'monthly',
        lengthYears: 10,
        returnRate: 6.0,
        compoundFrequency: 'daily',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // With daily compounding: FV = 50000 × (1 + 0.06/365)^(365×10)
      // ≈ $50,000 × 1.8221 = $91,105
      expect(results.endBalance).toBeCloseTo(91105, -2); // Within $100
      expect(results.totalContributions).toBe(50000);
    });

    it('should calculate with weekly compounding', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 30000,
        additionalContribution: 100,
        contributionFrequency: 'weekly',
        lengthYears: 3,
        returnRate: 7.0,
        compoundFrequency: 'weekly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Weekly rate = 7% / 52
      // Periods = 3 × 52 = 156 weeks
      expect(results.totalContributions).toBeCloseTo(45600, 0); // $30,000 + ($100 × 156)
      expect(results.endBalance).toBeGreaterThan(45600);
    });

    it('should calculate with semiannual compounding', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 40000,
        additionalContribution: 2000,
        contributionFrequency: 'semiannually',
        lengthYears: 8,
        returnRate: 5.5,
        compoundFrequency: 'semiannually',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Semiannual periods = 8 × 2 = 16
      expect(results.totalContributions).toBeCloseTo(72000, 0); // $40,000 + ($2,000 × 16)
    });
  });

  describe('Zero and Edge Cases', () => {
    it('should handle zero return rate (no growth)', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 10000,
        additionalContribution: 500,
        contributionFrequency: 'monthly',
        lengthYears: 5,
        returnRate: 0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // With 0% return, end balance = starting + contributions
      // = $10,000 + ($500 × 60) = $40,000
      expect(results.endBalance).toBeCloseTo(40000, 0);
      expect(results.totalInterest).toBeCloseTo(0, 0);
    });

    it('should handle zero starting amount', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 0,
        additionalContribution: 500,
        contributionFrequency: 'monthly',
        lengthYears: 10,
        returnRate: 7.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Only contributions grow
      expect(results.totalContributions).toBeCloseTo(60000, 0); // $500 × 120
      expect(results.endBalance).toBeGreaterThan(60000); // Should have interest
    });

    it('should handle zero contributions', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 50000,
        additionalContribution: 0,
        contributionFrequency: 'monthly',
        lengthYears: 20,
        returnRate: 8.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Only starting amount grows
      // FV = 50000 × (1 + 0.08/12)^(12×20) = 50000 × 4.9268 = $246,340
      expect(results.endBalance).toBeCloseTo(246340, -2);
      expect(results.totalContributions).toBe(50000);
      expect(results.totalInterest).toBeCloseTo(196340, -2);
    });

    it('should handle high return rate (15%)', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 15000,
        additionalContribution: 300,
        contributionFrequency: 'monthly',
        lengthYears: 10,
        returnRate: 15.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // High return should result in substantial growth
      expect(results.endBalance).toBeGreaterThan(100000);
      expect(results.totalContributions).toBeCloseTo(51000, 0); // $15,000 + ($300 × 120)
    });
  });

  describe('Year-by-Year Breakdown', () => {
    it('should generate accurate year-by-year schedule', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 10000,
        additionalContribution: 1000,
        contributionFrequency: 'monthly',
        lengthYears: 5,
        returnRate: 8.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Should have 5 years of data
      expect(results.yearByYear).toHaveLength(5);

      // First year
      const year1 = results.yearByYear[0];
      expect(year1.year).toBe(1);
      expect(year1.startingBalance).toBeCloseTo(10000, 0);
      expect(year1.contributions).toBeCloseTo(12000, 0); // $1,000 × 12

      // Last year
      const year5 = results.yearByYear[4];
      expect(year5.year).toBe(5);
      expect(year5.endingBalance).toBeCloseTo(results.endBalance, 0);

      // Each year's ending balance should equal next year's starting balance
      for (let i = 0; i < results.yearByYear.length - 1; i++) {
        expect(results.yearByYear[i].endingBalance).toBeCloseTo(
          results.yearByYear[i + 1].startingBalance,
          2
        );
      }
    });

    it('should show increasing balances each year with positive returns', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 20000,
        additionalContribution: 500,
        contributionFrequency: 'monthly',
        lengthYears: 10,
        returnRate: 7.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Each year's ending balance should be greater than previous
      for (let i = 1; i < results.yearByYear.length; i++) {
        expect(results.yearByYear[i].endingBalance).toBeGreaterThan(
          results.yearByYear[i - 1].endingBalance
        );
      }
    });

    it('should track cumulative contributions accurately', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 5000,
        additionalContribution: 200,
        contributionFrequency: 'monthly',
        lengthYears: 3,
        returnRate: 6.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Check cumulative contributions
      expect(results.yearByYear[0].cumulativeContributions).toBeCloseTo(
        5000 + 200 * 12,
        0
      ); // Year 1: $5,000 + $2,400
      expect(results.yearByYear[1].cumulativeContributions).toBeCloseTo(
        5000 + 200 * 24,
        0
      ); // Year 2: $5,000 + $4,800
      expect(results.yearByYear[2].cumulativeContributions).toBeCloseTo(
        5000 + 200 * 36,
        0
      ); // Year 3: $5,000 + $7,200
    });
  });

  describe('Real-World Scenarios', () => {
    it('should calculate retirement savings over 30 years', () => {
      // Real scenario: Young professional saving for retirement
      const inputs: InvestmentInputs = {
        startingAmount: 5000,
        additionalContribution: 500,
        contributionFrequency: 'monthly',
        lengthYears: 30,
        returnRate: 9.0, // Historical stock market average
        compoundFrequency: 'monthly',
        contributionTiming: 'beginning',
      };

      const results = calculateInvestment(inputs);

      // Should accumulate significant wealth
      expect(results.totalContributions).toBeCloseTo(185000, 0); // $5,000 + ($500 × 360)
      expect(results.endBalance).toBeGreaterThan(800000); // Compound interest power
    });

    it('should calculate college savings over 18 years', () => {
      // Scenario: Parents saving for child's college
      const inputs: InvestmentInputs = {
        startingAmount: 10000,
        additionalContribution: 300,
        contributionFrequency: 'monthly',
        lengthYears: 18,
        returnRate: 6.5,
        compoundFrequency: 'monthly',
        contributionTiming: 'beginning',
      };

      const results = calculateInvestment(inputs);

      expect(results.totalContributions).toBeCloseTo(74800, 0); // $10,000 + ($300 × 216)
      expect(results.endBalance).toBeGreaterThan(100000);
    });

    it('should calculate short-term savings (2 years)', () => {
      // Scenario: Saving for a down payment
      const inputs: InvestmentInputs = {
        startingAmount: 15000,
        additionalContribution: 1500,
        contributionFrequency: 'monthly',
        lengthYears: 2,
        returnRate: 4.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      expect(results.totalContributions).toBeCloseTo(51000, 0); // $15,000 + ($1,500 × 24)
      expect(results.endBalance).toBeCloseTo(53661, -2); // Modest growth with low rate
    });
  });

  describe('Contribution Frequency Variations', () => {
    it('should calculate with biweekly contributions', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 5000,
        additionalContribution: 200,
        contributionFrequency: 'biweekly',
        lengthYears: 5,
        returnRate: 7.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Biweekly = 26 contributions per year
      // Total contributions = $5,000 + ($200 × 26 × 5) = $31,000
      expect(results.totalContributions).toBeCloseTo(31000, 0);
    });

    it('should calculate with semimonthly contributions', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 8000,
        additionalContribution: 400,
        contributionFrequency: 'semimonthly',
        lengthYears: 4,
        returnRate: 6.0,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Semimonthly = 24 contributions per year (2 per month)
      // Total contributions = $8,000 + ($400 × 24 × 4) = $46,400
      expect(results.totalContributions).toBeCloseTo(46400, 0);
    });
  });

  describe('Mismatched Compound and Contribution Frequencies', () => {
    it('should handle monthly contributions with annual compounding', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 10000,
        additionalContribution: 500,
        contributionFrequency: 'monthly',
        lengthYears: 5,
        returnRate: 8.0,
        compoundFrequency: 'annually',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      // Should handle different frequencies correctly
      expect(results.totalContributions).toBeCloseTo(40000, 0);
      expect(results.endBalance).toBeGreaterThan(40000);
    });

    it('should handle annual contributions with monthly compounding', () => {
      const inputs: InvestmentInputs = {
        startingAmount: 25000,
        additionalContribution: 5000,
        contributionFrequency: 'annually',
        lengthYears: 10,
        returnRate: 7.5,
        compoundFrequency: 'monthly',
        contributionTiming: 'end',
      };

      const results = calculateInvestment(inputs);

      expect(results.totalContributions).toBeCloseTo(75000, 0);
      expect(results.endBalance).toBeGreaterThan(75000);
    });
  });
});
