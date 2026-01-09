import {
  calculateAnnuityPayout,
  calculatePayoutDuration,
  PaymentFrequency,
} from '../annuityCalculations';

describe('Reference Calculator Validation', () => {
  describe('Calculator.net Reference Tests', () => {
    test('Example from calculator.net: $500,000 at 5% for 10 years monthly', () => {
      const result = calculateAnnuityPayout({
        principal: 500000,
        annualRate: 5,
        years: 10,
        frequency: 'monthly' as PaymentFrequency,
      });

      // The reference calculator shows approximately $5,303.28 monthly payment
      // This matches standard annuity formulas
      expect(result.payoutAmount).toBeCloseTo(5303.28, 1);
      expect(result.totalPayments).toBe(120);

      // Total payout should be payment * number of payments
      const expectedTotal = result.payoutAmount * result.totalPayments;
      expect(result.totalPayout).toBeCloseTo(expectedTotal, 1);

      // Total interest is total payout minus principal
      const expectedInterest = result.totalPayout - 500000;
      expect(result.totalInterest).toBeCloseTo(expectedInterest, 1);
    });

    test('Fixed Payment Mode: $500,000 with $5,000 monthly at 5%', () => {
      const result = calculatePayoutDuration({
        principal: 500000,
        annualRate: 5,
        payoutAmount: 5000,
        frequency: 'monthly' as PaymentFrequency,
      });

      // Should last approximately 10.8 years (130 payments)
      expect(result.years).toBeGreaterThan(10);
      expect(result.years).toBeLessThan(11);
      expect(result.totalPayments).toBeGreaterThan(125);
      expect(result.totalPayments).toBeLessThan(135);
    });

    test('High frequency test: Semi-monthly payments', () => {
      const result = calculateAnnuityPayout({
        principal: 100000,
        annualRate: 4,
        years: 5,
        frequency: 'semimonthly' as PaymentFrequency,
      });

      // 24 payments per year for 5 years = 120 total payments
      expect(result.totalPayments).toBe(120);

      // Payment should be around $900
      expect(result.payoutAmount).toBeGreaterThan(850);
      expect(result.payoutAmount).toBeLessThan(950);
    });

    test('Low frequency test: Annual payments', () => {
      const result = calculateAnnuityPayout({
        principal: 1000000,
        annualRate: 3,
        years: 20,
        frequency: 'annually' as PaymentFrequency,
      });

      // 1 payment per year for 20 years = 20 total payments
      expect(result.totalPayments).toBe(20);

      // Annual payment should be around $67,216
      expect(result.payoutAmount).toBeGreaterThan(67000);
      expect(result.payoutAmount).toBeLessThan(68000);
    });

    test('Edge case: Very low interest rate', () => {
      const result = calculateAnnuityPayout({
        principal: 50000,
        annualRate: 0.5,
        years: 10,
        frequency: 'monthly' as PaymentFrequency,
      });

      // With very low interest, payment should be close to principal/payments
      const simplePayment = 50000 / 120;
      expect(result.payoutAmount).toBeGreaterThan(simplePayment);
      expect(result.payoutAmount).toBeLessThan(simplePayment * 1.05);
    });

    test('Edge case: Payment less than interest (infinite duration)', () => {
      const result = calculatePayoutDuration({
        principal: 100000,
        annualRate: 6,
        payoutAmount: 400, // Less than monthly interest of ~$500
        frequency: 'monthly' as PaymentFrequency,
      });

      // Should indicate infinite duration or growth
      expect(result.years).toBe(Infinity);
      expect(result.willGrow).toBe(true);
    });

    test('Quarterly frequency validation', () => {
      const result = calculateAnnuityPayout({
        principal: 250000,
        annualRate: 6,
        years: 15,
        frequency: 'quarterly' as PaymentFrequency,
      });

      // 4 payments per year for 15 years = 60 total payments
      expect(result.totalPayments).toBe(60);

      // Quarterly payment should be around $6,348
      expect(result.payoutAmount).toBeGreaterThan(6300);
      expect(result.payoutAmount).toBeLessThan(6400);
    });

    test('Bi-weekly frequency validation', () => {
      const result = calculateAnnuityPayout({
        principal: 100000,
        annualRate: 3.5,
        years: 5,
        frequency: 'biweekly' as PaymentFrequency,
      });

      // 26 payments per year for 5 years = 130 total payments
      expect(result.totalPayments).toBe(130);

      // Bi-weekly payment should be around $839
      expect(result.payoutAmount).toBeGreaterThan(835);
      expect(result.payoutAmount).toBeLessThan(845);
    });

    test('Amortization schedule validation', () => {
      const result = calculateAnnuityPayout({
        principal: 100000,
        annualRate: 5,
        years: 3,
        frequency: 'annually' as PaymentFrequency,
      });

      // Check schedule exists and has correct length
      expect(result.schedule).toBeDefined();
      expect(result.schedule?.length).toBe(3);

      // First year should start with full principal
      expect(result.schedule![0].beginningBalance).toBeCloseTo(100000, 2);

      // Last year should end near zero
      expect(result.schedule![2].endingBalance).toBeCloseTo(0, 1);

      // Total of all principal payments should equal original principal
      const totalPrincipal = result.schedule!.reduce(
        (sum, entry) => sum + entry.principal,
        0
      );
      expect(totalPrincipal).toBeCloseTo(100000, 1);
    });

    test('Total calculations consistency', () => {
      const result = calculateAnnuityPayout({
        principal: 500000,
        annualRate: 5,
        years: 10,
        frequency: 'monthly' as PaymentFrequency,
      });

      // Verify internal consistency
      const calculatedTotal = result.payoutAmount * result.totalPayments;
      expect(result.totalPayout).toBeCloseTo(calculatedTotal, 1);

      const calculatedInterest = result.totalPayout - 500000;
      expect(result.totalInterest).toBeCloseTo(calculatedInterest, 1);

      // Interest should be positive for positive rates
      expect(result.totalInterest).toBeGreaterThan(0);

      // Total payout should exceed principal when there's interest
      expect(result.totalPayout).toBeGreaterThan(500000);
    });
  });

  describe('Mathematical Accuracy Tests', () => {
    test('Present value of annuity formula validation', () => {
      // PV = PMT × [(1 - (1 + r)^-n) / r]
      // Rearranged: PMT = PV × [r / (1 - (1 + r)^-n)]

      const principal = 100000;
      const annualRate = 6;
      const years = 10;
      const frequency = 'monthly' as PaymentFrequency;

      const result = calculateAnnuityPayout({
        principal,
        annualRate,
        years,
        frequency,
      });

      // Manual calculation
      const r = annualRate / 100 / 12; // Monthly rate
      const n = years * 12; // Total payments
      const factor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const expectedPayment = principal * factor;

      expect(result.payoutAmount).toBeCloseTo(expectedPayment, 2);
    });

    test('Zero interest rate handling', () => {
      const result = calculateAnnuityPayout({
        principal: 120000,
        annualRate: 0,
        years: 10,
        frequency: 'monthly' as PaymentFrequency,
      });

      // With 0% interest, payment = principal / number of payments
      const expectedPayment = 120000 / 120;
      expect(result.payoutAmount).toBeCloseTo(expectedPayment, 2);
      expect(result.totalInterest).toBe(0);
      expect(result.totalPayout).toBe(120000);
    });

    test('Payment duration calculation accuracy', () => {
      // n = ln(PMT / (PMT - PV × r)) / ln(1 + r)

      const principal = 200000;
      const annualRate = 4;
      const payoutAmount = 2000;
      const frequency = 'monthly' as PaymentFrequency;

      const result = calculatePayoutDuration({
        principal,
        annualRate,
        payoutAmount,
        frequency,
      });

      // Manual calculation
      const r = annualRate / 100 / 12;
      const n =
        Math.log(payoutAmount / (payoutAmount - principal * r)) /
        Math.log(1 + r);
      const expectedYears = n / 12;

      expect(result.years).toBeCloseTo(expectedYears, 2);
    });
  });
});
