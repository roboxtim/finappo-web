import { describe, it, expect } from 'vitest';
import {
  calculateAmortization,
  getTotalPayments,
  getCompoundPeriodsPerYear,
  getPaymentPeriodsPerYear,
  type AmortizationInputs,
} from './amortizationCalculations';

describe('Amortization Calculator', () => {
  describe('Helper Functions', () => {
    it('should calculate correct compound periods per year', () => {
      expect(getCompoundPeriodsPerYear('annually')).toBe(1);
      expect(getCompoundPeriodsPerYear('semi-annually')).toBe(2);
      expect(getCompoundPeriodsPerYear('quarterly')).toBe(4);
      expect(getCompoundPeriodsPerYear('monthly')).toBe(12);
      expect(getCompoundPeriodsPerYear('semi-monthly')).toBe(24);
      expect(getCompoundPeriodsPerYear('bi-weekly')).toBe(26);
      expect(getCompoundPeriodsPerYear('weekly')).toBe(52);
      expect(getCompoundPeriodsPerYear('daily')).toBe(365);
      expect(getCompoundPeriodsPerYear('continuously')).toBe(Infinity);
    });

    it('should calculate correct payment periods per year', () => {
      expect(getPaymentPeriodsPerYear('annually')).toBe(1);
      expect(getPaymentPeriodsPerYear('semi-annually')).toBe(2);
      expect(getPaymentPeriodsPerYear('quarterly')).toBe(4);
      expect(getPaymentPeriodsPerYear('monthly')).toBe(12);
      expect(getPaymentPeriodsPerYear('semi-monthly')).toBe(24);
      expect(getPaymentPeriodsPerYear('bi-weekly')).toBe(26);
      expect(getPaymentPeriodsPerYear('weekly')).toBe(52);
      expect(getPaymentPeriodsPerYear('daily')).toBe(365);
    });

    it('should calculate total payments correctly', () => {
      expect(getTotalPayments(2, 0, 'monthly')).toBe(24);
      expect(getTotalPayments(1, 6, 'monthly')).toBe(18);
      expect(getTotalPayments(3, 0, 'quarterly')).toBe(12);
      expect(getTotalPayments(1, 0, 'bi-weekly')).toBe(26);
    });
  });

  describe('Test Case 1: Simple Monthly Payment - $10,000 at 6% for 2 years', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 10000,
      loanTermYears: 2,
      loanTermMonths: 0,
      interestRate: 6,
      compoundPeriod: 'monthly',
      paymentFrequency: 'monthly',
      startDate: new Date(2026, 0, 1),
    };

    it('should calculate correct monthly payment', () => {
      const result = calculateAmortization(inputs);
      // Expected: ~$443.21 per month
      expect(result.regularPayment).toBeGreaterThan(443);
      expect(result.regularPayment).toBeLessThan(444);
    });

    it('should calculate correct total interest', () => {
      const result = calculateAmortization(inputs);
      // Total payments = 443.21 * 24 = 10,637.04
      // Total interest = 10,637.04 - 10,000 = 637.04
      expect(result.totalInterest).toBeGreaterThan(636);
      expect(result.totalInterest).toBeLessThan(638);
    });

    it('should generate 24 payment rows', () => {
      const result = calculateAmortization(inputs);
      expect(result.amortizationSchedule.length).toBe(24);
    });

    it('should have balance of ~0 at the end', () => {
      const result = calculateAmortization(inputs);
      const lastRow = result.amortizationSchedule[result.amortizationSchedule.length - 1];
      expect(lastRow.balance).toBeLessThan(0.01);
    });
  });

  describe('Test Case 2: Larger Loan - $200,000 at 6% for 15 years monthly', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 200000,
      loanTermYears: 15,
      loanTermMonths: 0,
      interestRate: 6,
      compoundPeriod: 'monthly',
      paymentFrequency: 'monthly',
      startDate: new Date(2026, 0, 1),
    };

    it('should calculate correct monthly payment', () => {
      const result = calculateAmortization(inputs);
      // Expected: ~$1,687.71 per month (standard 15-year mortgage at 6%)
      expect(result.regularPayment).toBeGreaterThan(1687);
      expect(result.regularPayment).toBeLessThan(1688);
    });

    it('should calculate correct total interest', () => {
      const result = calculateAmortization(inputs);
      // Total payments = 1,687.71 * 180 = 303,788
      // Total interest = 303,788 - 200,000 = 103,788
      expect(result.totalInterest).toBeGreaterThan(103700);
      expect(result.totalInterest).toBeLessThan(103900);
    });

    it('should generate 180 payment rows', () => {
      const result = calculateAmortization(inputs);
      expect(result.amortizationSchedule.length).toBe(180);
    });
  });

  describe('Test Case 3: Bi-Weekly Payments - $50,000 at 5% for 5 years', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 50000,
      loanTermYears: 5,
      loanTermMonths: 0,
      interestRate: 5,
      compoundPeriod: 'monthly',
      paymentFrequency: 'bi-weekly',
      startDate: new Date(2026, 0, 1),
    };

    it('should calculate bi-weekly payment', () => {
      const result = calculateAmortization(inputs);
      // With bi-weekly payments (26 per year for 5 years = 130 payments)
      // Payment should be roughly half the monthly payment
      expect(result.regularPayment).toBeGreaterThan(430);
      expect(result.regularPayment).toBeLessThan(450);
    });

    it('should generate 130 payment rows', () => {
      const result = calculateAmortization(inputs);
      expect(result.amortizationSchedule.length).toBe(130);
    });
  });

  describe('Test Case 4: Quarterly Payments - $100,000 at 7% for 10 years', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 100000,
      loanTermYears: 10,
      loanTermMonths: 0,
      interestRate: 7,
      compoundPeriod: 'quarterly',
      paymentFrequency: 'quarterly',
      startDate: new Date(2026, 0, 1),
    };

    it('should calculate quarterly payment', () => {
      const result = calculateAmortization(inputs);
      // 40 quarterly payments over 10 years
      expect(result.regularPayment).toBeGreaterThan(3400);
      expect(result.regularPayment).toBeLessThan(3600);
    });

    it('should generate 40 payment rows', () => {
      const result = calculateAmortization(inputs);
      expect(result.amortizationSchedule.length).toBe(40);
    });
  });

  describe('Test Case 5: Semi-Monthly Payments - $25,000 at 8% for 3 years', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 25000,
      loanTermYears: 3,
      loanTermMonths: 0,
      interestRate: 8,
      compoundPeriod: 'monthly',
      paymentFrequency: 'semi-monthly',
      startDate: new Date(2026, 0, 1),
    };

    it('should calculate semi-monthly payment', () => {
      const result = calculateAmortization(inputs);
      // 24 payments per year for 3 years = 72 payments
      expect(result.regularPayment).toBeGreaterThan(390);
      expect(result.regularPayment).toBeLessThan(410);
    });

    it('should generate 72 payment rows', () => {
      const result = calculateAmortization(inputs);
      expect(result.amortizationSchedule.length).toBe(72);
    });
  });

  describe('Test Case 6: Mixed Term - 1 year 6 months', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 15000,
      loanTermYears: 1,
      loanTermMonths: 6,
      interestRate: 5.5,
      compoundPeriod: 'monthly',
      paymentFrequency: 'monthly',
      startDate: new Date(2026, 0, 1),
    };

    it('should calculate payment for 18 months', () => {
      const result = calculateAmortization(inputs);
      expect(result.regularPayment).toBeGreaterThan(850);
      expect(result.regularPayment).toBeLessThan(871);
    });

    it('should generate 18 payment rows', () => {
      const result = calculateAmortization(inputs);
      expect(result.amortizationSchedule.length).toBe(18);
    });
  });

  describe('Test Case 7: Zero Interest Rate', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 12000,
      loanTermYears: 2,
      loanTermMonths: 0,
      interestRate: 0,
      compoundPeriod: 'monthly',
      paymentFrequency: 'monthly',
      startDate: new Date(2026, 0, 1),
    };

    it('should calculate simple division for 0% interest', () => {
      const result = calculateAmortization(inputs);
      // 12,000 / 24 = 500
      expect(result.regularPayment).toBe(500);
    });

    it('should have zero total interest', () => {
      const result = calculateAmortization(inputs);
      expect(result.totalInterest).toBe(0);
    });
  });

  describe('Test Case 8: Extra Monthly Payments', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 30000,
      loanTermYears: 5,
      loanTermMonths: 0,
      interestRate: 6,
      compoundPeriod: 'monthly',
      paymentFrequency: 'monthly',
      startDate: new Date(2026, 0, 1),
    };

    it('should reduce total interest with extra monthly payments', () => {
      const resultWithoutExtra = calculateAmortization(inputs);
      const resultWithExtra = calculateAmortization(inputs, {
        monthlyExtra: 100,
        monthlyExtraStartMonth: 1,
        yearlyExtra: 0,
        yearlyExtraStartMonth: 12,
        oneTimePayments: [],
      });

      expect(resultWithExtra.totalInterest).toBeLessThan(
        resultWithoutExtra.totalInterest
      );
      expect(resultWithExtra.amortizationSchedule.length).toBeLessThan(
        resultWithoutExtra.amortizationSchedule.length
      );
    });
  });

  describe('Test Case 9: One-Time Extra Payment', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 40000,
      loanTermYears: 4,
      loanTermMonths: 0,
      interestRate: 5,
      compoundPeriod: 'monthly',
      paymentFrequency: 'monthly',
      startDate: new Date(2026, 0, 1),
    };

    it('should reduce total interest with one-time payment', () => {
      const resultWithoutExtra = calculateAmortization(inputs);
      const resultWithExtra = calculateAmortization(inputs, {
        monthlyExtra: 0,
        monthlyExtraStartMonth: 1,
        yearlyExtra: 0,
        yearlyExtraStartMonth: 12,
        oneTimePayments: [{ amount: 5000, month: 12 }],
      });

      expect(resultWithExtra.totalInterest).toBeLessThan(
        resultWithoutExtra.totalInterest
      );
    });
  });

  describe('Test Case 10: Semi-Annual Compound with Monthly Payments', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 75000,
      loanTermYears: 7,
      loanTermMonths: 0,
      interestRate: 6.5,
      compoundPeriod: 'semi-annually',
      paymentFrequency: 'monthly',
      startDate: new Date(2026, 0, 1),
    };

    it('should calculate payments with different compound and payment frequencies', () => {
      const result = calculateAmortization(inputs);
      // With semi-annual compounding but monthly payments
      expect(result.regularPayment).toBeGreaterThan(1050);
      expect(result.regularPayment).toBeLessThan(1150);
    });

    it('should generate 84 monthly payments', () => {
      const result = calculateAmortization(inputs);
      expect(result.amortizationSchedule.length).toBe(84);
    });
  });

  describe('Amortization Schedule Validation', () => {
    const inputs: AmortizationInputs = {
      loanAmount: 20000,
      loanTermYears: 3,
      loanTermMonths: 0,
      interestRate: 5,
      compoundPeriod: 'monthly',
      paymentFrequency: 'monthly',
      startDate: new Date(2026, 0, 1),
    };

    it('should have decreasing balance over time', () => {
      const result = calculateAmortization(inputs);
      for (let i = 1; i < result.amortizationSchedule.length; i++) {
        expect(result.amortizationSchedule[i].balance).toBeLessThanOrEqual(
          result.amortizationSchedule[i - 1].balance
        );
      }
    });

    it('should have increasing principal portion over time', () => {
      const result = calculateAmortization(inputs);
      const firstPayment = result.amortizationSchedule[0];
      const lastPayment =
        result.amortizationSchedule[result.amortizationSchedule.length - 1];
      expect(lastPayment.principal).toBeGreaterThan(firstPayment.principal);
    });

    it('should have decreasing interest portion over time', () => {
      const result = calculateAmortization(inputs);
      const firstPayment = result.amortizationSchedule[0];
      const lastPayment =
        result.amortizationSchedule[result.amortizationSchedule.length - 1];
      expect(lastPayment.interest).toBeLessThan(firstPayment.interest);
    });

    it('should have cumulative principal equal to loan amount', () => {
      const result = calculateAmortization(inputs);
      const lastRow =
        result.amortizationSchedule[result.amortizationSchedule.length - 1];
      expect(lastRow.cumulativePrincipal).toBeCloseTo(inputs.loanAmount, 0);
    });
  });
});
