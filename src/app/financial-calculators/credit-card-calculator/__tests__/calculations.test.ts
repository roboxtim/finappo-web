import {
  calculateCreditCardPayoff,
  calculateMinimumPayment,
  validateCreditCardInputs,
  formatCurrency,
  formatMonths,
  formatPercentage,
  type CreditCardInputs,
} from '../calculations';

describe('Credit Card Calculator', () => {
  describe('validateCreditCardInputs', () => {
    it('should return no errors for valid inputs', () => {
      const inputs: CreditCardInputs = {
        balance: 5000,
        apr: 18,
        paymentType: 'fixed',
        fixedPayment: 200,
        payoffMonths: 0,
      };
      expect(validateCreditCardInputs(inputs)).toEqual([]);
    });

    it('should validate balance', () => {
      const inputs: CreditCardInputs = {
        balance: 0,
        apr: 18,
        paymentType: 'fixed',
        fixedPayment: 200,
        payoffMonths: 0,
      };
      const errors = validateCreditCardInputs(inputs);
      expect(errors).toContain('Balance must be greater than $0');
    });

    it('should validate APR range', () => {
      const inputs: CreditCardInputs = {
        balance: 5000,
        apr: 50,
        paymentType: 'fixed',
        fixedPayment: 200,
        payoffMonths: 0,
      };
      const errors = validateCreditCardInputs(inputs);
      expect(errors).toContain('APR must be between 0% and 40%');
    });

    it('should validate fixed payment amount', () => {
      const inputs: CreditCardInputs = {
        balance: 5000,
        apr: 18,
        paymentType: 'fixed',
        fixedPayment: 10,
        payoffMonths: 0,
      };
      const errors = validateCreditCardInputs(inputs);
      expect(errors).toContain('Fixed payment must be at least $15');
    });

    it('should validate payoff months when using timeframe', () => {
      const inputs: CreditCardInputs = {
        balance: 5000,
        apr: 18,
        paymentType: 'timeframe',
        fixedPayment: 0,
        payoffMonths: 0,
      };
      const errors = validateCreditCardInputs(inputs);
      expect(errors).toContain('Payoff timeframe must be at least 1 month');
    });

    it('should ensure fixed payment covers interest', () => {
      const inputs: CreditCardInputs = {
        balance: 10000,
        apr: 24,
        paymentType: 'fixed',
        fixedPayment: 100, // Less than monthly interest of ~$200
        payoffMonths: 0,
      };
      const errors = validateCreditCardInputs(inputs);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('must be greater than the monthly interest');
    });
  });

  describe('calculateMinimumPayment', () => {
    it('should calculate minimum as 1% of balance plus interest', () => {
      const minimum = calculateMinimumPayment(1000, 18);
      // 1% of $1000 = $10
      // Monthly interest = $1000 * 0.18 / 12 = $15
      // Total = $25
      expect(minimum).toBe(25);
    });

    it('should enforce $15 minimum floor', () => {
      const minimum = calculateMinimumPayment(100, 12);
      expect(minimum).toBe(15);
    });

    it('should return balance if less than $15', () => {
      const minimum = calculateMinimumPayment(10, 18);
      expect(minimum).toBe(10);
    });

    it('should handle high APR correctly', () => {
      const minimum = calculateMinimumPayment(5000, 24.99);
      // 1% of $5000 = $50
      // Monthly interest = $5000 * 0.2499 / 12 = $104.13
      // Total = $154.13
      expect(minimum).toBeCloseTo(154.13, 2);
    });

    it('should handle zero APR', () => {
      const minimum = calculateMinimumPayment(1000, 0);
      // 1% of $1000 = $10, but minimum is $15
      expect(minimum).toBe(15);
    });
  });

  describe('calculateCreditCardPayoff', () => {
    describe('Minimum payment scenarios', () => {
      it('should calculate payoff with minimum payments - Test Case 1', () => {
        const inputs: CreditCardInputs = {
          balance: 5000,
          apr: 18,
          paymentType: 'minimum',
          fixedPayment: 0,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        // With 18% APR and $5000 balance, paying minimum only
        expect(results.monthsToPayoff).toBeGreaterThan(200);
        expect(results.totalInterest).toBeGreaterThan(4000);
        expect(results.totalPaid).toBeGreaterThan(9000);
        expect(results.monthlyPayment).toBeCloseTo(125, 0); // Initial minimum
      });

      it('should handle high APR minimum payments - Test Case 4', () => {
        const inputs: CreditCardInputs = {
          balance: 2500,
          apr: 24.99,
          paymentType: 'minimum',
          fixedPayment: 0,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.monthsToPayoff).toBeGreaterThan(200);
        expect(results.totalInterest).toBeGreaterThan(3000);
        expect(results.effectiveAPR).toBeCloseTo(28.06, 1); // Effective APR with compounding
      });
    });

    describe('Fixed payment scenarios', () => {
      it('should calculate fixed payment payoff - Test Case 2', () => {
        const inputs: CreditCardInputs = {
          balance: 10000,
          apr: 22,
          paymentType: 'fixed',
          fixedPayment: 500,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        // With $500/month payment
        expect(results.monthsToPayoff).toBeLessThan(30);
        expect(results.monthsToPayoff).toBeGreaterThan(20);
        expect(results.totalInterest).toBeLessThan(2600); // Adjusted for actual calculation
        expect(results.monthlyPayment).toBe(500);
      });

      it('should calculate small balance payoff - Test Case 3', () => {
        const inputs: CreditCardInputs = {
          balance: 3000,
          apr: 15,
          paymentType: 'fixed',
          fixedPayment: 200,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.monthsToPayoff).toBeLessThan(20);
        expect(results.totalInterest).toBeLessThan(400);
        expect(results.totalPaid).toBeLessThan(3400);
      });

      it('should handle large fixed payment - Test Case 5', () => {
        const inputs: CreditCardInputs = {
          balance: 7500,
          apr: 19.99,
          paymentType: 'fixed',
          fixedPayment: 300,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.monthsToPayoff).toBeLessThan(35);
        expect(results.monthsToPayoff).toBeGreaterThan(25);
        expect(results.totalInterest).toBeLessThan(2300); // Adjusted for actual calculation
      });
    });

    describe('Timeframe payment scenarios', () => {
      it('should calculate payment for desired timeframe', () => {
        const inputs: CreditCardInputs = {
          balance: 5000,
          apr: 18,
          paymentType: 'timeframe',
          fixedPayment: 0,
          payoffMonths: 24,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.monthsToPayoff).toBe(24);
        expect(results.monthlyPayment).toBeCloseTo(250, -1); // Approximately $250
        expect(results.totalInterest).toBeLessThan(1000);
      });

      it('should handle short timeframe', () => {
        const inputs: CreditCardInputs = {
          balance: 1000,
          apr: 20,
          paymentType: 'timeframe',
          fixedPayment: 0,
          payoffMonths: 6,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.monthsToPayoff).toBe(6);
        expect(results.monthlyPayment).toBeCloseTo(175, -1);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero APR', () => {
        const inputs: CreditCardInputs = {
          balance: 1000,
          apr: 0,
          paymentType: 'fixed',
          fixedPayment: 100,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.monthsToPayoff).toBe(10);
        expect(results.totalInterest).toBe(0);
        expect(results.totalPaid).toBe(1000);
      });

      it('should handle very high payment', () => {
        const inputs: CreditCardInputs = {
          balance: 1000,
          apr: 18,
          paymentType: 'fixed',
          fixedPayment: 1000,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.monthsToPayoff).toBeLessThanOrEqual(2); // May take 1-2 months depending on calculation
        expect(results.totalInterest).toBeCloseTo(15, 0);
      });

      it('should cap payoff at 600 months for minimum payments', () => {
        const inputs: CreditCardInputs = {
          balance: 10000,
          apr: 29.99, // Very high APR
          paymentType: 'minimum',
          fixedPayment: 0,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.monthsToPayoff).toBeLessThanOrEqual(600);
      });
    });

    describe('Payment comparisons', () => {
      it('should generate accurate payment comparisons', () => {
        const inputs: CreditCardInputs = {
          balance: 5000,
          apr: 18,
          paymentType: 'fixed',
          fixedPayment: 200,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.paymentComparisons.length).toBeGreaterThanOrEqual(3); // At least 3 comparisons

        const minPayment = results.paymentComparisons.find(
          (p) => p.type === 'minimum'
        );
        expect(minPayment).toBeDefined();
        expect(minPayment!.monthsToPayoff).toBeGreaterThan(100);

        const currentPayment = results.paymentComparisons.find(
          (p) => p.type === 'current'
        );
        expect(currentPayment).toBeDefined();
        expect(currentPayment!.payment).toBe(200);

        const doublePayment = results.paymentComparisons.find(
          (p) => p.type === 'double'
        );
        expect(doublePayment).toBeDefined();
        expect(doublePayment!.payment).toBe(400);
        expect(doublePayment!.monthsToPayoff).toBeLessThan(
          currentPayment!.monthsToPayoff
        );
      });
    });

    describe('Amortization schedule', () => {
      it('should generate correct amortization schedule', () => {
        const inputs: CreditCardInputs = {
          balance: 1000,
          apr: 12,
          paymentType: 'fixed',
          fixedPayment: 200,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.amortizationSchedule).toBeDefined();
        expect(results.amortizationSchedule.length).toBeGreaterThan(0);

        const firstMonth = results.amortizationSchedule[0];
        expect(firstMonth.month).toBe(1);
        expect(firstMonth.payment).toBe(200);
        expect(firstMonth.interestPaid).toBeCloseTo(10, 1); // 1% monthly interest
        expect(firstMonth.principalPaid).toBeCloseTo(190, 1);
        expect(firstMonth.remainingBalance).toBeCloseTo(810, 1);

        const lastMonth =
          results.amortizationSchedule[results.amortizationSchedule.length - 1];
        expect(lastMonth.remainingBalance).toBeCloseTo(0, 2);
      });

      it('should limit amortization schedule to 60 months', () => {
        const inputs: CreditCardInputs = {
          balance: 10000,
          apr: 18,
          paymentType: 'minimum',
          fixedPayment: 0,
          payoffMonths: 0,
        };
        const results = calculateCreditCardPayoff(inputs);

        expect(results.amortizationSchedule.length).toBeLessThanOrEqual(60);
      });
    });
  });

  describe('Formatting functions', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should format months correctly', () => {
      expect(formatMonths(1)).toBe('1 month');
      expect(formatMonths(12)).toBe('1 year');
      expect(formatMonths(18)).toBe('1 year 6 months');
      expect(formatMonths(24)).toBe('2 years');
      expect(formatMonths(30)).toBe('2 years 6 months');
    });

    it('should format percentage correctly', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%');
      expect(formatPercentage(0.05)).toBe('5.00%');
      expect(formatPercentage(1)).toBe('100.00%');
    });
  });
});
