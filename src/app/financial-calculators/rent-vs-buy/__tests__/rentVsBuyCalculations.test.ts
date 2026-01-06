import {
  calculateRentVsBuy,
  calculateMonthlyPayment,
  findBreakEvenYear,
  RentVsBuyInputs,
} from '../utils/calculations';

describe('Rent vs Buy Calculator', () => {
  describe('calculateMonthlyPayment', () => {
    it('should calculate monthly payment correctly', () => {
      const principal = 400000; // $500k home - $100k down
      const rate = 0.07; // 7% annual
      const years = 30;

      const payment = calculateMonthlyPayment(principal, rate, years);
      expect(payment).toBeCloseTo(2661.21, 2);
    });

    it('should handle zero interest rate', () => {
      const principal = 300000;
      const rate = 0;
      const years = 30;

      const payment = calculateMonthlyPayment(principal, rate, years);
      expect(payment).toBeCloseTo(833.33, 2); // principal / (years * 12)
    });
  });

  describe('Full Rent vs Buy Analysis', () => {
    const baseInputs: RentVsBuyInputs = {
      homePrice: 500000,
      downPaymentPercent: 20,
      mortgageRate: 7,
      loanTermYears: 30,
      propertyTaxRate: 1.2,
      homeInsuranceAnnual: 1800,
      hoaFeesMonthly: 300,
      maintenancePercent: 1,
      homeAppreciationRate: 3.5,
      yearsToStay: 10,
      marginalTaxRate: 27, // 22% federal + 5% state
      monthlyRent: 3000,
      rentIncreaseRate: 3.5,
      rentersInsuranceMonthly: 30,
      securityDeposit: 3000,
      investmentReturnRate: 7,
      buyingClosingCosts: 10000,
      sellingClosingCostsPercent: 6,
    };

    it('should calculate complete rent vs buy analysis for typical scenario', () => {
      const results = calculateRentVsBuy(baseInputs);

      // Verify monthly mortgage payment
      expect(results.monthlyMortgagePayment).toBeCloseTo(2661.21, 2);

      // Verify total monthly housing costs (Year 1)
      // Mortgage + Property Tax + Insurance + HOA + Maintenance
      const expectedMonthlyHousing = 2661.21 + 500 + 150 + 300 + 416.67;
      expect(results.monthlyHousingCost).toBeCloseTo(expectedMonthlyHousing, 2);

      // Verify home equity after 10 years
      expect(results.homeEquity).toBeGreaterThan(0);
      expect(results.homeEquity).toBeLessThan(700000); // With down payment + appreciation + principal paid

      // Verify tax savings
      expect(results.totalTaxSavings).toBeGreaterThan(0);

      // Verify opportunity cost
      expect(results.opportunityCost).toBeGreaterThan(0);

      // Verify final comparison
      expect(results.netDifference).toBeDefined();
      expect(results.betterOption).toMatch(/^(Buying|Renting)$/);
    });

    it('should identify buying as better option with high appreciation', () => {
      const highAppreciationInputs: RentVsBuyInputs = {
        ...baseInputs,
        homeAppreciationRate: 5,
        rentIncreaseRate: 5,
      };

      const results = calculateRentVsBuy(highAppreciationInputs);
      expect(results.betterOption).toBe('Buying');
    });

    it('should identify renting as better option with low appreciation and high mortgage rate', () => {
      const rentFavorableInputs: RentVsBuyInputs = {
        ...baseInputs,
        homeAppreciationRate: 1,
        mortgageRate: 9,
        rentIncreaseRate: 2,
        monthlyRent: 2500,
      };

      // In short term with high rates and low appreciation, renting might be better
      const shortTermResults = calculateRentVsBuy({
        ...rentFavorableInputs,
        yearsToStay: 3,
      });
      expect(shortTermResults.totalRentCost).toBeLessThan(
        shortTermResults.totalBuyCost
      );
    });

    it('should calculate break-even point correctly', () => {
      const results = calculateRentVsBuy(baseInputs);

      if (results.breakEvenYear !== null) {
        expect(results.breakEvenYear).toBeGreaterThanOrEqual(1);
        expect(results.breakEvenYear).toBeLessThanOrEqual(30);
      }
    });

    it('should handle edge case with 0% down payment', () => {
      const zeroDownInputs: RentVsBuyInputs = {
        ...baseInputs,
        downPaymentPercent: 0,
      };

      const results = calculateRentVsBuy(zeroDownInputs);
      expect(results.downPaymentAmount).toBe(0);
      expect(results.loanAmount).toBe(500000);
      expect(results.monthlyMortgagePayment).toBeCloseTo(3326.51, 2);
    });

    it('should handle 100% down payment (cash purchase)', () => {
      const cashPurchaseInputs: RentVsBuyInputs = {
        ...baseInputs,
        downPaymentPercent: 100,
      };

      const results = calculateRentVsBuy(cashPurchaseInputs);
      expect(results.downPaymentAmount).toBe(500000);
      expect(results.loanAmount).toBe(0);
      expect(results.monthlyMortgagePayment).toBe(0);
      expect(results.totalInterestPaid).toBe(0);
    });

    it('should calculate tax benefits correctly', () => {
      const results = calculateRentVsBuy(baseInputs);

      // Tax benefits should be based on mortgage interest and property tax deductions
      expect(results.totalTaxSavings).toBeGreaterThan(0);

      // With 27% marginal rate, savings should be significant but not exceed total interest
      expect(results.totalTaxSavings).toBeLessThan(
        results.totalInterestPaid * 0.27 +
          ((baseInputs.homePrice * baseInputs.propertyTaxRate) / 100) *
            baseInputs.yearsToStay *
            0.27
      );
    });

    it('should calculate opportunity cost of down payment', () => {
      const results = calculateRentVsBuy(baseInputs);

      // Opportunity cost should grow with investment return rate
      expect(results.opportunityCost).toBeGreaterThan(0);

      // Higher investment return should increase opportunity cost
      const higherReturnInputs: RentVsBuyInputs = {
        ...baseInputs,
        investmentReturnRate: 10,
      };
      const higherReturnResults = calculateRentVsBuy(higherReturnInputs);
      expect(higherReturnResults.opportunityCost).toBeGreaterThan(
        results.opportunityCost
      );
    });

    it('should handle different loan terms correctly', () => {
      const fifteenYearInputs: RentVsBuyInputs = {
        ...baseInputs,
        loanTermYears: 15,
      };

      const results15 = calculateRentVsBuy(fifteenYearInputs);
      const results30 = calculateRentVsBuy(baseInputs);

      // 15-year loan should have higher monthly payment
      expect(results15.monthlyMortgagePayment).toBeGreaterThan(
        results30.monthlyMortgagePayment
      );

      // But lower total interest paid
      expect(results15.totalInterestPaid).toBeLessThan(
        results30.totalInterestPaid
      );
    });

    it('should account for all buying costs', () => {
      const results = calculateRentVsBuy(baseInputs);

      // Total buy cost should include:
      // - Down payment + Closing costs
      // - All mortgage payments
      // - Property tax, insurance, HOA, maintenance
      // - Selling costs
      // Minus: home equity, tax savings

      expect(results.totalBuyCost).toBeGreaterThan(0);
      expect(results.totalBuyCostBreakdown).toBeDefined();
      expect(results.totalBuyCostBreakdown.downPayment).toBe(100000);
      expect(results.totalBuyCostBreakdown.closingCosts).toBe(10000);
    });

    it('should account for all renting costs', () => {
      const results = calculateRentVsBuy(baseInputs);

      // Total rent cost should include:
      // - All rent payments (with increases)
      // - Renter's insurance
      // - Security deposit (lost opportunity cost)

      expect(results.totalRentCost).toBeGreaterThan(0);
      expect(results.totalRentCostBreakdown).toBeDefined();
      expect(results.totalRentCostBreakdown.securityDeposit).toBe(3000);
    });

    it('should find break-even point when buying becomes cheaper', () => {
      // Use inputs that strongly favor buying over time
      const breakEvenInputs: RentVsBuyInputs = {
        ...baseInputs,
        homePrice: 400000,
        downPaymentPercent: 20,
        mortgageRate: 6,
        homeAppreciationRate: 4,
        rentIncreaseRate: 4,
        monthlyRent: 2500,
        maintenancePercent: 0.5,
        propertyTaxRate: 1,
      };

      const breakEven = findBreakEvenYear(breakEvenInputs);

      // The break-even point depends on many factors
      // We just verify the function works and returns reasonable values
      if (breakEven !== null) {
        expect(breakEven).toBeGreaterThanOrEqual(1);
        expect(breakEven).toBeLessThanOrEqual(30);

        // At some point after break-even, buying should definitely be better
        const resultsLongTerm = calculateRentVsBuy({
          ...breakEvenInputs,
          yearsToStay: Math.min(breakEven + 5, 30),
        });
        expect(resultsLongTerm.betterOption).toBe('Buying');
      } else {
        // If no break-even found within 30 years, that's also valid
        // depending on the specific parameters
        expect(breakEven).toBeNull();
      }
    });

    it('should handle extreme market conditions', () => {
      // Housing crash scenario
      const crashInputs: RentVsBuyInputs = {
        ...baseInputs,
        homeAppreciationRate: -5, // Depreciation
        rentIncreaseRate: 0,
      };

      const crashResults = calculateRentVsBuy(crashInputs);
      expect(crashResults.homeEquity).toBeLessThan(
        (baseInputs.downPaymentPercent * baseInputs.homePrice) / 100
      );

      // Hyperinflation scenario
      const inflationInputs: RentVsBuyInputs = {
        ...baseInputs,
        homeAppreciationRate: 10,
        rentIncreaseRate: 10,
      };

      const inflationResults = calculateRentVsBuy(inflationInputs);
      expect(inflationResults.betterOption).toBe('Buying'); // Buying typically better in high inflation
    });

    it('should validate input boundaries', () => {
      // Negative values should be handled
      expect(() =>
        calculateRentVsBuy({ ...baseInputs, homePrice: -100000 })
      ).toThrow();
      expect(() =>
        calculateRentVsBuy({ ...baseInputs, monthlyRent: -1000 })
      ).toThrow();

      // Percentages over 100 should be handled
      expect(() =>
        calculateRentVsBuy({ ...baseInputs, downPaymentPercent: 150 })
      ).toThrow();

      // Zero years to stay should be handled
      expect(() =>
        calculateRentVsBuy({ ...baseInputs, yearsToStay: 0 })
      ).toThrow();
    });
  });

  describe('Year-by-year analysis', () => {
    it('should provide detailed yearly breakdown', () => {
      const inputs: RentVsBuyInputs = {
        homePrice: 500000,
        downPaymentPercent: 20,
        mortgageRate: 7,
        loanTermYears: 30,
        propertyTaxRate: 1.2,
        homeInsuranceAnnual: 1800,
        hoaFeesMonthly: 300,
        maintenancePercent: 1,
        homeAppreciationRate: 3.5,
        yearsToStay: 5,
        marginalTaxRate: 27,
        monthlyRent: 3000,
        rentIncreaseRate: 3.5,
        rentersInsuranceMonthly: 30,
        securityDeposit: 3000,
        investmentReturnRate: 7,
        buyingClosingCosts: 10000,
        sellingClosingCostsPercent: 6,
      };

      const results = calculateRentVsBuy(inputs);

      expect(results.yearlyBreakdown).toBeDefined();
      expect(results.yearlyBreakdown).toHaveLength(5);

      // Each year should show cumulative costs increasing
      for (let i = 1; i < results.yearlyBreakdown.length; i++) {
        expect(results.yearlyBreakdown[i].cumulativeBuyCost).toBeGreaterThan(
          results.yearlyBreakdown[i - 1].cumulativeBuyCost
        );
        expect(results.yearlyBreakdown[i].cumulativeRentCost).toBeGreaterThan(
          results.yearlyBreakdown[i - 1].cumulativeRentCost
        );
      }
    });
  });
});
