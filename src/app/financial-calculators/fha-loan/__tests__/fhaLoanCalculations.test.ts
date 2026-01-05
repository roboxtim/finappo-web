/**
 * FHA Loan Calculator Tests
 * Validates calculations against FHA guidelines and reference calculator
 */

import {
  calculateBaseLoanAmount,
  calculateLTV,
  calculateUFMIP,
  calculateTotalLoanAmount,
  getAnnualMIPRate,
  calculateMonthlyMIP,
  getMIPDuration,
  calculateMonthlyPayment,
  calculateFHALoan,
  FHA_CONFORMING_LIMIT,
  type FHALoanInputs,
} from './fhaLoanCalculations';

describe('FHA Loan Calculations', () => {
  describe('Basic Calculations', () => {
    test('calculateBaseLoanAmount', () => {
      expect(calculateBaseLoanAmount(500000, 17500)).toBe(482500);
      expect(calculateBaseLoanAmount(300000, 10500)).toBe(289500);
      expect(calculateBaseLoanAmount(400000, 40000)).toBe(360000);
    });

    test('calculateLTV', () => {
      // 3.5% down = 96.5% LTV
      expect(calculateLTV(500000, 17500)).toBeCloseTo(96.5, 1);
      // 10% down = 90% LTV
      expect(calculateLTV(300000, 30000)).toBeCloseTo(90, 1);
      // 20% down = 80% LTV
      expect(calculateLTV(400000, 80000)).toBeCloseTo(80, 1);
    });

    test('calculateUFMIP', () => {
      // UFMIP is 1.75% of base loan amount
      expect(calculateUFMIP(482500)).toBeCloseTo(8443.75, 2);
      expect(calculateUFMIP(289500)).toBeCloseTo(5066.25, 2);
      expect(calculateUFMIP(360000)).toBeCloseTo(6300, 2);
    });

    test('calculateTotalLoanAmount', () => {
      // With UFMIP financed
      const baseLoan = 482500;
      const ufmip = calculateUFMIP(baseLoan);
      expect(calculateTotalLoanAmount(baseLoan, true)).toBeCloseTo(
        baseLoan + ufmip,
        2
      );

      // Without UFMIP financed
      expect(calculateTotalLoanAmount(baseLoan, false)).toBe(baseLoan);
    });
  });

  describe('MIP Rate Calculations', () => {
    test('getAnnualMIPRate for 30-year loans (>15 years)', () => {
      // Standard conforming loans (≤ $726,200)
      expect(getAnnualMIPRate(400000, 94, 30)).toBe(0.50); // LTV ≤ 95%
      expect(getAnnualMIPRate(400000, 96.5, 30)).toBe(0.55); // LTV > 95%

      // High-balance loans (> $726,200)
      expect(getAnnualMIPRate(800000, 94, 30)).toBe(0.70); // LTV ≤ 95%
      expect(getAnnualMIPRate(800000, 96.5, 30)).toBe(0.75); // LTV > 95%
    });

    test('getAnnualMIPRate for 15-year loans (≤15 years)', () => {
      // Standard conforming loans (≤ $726,200)
      expect(getAnnualMIPRate(400000, 85, 15)).toBe(0.15); // LTV ≤ 90%
      expect(getAnnualMIPRate(400000, 92, 15)).toBe(0.40); // LTV > 90%

      // High-balance loans (> $726,200)
      expect(getAnnualMIPRate(800000, 75, 15)).toBe(0.15); // LTV ≤ 78%
      expect(getAnnualMIPRate(800000, 85, 15)).toBe(0.40); // 78% < LTV ≤ 90%
      expect(getAnnualMIPRate(800000, 92, 15)).toBe(0.65); // LTV > 90%
    });
  });

  describe('Monthly MIP Calculations', () => {
    test('calculateMonthlyMIP', () => {
      const baseLoan = 482500;

      // 0.55% annual MIP for 30-year loan with LTV > 95%
      const monthlyMIP = calculateMonthlyMIP(baseLoan, 0.55);
      expect(monthlyMIP).toBeCloseTo(221.15, 2);

      // 0.50% annual MIP
      const monthlyMIP2 = calculateMonthlyMIP(400000, 0.50);
      expect(monthlyMIP2).toBeCloseTo(166.67, 2);
    });
  });

  describe('MIP Duration', () => {
    test('getMIPDuration - life of loan for LTV > 90%', () => {
      expect(getMIPDuration(96.5)).toBeNull(); // Life of loan
      expect(getMIPDuration(92)).toBeNull(); // Life of loan
    });

    test('getMIPDuration - 11 years for LTV ≤ 90%', () => {
      expect(getMIPDuration(90)).toBe(132); // 11 years = 132 months
      expect(getMIPDuration(85)).toBe(132);
      expect(getMIPDuration(80)).toBe(132);
    });
  });

  describe('Monthly Payment Calculation', () => {
    test('calculateMonthlyPayment', () => {
      // Test case 1: $490,943.75 loan at 6.5% for 30 years
      const payment1 = calculateMonthlyPayment(490943.75, 6.5, 30);
      expect(payment1).toBeCloseTo(3103.10, 1);

      // Test case 2: $300,000 loan at 7% for 30 years
      const payment2 = calculateMonthlyPayment(300000, 7, 30);
      expect(payment2).toBeCloseTo(1995.91, 1);

      // Test case 3: $200,000 loan at 5% for 15 years
      const payment3 = calculateMonthlyPayment(200000, 5, 15);
      expect(payment3).toBeCloseTo(1581.59, 1);
    });

    test('calculateMonthlyPayment with 0% interest', () => {
      const payment = calculateMonthlyPayment(360000, 0, 30);
      expect(payment).toBeCloseTo(1000, 2); // $360,000 / 360 months
    });
  });

  describe('Complete FHA Loan Calculations', () => {
    test('Test Case 1: $500,000 home, 3.5% down, 30 years, 6.5% interest', () => {
      const inputs: FHALoanInputs = {
        homePrice: 500000,
        downPayment: 17500, // 3.5%
        loanTerm: 30,
        interestRate: 6.5,
        financeUFMIP: true,
        propertyTax: 6000,
        homeInsurance: 1500,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateFHALoan(inputs);

      // Verify loan details
      expect(results.loanDetails.baseLoanAmount).toBe(482500);
      expect(results.loanDetails.ufmipAmount).toBeCloseTo(8443.75, 2);
      expect(results.loanDetails.totalLoanAmount).toBeCloseTo(490943.75, 2);
      expect(results.loanDetails.ltv).toBeCloseTo(96.5, 1);
      expect(results.loanDetails.annualMIPRate).toBe(0.55);
      expect(results.loanDetails.monthlyMIPAmount).toBeCloseTo(221.15, 2);
      expect(results.loanDetails.mipDuration).toBeNull(); // Life of loan

      // Verify monthly payment
      expect(results.monthlyPayment.principalAndInterest).toBeCloseTo(
        3103.10,
        1
      );
      expect(results.monthlyPayment.monthlyMIP).toBeCloseTo(221.15, 2);
      expect(results.monthlyPayment.propertyTax).toBeCloseTo(500, 2);
      expect(results.monthlyPayment.homeInsurance).toBeCloseTo(125, 2);
      expect(results.monthlyPayment.totalMonthly).toBeCloseTo(3949.24, 1);

      // Verify amortization schedule
      expect(results.amortizationSchedule.length).toBe(360); // 30 years
      expect(results.amortizationSchedule[0].balance).toBeLessThan(
        results.loanDetails.totalLoanAmount
      );
      expect(results.amortizationSchedule[0].balance).toBeGreaterThan(0);

      // Verify totals
      expect(results.totalPayments.totalMIP).toBeGreaterThan(79000); // ~$79,614 total MIP
    });

    test('Test Case 2: $300,000 home, 10% down, 15 years, 5.5% interest', () => {
      const inputs: FHALoanInputs = {
        homePrice: 300000,
        downPayment: 30000, // 10% - LTV = 90%
        loanTerm: 15,
        interestRate: 5.5,
        financeUFMIP: true,
        propertyTax: 3600,
        homeInsurance: 1200,
        hoaFee: 50,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateFHALoan(inputs);

      // Verify loan details
      expect(results.loanDetails.baseLoanAmount).toBe(270000);
      expect(results.loanDetails.ufmipAmount).toBeCloseTo(4725, 2);
      expect(results.loanDetails.totalLoanAmount).toBeCloseTo(274725, 2);
      expect(results.loanDetails.ltv).toBeCloseTo(90, 1);
      expect(results.loanDetails.annualMIPRate).toBe(0.15); // ≤90% LTV for 15-year
      expect(results.loanDetails.monthlyMIPAmount).toBeCloseTo(33.75, 2);
      expect(results.loanDetails.mipDuration).toBe(132); // 11 years

      // Verify monthly payment
      expect(results.monthlyPayment.principalAndInterest).toBeCloseTo(
        2244.73,
        1
      );
      expect(results.monthlyPayment.monthlyMIP).toBeCloseTo(33.75, 2);
      expect(results.monthlyPayment.totalMonthly).toBeGreaterThan(2500);

      // Verify MIP ends after 11 years
      const mipMonths = results.amortizationSchedule.filter(
        (row) => row.mipPayment > 0
      ).length;
      expect(mipMonths).toBe(132);
    });

    test('Test Case 3: High-balance loan > $726,200', () => {
      const inputs: FHALoanInputs = {
        homePrice: 850000,
        downPayment: 29750, // 3.5%
        loanTerm: 30,
        interestRate: 7,
        financeUFMIP: true,
        propertyTax: 10000,
        homeInsurance: 2000,
        hoaFee: 100,
        otherCosts: 200,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateFHALoan(inputs);

      // Verify high-balance MIP rate
      expect(results.loanDetails.baseLoanAmount).toBeGreaterThan(
        FHA_CONFORMING_LIMIT
      );
      expect(results.loanDetails.ltv).toBeCloseTo(96.5, 1);
      expect(results.loanDetails.annualMIPRate).toBe(0.75); // High-balance, LTV > 95%

      // Verify monthly MIP is higher for high-balance loans
      expect(results.loanDetails.monthlyMIPAmount).toBeGreaterThan(500);
    });

    test('Test Case 4: 20% down (80% LTV) - conventional comparison', () => {
      const inputs: FHALoanInputs = {
        homePrice: 400000,
        downPayment: 80000, // 20%
        loanTerm: 30,
        interestRate: 6,
        financeUFMIP: true,
        propertyTax: 4800,
        homeInsurance: 1200,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateFHALoan(inputs);

      // With 20% down, FHA still has MIP (unlike conventional which wouldn't)
      expect(results.loanDetails.ltv).toBeCloseTo(80, 1);
      expect(results.loanDetails.annualMIPRate).toBe(0.50);
      expect(results.loanDetails.monthlyMIPAmount).toBeGreaterThan(0);
      expect(results.loanDetails.mipDuration).toBe(132); // Removable after 11 years
    });

    test('Test Case 5: UFMIP not financed', () => {
      const inputs: FHALoanInputs = {
        homePrice: 250000,
        downPayment: 8750, // 3.5%
        loanTerm: 30,
        interestRate: 6.5,
        financeUFMIP: false, // Pay UFMIP upfront
        propertyTax: 3000,
        homeInsurance: 1000,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateFHALoan(inputs);

      // Total loan amount should NOT include UFMIP
      expect(results.loanDetails.totalLoanAmount).toBe(
        results.loanDetails.baseLoanAmount
      );
      expect(results.loanDetails.totalLoanAmount).not.toBe(
        results.loanDetails.baseLoanAmount + results.loanDetails.ufmipAmount
      );

      // But UFMIP should still be in total costs
      expect(results.totalPayments.totalMIP).toBeGreaterThan(
        results.loanDetails.ufmipAmount
      );
    });
  });

  describe('Edge Cases', () => {
    test('Minimum down payment 3.5%', () => {
      const inputs: FHALoanInputs = {
        homePrice: 200000,
        downPayment: 7000, // Exactly 3.5%
        loanTerm: 30,
        interestRate: 6,
        financeUFMIP: true,
        propertyTax: 2400,
        homeInsurance: 800,
        hoaFee: 0,
        otherCosts: 0,
      };

      const results = calculateFHALoan(inputs);
      expect(results.loanDetails.ltv).toBeCloseTo(96.5, 1);
    });

    test('Exactly at FHA conforming limit', () => {
      const loanAmount = FHA_CONFORMING_LIMIT;
      const homePrice = loanAmount / 0.965; // Back-calculate home price for 3.5% down

      const inputs: FHALoanInputs = {
        homePrice,
        downPayment: homePrice * 0.035,
        loanTerm: 30,
        interestRate: 6.5,
        financeUFMIP: true,
        propertyTax: 8000,
        homeInsurance: 1500,
        hoaFee: 0,
        otherCosts: 0,
      };

      const results = calculateFHALoan(inputs);
      expect(results.loanDetails.baseLoanAmount).toBeCloseTo(
        FHA_CONFORMING_LIMIT,
        0
      );
      expect(results.loanDetails.annualMIPRate).toBe(0.55); // Should use standard rate
    });

    test('Zero interest rate', () => {
      const inputs: FHALoanInputs = {
        homePrice: 100000,
        downPayment: 3500,
        loanTerm: 10,
        interestRate: 0,
        financeUFMIP: true,
        propertyTax: 1200,
        homeInsurance: 600,
        hoaFee: 0,
        otherCosts: 0,
      };

      const results = calculateFHALoan(inputs);
      expect(results.monthlyPayment.principalAndInterest).toBeCloseTo(
        results.loanDetails.totalLoanAmount / 120,
        2
      );
      expect(results.totalPayments.totalInterest).toBeCloseTo(0, 2);
    });
  });

  describe('Amortization Schedule Validation', () => {
    test('First and last payment details', () => {
      const inputs: FHALoanInputs = {
        homePrice: 350000,
        downPayment: 12250,
        loanTerm: 20,
        interestRate: 5.5,
        financeUFMIP: true,
        propertyTax: 4200,
        homeInsurance: 1400,
        hoaFee: 75,
        otherCosts: 50,
      };

      const results = calculateFHALoan(inputs);

      // First payment
      const firstPayment = results.amortizationSchedule[0];
      expect(firstPayment.month).toBe(1);
      expect(firstPayment.interest).toBeGreaterThan(firstPayment.principal); // Early payments are mostly interest
      expect(firstPayment.balance).toBeLessThan(
        results.loanDetails.totalLoanAmount
      );

      // Last payment
      const lastPayment =
        results.amortizationSchedule[results.amortizationSchedule.length - 1];
      expect(lastPayment.balance).toBeCloseTo(0, 2);
      expect(lastPayment.principal).toBeGreaterThan(lastPayment.interest); // Late payments are mostly principal
    });

    test('Cumulative values match totals', () => {
      const inputs: FHALoanInputs = {
        homePrice: 300000,
        downPayment: 10500,
        loanTerm: 30,
        interestRate: 6,
        financeUFMIP: true,
        propertyTax: 3600,
        homeInsurance: 1200,
        hoaFee: 0,
        otherCosts: 0,
      };

      const results = calculateFHALoan(inputs);

      const lastRow =
        results.amortizationSchedule[results.amortizationSchedule.length - 1];

      // Cumulative principal should equal total loan amount
      expect(lastRow.cumulativePrincipal).toBeCloseTo(
        results.loanDetails.totalLoanAmount,
        2
      );

      // Cumulative interest should match total interest
      expect(lastRow.cumulativeInterest).toBeCloseTo(
        results.totalPayments.totalInterest,
        2
      );

      // Cumulative MIP should match total MIP from payments
      const totalMIPFromSchedule = results.amortizationSchedule.reduce(
        (sum, row) => sum + row.mipPayment,
        0
      );
      expect(lastRow.cumulativeMIP).toBeCloseTo(totalMIPFromSchedule, 2);
    });
  });
});
