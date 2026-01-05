import { describe, it, expect } from 'vitest';
import {
  calculatePayment,
  calculatePaymentSchedule,
  getCompoundingPeriodsPerYear,
  type PaymentInputs,
} from './paymentCalculations';

describe('Payment Calculator', () => {
  describe('Helper Functions', () => {
    it('should calculate correct compounding periods per year', () => {
      expect(getCompoundingPeriodsPerYear('annually')).toBe(1);
      expect(getCompoundingPeriodsPerYear('semi-annually')).toBe(2);
      expect(getCompoundingPeriodsPerYear('quarterly')).toBe(4);
      expect(getCompoundingPeriodsPerYear('monthly')).toBe(12);
    });
  });

  describe('Test Case 1: Reference Calculator - $200,000 at 6% for 15 years', () => {
    // Based on calculator.net reference:
    // $200,000 loan, 15 years, 6% = $1,687.71 monthly payment
    const inputs: PaymentInputs = {
      presentValue: 200000,
      futureValue: 0,
      annualInterestRate: 6,
      numberOfPeriods: 180, // 15 years * 12 months
      compounding: 'monthly',
      paymentType: 'end',
    };

    it('should calculate monthly payment of ~$1,687.71', () => {
      const payment = calculatePayment(inputs);
      expect(payment).toBeGreaterThan(1687);
      expect(payment).toBeLessThan(1688);
    });

    it('should calculate total payments of ~$303,788', () => {
      const result = calculatePaymentSchedule(inputs);
      expect(result.totalPayments).toBeGreaterThan(303700);
      expect(result.totalPayments).toBeLessThan(303900);
    });

    it('should calculate total interest of ~$103,788', () => {
      const result = calculatePaymentSchedule(inputs);
      expect(result.totalInterest).toBeGreaterThan(103700);
      expect(result.totalInterest).toBeLessThan(103900);
    });

    it('should have balance of ~0 at the end', () => {
      const result = calculatePaymentSchedule(inputs);
      const lastRow = result.schedule[result.schedule.length - 1];
      expect(lastRow.balance).toBeLessThan(1);
    });

    it('should generate 180 payment rows', () => {
      const result = calculatePaymentSchedule(inputs);
      expect(result.schedule.length).toBe(180);
    });

    it('first payment should have interest of ~$1,000', () => {
      const result = calculatePaymentSchedule(inputs);
      const firstPayment = result.schedule[0];
      // First month interest = 200,000 * (0.06 / 12) = 1,000
      expect(firstPayment.interest).toBeGreaterThan(999);
      expect(firstPayment.interest).toBeLessThan(1001);
    });

    it('first payment should have principal of ~$687.71', () => {
      const result = calculatePaymentSchedule(inputs);
      const firstPayment = result.schedule[0];
      expect(firstPayment.principal).toBeGreaterThan(686);
      expect(firstPayment.principal).toBeLessThan(689);
    });
  });

  describe('Test Case 2: Small Loan - $10,000 at 5% for 3 years', () => {
    const inputs: PaymentInputs = {
      presentValue: 10000,
      futureValue: 0,
      annualInterestRate: 5,
      numberOfPeriods: 36,
      compounding: 'monthly',
      paymentType: 'end',
    };

    it('should calculate monthly payment', () => {
      const payment = calculatePayment(inputs);
      expect(payment).toBeGreaterThan(299);
      expect(payment).toBeLessThan(300);
    });

    it('should calculate total interest', () => {
      const result = calculatePaymentSchedule(inputs);
      expect(result.totalInterest).toBeGreaterThan(780);
      expect(result.totalInterest).toBeLessThan(800);
    });

    it('should generate 36 payment rows', () => {
      const result = calculatePaymentSchedule(inputs);
      expect(result.schedule.length).toBe(36);
    });
  });

  describe('Test Case 3: With Balloon Payment - $50,000 at 4% for 5 years with $10,000 balloon', () => {
    const inputs: PaymentInputs = {
      presentValue: 50000,
      futureValue: 10000, // Balloon payment at end
      annualInterestRate: 4,
      numberOfPeriods: 60,
      compounding: 'monthly',
      paymentType: 'end',
    };

    it('should calculate lower monthly payment due to balloon', () => {
      const paymentWithBalloon = calculatePayment(inputs);
      const paymentWithoutBalloon = calculatePayment({
        ...inputs,
        futureValue: 0,
      });
      expect(paymentWithBalloon).toBeLessThan(paymentWithoutBalloon);
    });

    it('should have balloon amount remaining at the end', () => {
      const result = calculatePaymentSchedule(inputs);
      const lastRow = result.schedule[result.schedule.length - 1];
      expect(lastRow.balance).toBeGreaterThan(9900);
      expect(lastRow.balance).toBeLessThan(10100);
    });
  });

  describe('Test Case 4: Quarterly Compounding - $100,000 at 6% for 10 years', () => {
    const inputs: PaymentInputs = {
      presentValue: 100000,
      futureValue: 0,
      annualInterestRate: 6,
      numberOfPeriods: 120, // 10 years monthly payments
      compounding: 'quarterly',
      paymentType: 'end',
    };

    it('should calculate payment with quarterly compounding', () => {
      const payment = calculatePayment(inputs);
      // Should be slightly different than monthly compounding
      expect(payment).toBeGreaterThan(1100);
      expect(payment).toBeLessThan(1120);
    });

    it('should generate 120 payment rows', () => {
      const result = calculatePaymentSchedule(inputs);
      expect(result.schedule.length).toBe(120);
    });
  });

  describe('Test Case 5: Semi-Annual Compounding - $75,000 at 5.5% for 7 years', () => {
    const inputs: PaymentInputs = {
      presentValue: 75000,
      futureValue: 0,
      annualInterestRate: 5.5,
      numberOfPeriods: 84,
      compounding: 'semi-annually',
      paymentType: 'end',
    };

    it('should calculate payment with semi-annual compounding', () => {
      const payment = calculatePayment(inputs);
      expect(payment).toBeGreaterThan(1050);
      expect(payment).toBeLessThan(1080);
    });
  });

  describe('Test Case 6: Annual Compounding - $25,000 at 7% for 5 years', () => {
    const inputs: PaymentInputs = {
      presentValue: 25000,
      futureValue: 0,
      annualInterestRate: 7,
      numberOfPeriods: 60,
      compounding: 'annually',
      paymentType: 'end',
    };

    it('should calculate payment with annual compounding', () => {
      const payment = calculatePayment(inputs);
      expect(payment).toBeGreaterThan(490);
      expect(payment).toBeLessThan(500);
    });
  });

  describe('Test Case 7: Payment at Beginning of Period - $30,000 at 6% for 4 years', () => {
    const inputs: PaymentInputs = {
      presentValue: 30000,
      futureValue: 0,
      annualInterestRate: 6,
      numberOfPeriods: 48,
      compounding: 'monthly',
      paymentType: 'beginning',
    };

    it('should calculate lower payment for beginning-of-period', () => {
      const paymentBeginning = calculatePayment(inputs);
      const paymentEnd = calculatePayment({ ...inputs, paymentType: 'end' });
      expect(paymentBeginning).toBeLessThan(paymentEnd);
    });

    it('should have consistent payment amounts', () => {
      const result = calculatePaymentSchedule(inputs);
      const allPayments = result.schedule.map(row => row.payment);
      const uniquePayments = new Set(allPayments.map(p => Math.round(p * 100)));
      expect(uniquePayments.size).toBe(1); // All payments should be the same
    });
  });

  describe('Test Case 8: Zero Interest Rate - $20,000 for 24 months', () => {
    const inputs: PaymentInputs = {
      presentValue: 20000,
      futureValue: 0,
      annualInterestRate: 0,
      numberOfPeriods: 24,
      compounding: 'monthly',
      paymentType: 'end',
    };

    it('should calculate simple division for 0% interest', () => {
      const payment = calculatePayment(inputs);
      expect(payment).toBeCloseTo(833.33, 2);
    });

    it('should have zero total interest', () => {
      const result = calculatePaymentSchedule(inputs);
      expect(result.totalInterest).toBe(0);
    });
  });

  describe('Test Case 9: High Interest Rate - $15,000 at 18% for 2 years', () => {
    const inputs: PaymentInputs = {
      presentValue: 15000,
      futureValue: 0,
      annualInterestRate: 18,
      numberOfPeriods: 24,
      compounding: 'monthly',
      paymentType: 'end',
    };

    it('should calculate payment for high interest rate', () => {
      const payment = calculatePayment(inputs);
      expect(payment).toBeGreaterThan(740);
      expect(payment).toBeLessThan(750);
    });

    it('should have significant interest paid', () => {
      const result = calculatePaymentSchedule(inputs);
      const interestRatio = result.totalInterest / result.totalPrincipal;
      expect(interestRatio).toBeGreaterThan(0.18); // Interest is significant
    });
  });

  describe('Test Case 10: Long Term Loan - $300,000 at 4.5% for 30 years', () => {
    const inputs: PaymentInputs = {
      presentValue: 300000,
      futureValue: 0,
      annualInterestRate: 4.5,
      numberOfPeriods: 360,
      compounding: 'monthly',
      paymentType: 'end',
    };

    it('should calculate monthly payment', () => {
      const payment = calculatePayment(inputs);
      expect(payment).toBeGreaterThan(1520);
      expect(payment).toBeLessThan(1530);
    });

    it('should have very high total interest for long term', () => {
      const result = calculatePaymentSchedule(inputs);
      expect(result.totalInterest).toBeGreaterThan(245000);
      expect(result.totalInterest).toBeLessThan(250000);
    });

    it('should generate 360 payment rows', () => {
      const result = calculatePaymentSchedule(inputs);
      expect(result.schedule.length).toBe(360);
    });
  });

  describe('Payment Schedule Validation', () => {
    const inputs: PaymentInputs = {
      presentValue: 50000,
      futureValue: 0,
      annualInterestRate: 6,
      numberOfPeriods: 60,
      compounding: 'monthly',
      paymentType: 'end',
    };

    it('should have decreasing balance over time', () => {
      const result = calculatePaymentSchedule(inputs);
      for (let i = 1; i < result.schedule.length; i++) {
        expect(result.schedule[i].balance).toBeLessThanOrEqual(
          result.schedule[i - 1].balance
        );
      }
    });

    it('should have increasing principal portion over time', () => {
      const result = calculatePaymentSchedule(inputs);
      const firstPayment = result.schedule[0];
      const midPayment = result.schedule[Math.floor(result.schedule.length / 2)];
      const lastPayment = result.schedule[result.schedule.length - 1];

      expect(midPayment.principal).toBeGreaterThan(firstPayment.principal);
      expect(lastPayment.principal).toBeGreaterThan(midPayment.principal);
    });

    it('should have decreasing interest portion over time', () => {
      const result = calculatePaymentSchedule(inputs);
      const firstPayment = result.schedule[0];
      const midPayment = result.schedule[Math.floor(result.schedule.length / 2)];
      const lastPayment = result.schedule[result.schedule.length - 1];

      expect(midPayment.interest).toBeLessThan(firstPayment.interest);
      expect(lastPayment.interest).toBeLessThan(midPayment.interest);
    });

    it('should have cumulative principal equal to loan amount', () => {
      const result = calculatePaymentSchedule(inputs);
      const lastRow = result.schedule[result.schedule.length - 1];
      expect(lastRow.cumulativePrincipal).toBeCloseTo(inputs.presentValue, 0);
    });

    it('payment should equal principal plus interest each period', () => {
      const result = calculatePaymentSchedule(inputs);
      result.schedule.forEach(row => {
        expect(row.payment).toBeCloseTo(row.principal + row.interest, 2);
      });
    });
  });

  describe('Comparison Tests: Different Compounding Frequencies', () => {
    const baseInputs = {
      presentValue: 100000,
      futureValue: 0,
      annualInterestRate: 6,
      numberOfPeriods: 120,
      paymentType: 'end' as const,
    };

    it('monthly compounding should have highest effective rate', () => {
      const monthly = calculatePayment({ ...baseInputs, compounding: 'monthly' });
      const quarterly = calculatePayment({ ...baseInputs, compounding: 'quarterly' });
      const semiAnnual = calculatePayment({ ...baseInputs, compounding: 'semi-annually' });
      const annual = calculatePayment({ ...baseInputs, compounding: 'annually' });

      // More frequent compounding = higher effective rate = higher payment
      expect(monthly).toBeGreaterThan(quarterly);
      expect(quarterly).toBeGreaterThan(semiAnnual);
      expect(semiAnnual).toBeGreaterThan(annual);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small loan amounts', () => {
      const inputs: PaymentInputs = {
        presentValue: 100,
        futureValue: 0,
        annualInterestRate: 5,
        numberOfPeriods: 12,
        compounding: 'monthly',
        paymentType: 'end',
      };

      const payment = calculatePayment(inputs);
      expect(payment).toBeGreaterThan(8);
      expect(payment).toBeLessThan(9);
    });

    it('should handle very large loan amounts', () => {
      const inputs: PaymentInputs = {
        presentValue: 10000000,
        futureValue: 0,
        annualInterestRate: 4,
        numberOfPeriods: 360,
        compounding: 'monthly',
        paymentType: 'end',
      };

      const payment = calculatePayment(inputs);
      expect(payment).toBeGreaterThan(47000);
      expect(payment).toBeLessThan(48000);
    });

    it('should handle very short term', () => {
      const inputs: PaymentInputs = {
        presentValue: 5000,
        futureValue: 0,
        annualInterestRate: 6,
        numberOfPeriods: 6,
        compounding: 'monthly',
        paymentType: 'end',
      };

      const payment = calculatePayment(inputs);
      expect(payment).toBeGreaterThan(840);
      expect(payment).toBeLessThan(850);
    });

    it('should handle balloon payment equal to loan amount', () => {
      const inputs: PaymentInputs = {
        presentValue: 10000,
        futureValue: 10000,
        annualInterestRate: 6,
        numberOfPeriods: 12,
        compounding: 'monthly',
        paymentType: 'end',
      };

      const result = calculatePaymentSchedule(inputs);
      // Payment should only cover interest since balloon = principal
      expect(result.monthlyPayment).toBeGreaterThan(49);
      expect(result.monthlyPayment).toBeLessThan(51);
    });
  });
});
