import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculateLoanAmount,
  isPMIRequired,
  calculateMortgage,
  generateAmortizationSchedule,
  type MortgageInputs,
  type ExtraPayments,
} from './mortgageCalculations';

describe('Mortgage Calculator', () => {
  describe('Basic Calculations', () => {
    it('should calculate loan amount correctly', () => {
      expect(calculateLoanAmount(400000, 80000)).toBe(320000);
      expect(calculateLoanAmount(300000, 60000)).toBe(240000);
      expect(calculateLoanAmount(500000, 100000)).toBe(400000);
    });

    it('should determine PMI requirement correctly', () => {
      // 20% down - no PMI
      expect(isPMIRequired(400000, 80000)).toBe(false);
      // 10% down - requires PMI
      expect(isPMIRequired(400000, 40000)).toBe(true);
      // 15% down - requires PMI
      expect(isPMIRequired(300000, 45000)).toBe(true);
      // 25% down - no PMI
      expect(isPMIRequired(500000, 125000)).toBe(false);
    });

    it('should calculate monthly payment for 30-year fixed mortgage at 6.5%', () => {
      // Test case 1: $320,000 loan, 30 years, 6.5% APR
      const payment = calculateMonthlyPayment(320000, 6.5, 30);
      expect(payment).toBeCloseTo(2022.62, 2);
    });

    it('should calculate monthly payment for 15-year fixed mortgage at 5.5%', () => {
      // Test case 2: $240,000 loan, 15 years, 5.5% APR
      const payment = calculateMonthlyPayment(240000, 5.5, 15);
      expect(payment).toBeCloseTo(1961.00, 2);
    });

    it('should calculate monthly payment for 30-year fixed mortgage at 7%', () => {
      // Test case 3: $400,000 loan, 30 years, 7% APR
      const payment = calculateMonthlyPayment(400000, 7, 30);
      expect(payment).toBeCloseTo(2661.21, 2);
    });

    it('should handle zero interest rate', () => {
      // Edge case: 0% interest
      const payment = calculateMonthlyPayment(300000, 0, 30);
      expect(payment).toBeCloseTo(833.33, 2);
    });

    it('should handle very high interest rate', () => {
      // Edge case: 15% interest
      const payment = calculateMonthlyPayment(200000, 15, 30);
      expect(payment).toBeCloseTo(2528.89, 2);
    });
  });

  describe('Complete Mortgage Calculation', () => {
    it('should calculate complete mortgage with typical scenario', () => {
      // Test Case 1: Typical 30-year mortgage
      const inputs: MortgageInputs = {
        homePrice: 400000,
        downPayment: 80000, // 20% down
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 4800, // $400/month
        homeInsurance: 1500, // $125/month
        pmi: 0, // No PMI with 20% down
        hoaFee: 0,
        otherCosts: 333.33,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateMortgage(inputs);

      // Verify loan amount
      expect(results.loanAmount).toBe(320000);

      // Verify monthly payment (P&I only)
      expect(results.monthlyPayment.principalAndInterest).toBeCloseTo(
        2022.62,
        2
      );

      // Verify total monthly payment including all costs
      expect(results.monthlyPayment.totalMonthly).toBeCloseTo(2880.95, 2);

      // Verify total interest over life of loan
      expect(results.totalPayments.totalInterest).toBeCloseTo(408142.36, 1);

      // Verify total mortgage payment (principal + interest)
      expect(results.totalPayments.totalMortgagePayment).toBeCloseTo(
        728142.36,
        1
      );

      // Verify amortization schedule length
      expect(results.amortizationSchedule.length).toBe(360);
    });

    it('should calculate mortgage with PMI for less than 20% down', () => {
      // Test Case 2: 10% down payment requiring PMI
      const inputs: MortgageInputs = {
        homePrice: 300000,
        downPayment: 30000, // 10% down
        loanTerm: 30,
        interestRate: 6.75,
        propertyTax: 3600, // $300/month
        homeInsurance: 1200, // $100/month
        pmi: 2700, // 0.9% of loan amount annually
        hoaFee: 50,
        otherCosts: 200,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateMortgage(inputs);

      // Verify loan amount
      expect(results.loanAmount).toBe(270000);

      // Verify monthly P&I payment
      expect(results.monthlyPayment.principalAndInterest).toBeCloseTo(
        1751.21,
        2
      );

      // Verify PMI is included
      expect(results.monthlyPayment.pmi).toBeCloseTo(225, 2);

      // Verify total monthly payment
      expect(results.monthlyPayment.totalMonthly).toBeCloseTo(2626.21, 2);

      // PMI should be required initially
      expect(isPMIRequired(inputs.homePrice, inputs.downPayment)).toBe(true);
    });

    it('should calculate 15-year mortgage correctly', () => {
      // Test Case 3: 15-year fixed mortgage
      const inputs: MortgageInputs = {
        homePrice: 350000,
        downPayment: 70000, // 20% down
        loanTerm: 15,
        interestRate: 5.5,
        propertyTax: 4200, // $350/month
        homeInsurance: 1500, // $125/month
        pmi: 0,
        hoaFee: 100,
        otherCosts: 250,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateMortgage(inputs);

      // Verify loan amount
      expect(results.loanAmount).toBe(280000);

      // Verify monthly P&I payment
      expect(results.monthlyPayment.principalAndInterest).toBeCloseTo(
        2287.83,
        2
      );

      // Verify amortization schedule length
      expect(results.amortizationSchedule.length).toBe(180);

      // Total interest should be much less than 30-year
      expect(results.totalPayments.totalInterest).toBeLessThan(150000);
    });

    it('should calculate mortgage with higher interest rate', () => {
      // Test Case 4: Higher interest rate scenario
      const inputs: MortgageInputs = {
        homePrice: 500000,
        downPayment: 100000, // 20% down
        loanTerm: 30,
        interestRate: 7.5,
        propertyTax: 6000, // $500/month
        homeInsurance: 2400, // $200/month
        pmi: 0,
        hoaFee: 150,
        otherCosts: 400,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateMortgage(inputs);

      // Verify loan amount
      expect(results.loanAmount).toBe(400000);

      // Verify monthly P&I payment
      expect(results.monthlyPayment.principalAndInterest).toBeCloseTo(
        2796.86,
        2
      );

      // Verify total monthly payment (2796.86 + 500 + 200 + 150 + 400)
      expect(results.monthlyPayment.totalMonthly).toBeCloseTo(4046.86, 2);

      // Higher interest means more total interest paid
      expect(results.totalPayments.totalInterest).toBeGreaterThan(600000);
    });

    it('should calculate mortgage with minimal costs', () => {
      // Test Case 5: Loan with no additional costs
      const inputs: MortgageInputs = {
        homePrice: 250000,
        downPayment: 50000, // 20% down
        loanTerm: 20,
        interestRate: 6.0,
        propertyTax: 0,
        homeInsurance: 0,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateMortgage(inputs);

      // Verify loan amount
      expect(results.loanAmount).toBe(200000);

      // Verify monthly P&I payment
      expect(results.monthlyPayment.principalAndInterest).toBeCloseTo(
        1432.86,
        2
      );

      // Total monthly should equal P&I only
      expect(results.monthlyPayment.totalMonthly).toBeCloseTo(1432.86, 2);

      // Verify amortization schedule length (20 years = 240 months)
      expect(results.amortizationSchedule.length).toBe(240);
    });
  });

  describe('Amortization Schedule', () => {
    it('should generate correct first and last payment details', () => {
      const inputs: MortgageInputs = {
        homePrice: 300000,
        downPayment: 60000,
        loanTerm: 30,
        interestRate: 6.0,
        propertyTax: 3600,
        homeInsurance: 1200,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const schedule = generateAmortizationSchedule(inputs);

      // First payment
      const firstPayment = schedule[0];
      expect(firstPayment.month).toBe(1);
      expect(firstPayment.balance).toBeLessThan(240000);
      expect(firstPayment.interest).toBeGreaterThan(firstPayment.principal);

      // Last payment
      const lastPayment = schedule[schedule.length - 1];
      expect(lastPayment.balance).toBeCloseTo(0, 2);
      expect(lastPayment.principal).toBeGreaterThan(lastPayment.interest);
    });

    it('should show decreasing interest and increasing principal over time', () => {
      const inputs: MortgageInputs = {
        homePrice: 400000,
        downPayment: 80000,
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 4800,
        homeInsurance: 1500,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const schedule = generateAmortizationSchedule(inputs);

      // Compare first quarter vs last quarter
      const firstQuarterAvgInterest =
        schedule.slice(0, 90).reduce((sum, row) => sum + row.interest, 0) / 90;
      const lastQuarterAvgInterest =
        schedule
          .slice(-90)
          .reduce((sum, row) => sum + row.interest, 0) / 90;

      const firstQuarterAvgPrincipal =
        schedule.slice(0, 90).reduce((sum, row) => sum + row.principal, 0) / 90;
      const lastQuarterAvgPrincipal =
        schedule.slice(-90).reduce((sum, row) => sum + row.principal, 0) / 90;

      // Interest should decrease
      expect(lastQuarterAvgInterest).toBeLessThan(firstQuarterAvgInterest);

      // Principal should increase
      expect(lastQuarterAvgPrincipal).toBeGreaterThan(firstQuarterAvgPrincipal);
    });

    it('should have balance decrease to zero', () => {
      const inputs: MortgageInputs = {
        homePrice: 350000,
        downPayment: 70000,
        loanTerm: 15,
        interestRate: 5.5,
        propertyTax: 4200,
        homeInsurance: 1500,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const schedule = generateAmortizationSchedule(inputs);

      // Balance should start at loan amount
      expect(schedule[0].balance).toBeLessThan(inputs.homePrice - inputs.downPayment);

      // Balance should steadily decrease
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
      }

      // Final balance should be zero
      expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 2);
    });
  });

  describe('Extra Payments', () => {
    it('should reduce loan term with extra monthly payments', () => {
      const inputs: MortgageInputs = {
        homePrice: 300000,
        downPayment: 60000,
        loanTerm: 30,
        interestRate: 6.0,
        propertyTax: 3600,
        homeInsurance: 1200,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const extraPayments: ExtraPayments = {
        monthlyExtra: 200,
        monthlyExtraStartMonth: 1,
        yearlyExtra: 0,
        yearlyExtraStartMonth: 1,
        oneTimePayments: [],
      };

      const scheduleWithoutExtra = generateAmortizationSchedule(inputs);
      const scheduleWithExtra = generateAmortizationSchedule(
        inputs,
        extraPayments
      );

      // Loan should be paid off earlier with extra payments
      expect(scheduleWithExtra.length).toBeLessThan(
        scheduleWithoutExtra.length
      );

      // Total interest should be less
      const totalInterestWithoutExtra = scheduleWithoutExtra.reduce(
        (sum, row) => sum + row.interest,
        0
      );
      const totalInterestWithExtra = scheduleWithExtra.reduce(
        (sum, row) => sum + row.interest,
        0
      );
      expect(totalInterestWithExtra).toBeLessThan(totalInterestWithoutExtra);
    });

    it('should apply yearly extra payments correctly', () => {
      const inputs: MortgageInputs = {
        homePrice: 400000,
        downPayment: 80000,
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 4800,
        homeInsurance: 1500,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const extraPayments: ExtraPayments = {
        monthlyExtra: 0,
        monthlyExtraStartMonth: 1,
        yearlyExtra: 5000,
        yearlyExtraStartMonth: 12, // First yearly payment at month 12
        oneTimePayments: [],
      };

      const schedule = generateAmortizationSchedule(inputs, extraPayments);

      // Check that extra payment was applied at month 12
      expect(schedule[11].extraPayment).toBe(5000);

      // Check that extra payment was applied at month 24
      expect(schedule[23].extraPayment).toBe(5000);

      // Other months should have no extra payment
      expect(schedule[10].extraPayment).toBe(0);
      expect(schedule[13].extraPayment).toBe(0);
    });

    it('should apply one-time extra payments correctly', () => {
      const inputs: MortgageInputs = {
        homePrice: 350000,
        downPayment: 70000,
        loanTerm: 30,
        interestRate: 6.0,
        propertyTax: 4200,
        homeInsurance: 1500,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const extraPayments: ExtraPayments = {
        monthlyExtra: 0,
        monthlyExtraStartMonth: 1,
        yearlyExtra: 0,
        yearlyExtraStartMonth: 1,
        oneTimePayments: [
          { amount: 10000, month: 12 },
          { amount: 15000, month: 60 },
          { amount: 20000, month: 120 },
        ],
      };

      const schedule = generateAmortizationSchedule(inputs, extraPayments);

      // Verify one-time payments were applied
      expect(schedule[11].extraPayment).toBe(10000);
      expect(schedule[59].extraPayment).toBe(15000);
      expect(schedule[119].extraPayment).toBe(20000);
    });

    it('should combine multiple types of extra payments', () => {
      const inputs: MortgageInputs = {
        homePrice: 400000,
        downPayment: 80000,
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 4800,
        homeInsurance: 1500,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const extraPayments: ExtraPayments = {
        monthlyExtra: 100,
        monthlyExtraStartMonth: 1,
        yearlyExtra: 2000,
        yearlyExtraStartMonth: 12,
        oneTimePayments: [{ amount: 5000, month: 24 }],
      };

      const schedule = generateAmortizationSchedule(inputs, extraPayments);

      // At month 1: should have monthly extra only
      expect(schedule[0].extraPayment).toBe(100);

      // At month 12: should have monthly + yearly
      expect(schedule[11].extraPayment).toBe(2100);

      // At month 24: should have monthly + yearly + one-time
      expect(schedule[23].extraPayment).toBe(7100);

      // At month 25: back to monthly only
      expect(schedule[24].extraPayment).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small loan amounts', () => {
      const inputs: MortgageInputs = {
        homePrice: 50000,
        downPayment: 10000,
        loanTerm: 15,
        interestRate: 5.0,
        propertyTax: 600,
        homeInsurance: 300,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateMortgage(inputs);

      expect(results.loanAmount).toBe(40000);
      expect(results.monthlyPayment.principalAndInterest).toBeGreaterThan(0);
      expect(results.amortizationSchedule.length).toBe(180);
    });

    it('should handle very large loan amounts', () => {
      const inputs: MortgageInputs = {
        homePrice: 2000000,
        downPayment: 400000,
        loanTerm: 30,
        interestRate: 6.5,
        propertyTax: 24000,
        homeInsurance: 6000,
        pmi: 0,
        hoaFee: 500,
        otherCosts: 1000,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateMortgage(inputs);

      expect(results.loanAmount).toBe(1600000);
      expect(results.monthlyPayment.principalAndInterest).toBeCloseTo(
        10113.09,
        2
      );
    });

    it('should handle 10-year mortgage term', () => {
      const inputs: MortgageInputs = {
        homePrice: 300000,
        downPayment: 60000,
        loanTerm: 10,
        interestRate: 5.5,
        propertyTax: 3600,
        homeInsurance: 1200,
        pmi: 0,
        hoaFee: 0,
        otherCosts: 0,
        startDate: new Date(2026, 0, 1),
      };

      const results = calculateMortgage(inputs);

      expect(results.loanAmount).toBe(240000);
      expect(results.amortizationSchedule.length).toBe(120);
      // Shorter term means higher monthly payment but much less total interest
      expect(results.monthlyPayment.principalAndInterest).toBeGreaterThan(2500);
      expect(results.totalPayments.totalInterest).toBeLessThan(80000);
    });
  });
});
