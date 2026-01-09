import {
  calculateAnnuityPayout,
  calculatePayoutDuration,
  PaymentFrequency,
} from '../annuityCalculations';

describe('Annuity Payout Calculator', () => {
  describe('Fixed Length Annuity Calculations', () => {
    test('should calculate monthly payout for $500,000 over 10 years at 5%', () => {
      const result = calculateAnnuityPayout({
        principal: 500000,
        annualRate: 5,
        years: 10,
        frequency: 'monthly' as PaymentFrequency,
      });

      // Based on standard annuity formula
      expect(result.payoutAmount).toBeCloseTo(5303.28, 2);
      expect(result.totalPayments).toBe(120);
      expect(result.totalPayout).toBeCloseTo(636393.09, 2);
      expect(result.totalInterest).toBeCloseTo(136393.09, 2);
    });

    test('should calculate annual payout for $1,000,000 over 20 years at 3%', () => {
      const result = calculateAnnuityPayout({
        principal: 1000000,
        annualRate: 3,
        years: 20,
        frequency: 'annually' as PaymentFrequency,
      });

      // Annual payment should be approximately $67,215.71
      expect(result.payoutAmount).toBeCloseTo(67215.71, 2);
      expect(result.totalPayments).toBe(20);
      expect(result.totalPayout).toBeCloseTo(1344314.15, 2);
      expect(result.totalInterest).toBeCloseTo(344314.15, 2);
    });

    test('should calculate quarterly payout for $250,000 over 15 years at 6%', () => {
      const result = calculateAnnuityPayout({
        principal: 250000,
        annualRate: 6,
        years: 15,
        frequency: 'quarterly' as PaymentFrequency,
      });

      // Quarterly payment should be approximately $6,348.36
      expect(result.payoutAmount).toBeCloseTo(6348.36, 2);
      expect(result.totalPayments).toBe(60);
      expect(result.totalPayout).toBeCloseTo(380901.41, 2);
      expect(result.totalInterest).toBeCloseTo(130901.41, 2);
    });

    test('should calculate semiannual payout for $750,000 over 25 years at 4.5%', () => {
      const result = calculateAnnuityPayout({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'semiannually' as PaymentFrequency,
      });

      // Semiannual payment should be approximately $25,138.77
      expect(result.payoutAmount).toBeCloseTo(25138.77, 2);
      expect(result.totalPayments).toBe(50);
    });

    test('should calculate biweekly payout for $100,000 over 5 years at 3.5%', () => {
      const result = calculateAnnuityPayout({
        principal: 100000,
        annualRate: 3.5,
        years: 5,
        frequency: 'biweekly' as PaymentFrequency,
      });

      // Biweekly payment (26 payments per year)
      expect(result.payoutAmount).toBeCloseTo(839.02, 2);
      expect(result.totalPayments).toBe(130);
    });

    test('should handle edge case: 0% interest rate', () => {
      const result = calculateAnnuityPayout({
        principal: 120000,
        annualRate: 0,
        years: 10,
        frequency: 'monthly' as PaymentFrequency,
      });

      // With 0% interest, monthly payment should be principal/total_payments
      expect(result.payoutAmount).toBeCloseTo(1000, 2);
      expect(result.totalPayments).toBe(120);
      expect(result.totalPayout).toBeCloseTo(120000, 2);
      expect(result.totalInterest).toBeCloseTo(0, 2);
    });

    test('should handle very high interest rates', () => {
      const result = calculateAnnuityPayout({
        principal: 50000,
        annualRate: 15,
        years: 5,
        frequency: 'monthly' as PaymentFrequency,
      });

      // High interest rate should result in higher payments
      expect(result.payoutAmount).toBeCloseTo(1189.5, 2);
      expect(result.totalPayments).toBe(60);
    });
  });

  describe('Fixed Payment Annuity Duration Calculations', () => {
    test('should calculate duration for $500,000 with $5,000 monthly payment at 5%', () => {
      const result = calculatePayoutDuration({
        principal: 500000,
        annualRate: 5,
        payoutAmount: 5000,
        frequency: 'monthly' as PaymentFrequency,
      });

      // Should last approximately 10.8 years
      expect(result.years).toBeCloseTo(10.8, 1);
      expect(result.totalPayments).toBeCloseTo(130, 0);
      expect(result.totalPayout).toBeCloseTo(650000, -3);
    });

    test('should calculate duration for $1,000,000 with $10,000 monthly payment at 3%', () => {
      const result = calculatePayoutDuration({
        principal: 1000000,
        annualRate: 3,
        payoutAmount: 10000,
        frequency: 'monthly' as PaymentFrequency,
      });

      // Should last approximately 9.6 years
      expect(result.years).toBeCloseTo(9.6, 1);
      expect(result.totalPayments).toBeCloseTo(116, 0);
    });

    test('should handle payment amount equal to interest earned', () => {
      // $100,000 at 6% annually = $6,000 interest per year = $500 per month
      const result = calculatePayoutDuration({
        principal: 100000,
        annualRate: 6,
        payoutAmount: 500,
        frequency: 'monthly' as PaymentFrequency,
      });

      // Should indicate infinite duration (or very long)
      expect(result.years).toBeGreaterThan(100);
    });

    test('should handle payment amount less than interest earned', () => {
      const result = calculatePayoutDuration({
        principal: 100000,
        annualRate: 10,
        payoutAmount: 500,
        frequency: 'monthly' as PaymentFrequency,
      });

      // Should indicate the annuity will grow, not deplete
      expect(result.willGrow).toBe(true);
    });
  });

  describe('Amortization Schedule Generation', () => {
    test('should generate correct amortization schedule for simple case', () => {
      const schedule = generateAmortizationSchedule({
        principal: 100000,
        annualRate: 5,
        years: 3,
        frequency: 'annually' as PaymentFrequency,
      });

      expect(schedule).toHaveLength(3);

      // Year 1
      expect(schedule[0].year).toBe(1);
      expect(schedule[0].beginningBalance).toBeCloseTo(100000, 2);
      expect(schedule[0].interest).toBeCloseTo(5000, 2);

      // Year 3 should have ending balance close to 0
      expect(schedule[2].endingBalance).toBeCloseTo(0, 2);
    });

    test('should generate monthly amortization schedule', () => {
      const schedule = generateAmortizationSchedule({
        principal: 50000,
        annualRate: 6,
        years: 2,
        frequency: 'monthly' as PaymentFrequency,
      });

      // Should generate yearly summary even for monthly payments
      expect(schedule).toHaveLength(2);

      // Check that balance decreases over time
      expect(schedule[0].endingBalance).toBeLessThan(
        schedule[0].beginningBalance
      );
      expect(schedule[1].endingBalance).toBeCloseTo(0, 2);
    });
  });

  describe('Payment Frequency Calculations', () => {
    const testFrequencies: Array<[PaymentFrequency, number]> = [
      ['annually', 1],
      ['semiannually', 2],
      ['quarterly', 4],
      ['monthly', 12],
      ['semimonthly', 24],
      ['biweekly', 26],
    ];

    test.each(testFrequencies)(
      'should calculate correct payment for %s frequency',
      (frequency, paymentsPerYear) => {
        const principal = 100000;
        const annualRate = 5;
        const years = 10;

        const result = calculateAnnuityPayout({
          principal,
          annualRate,
          years,
          frequency,
        });

        expect(result.totalPayments).toBe(years * paymentsPerYear);
        expect(result.payoutAmount).toBeGreaterThan(0);
        expect(result.totalPayout).toBeGreaterThan(principal);
      }
    );
  });

  describe('Edge Cases and Validation', () => {
    test('should handle very short duration (1 year)', () => {
      const result = calculateAnnuityPayout({
        principal: 12000,
        annualRate: 5,
        years: 1,
        frequency: 'monthly' as PaymentFrequency,
      });

      expect(result.totalPayments).toBe(12);
      expect(result.payoutAmount).toBeCloseTo(1027.29, 2);
    });

    test('should handle very long duration (50 years)', () => {
      const result = calculateAnnuityPayout({
        principal: 1000000,
        annualRate: 4,
        years: 50,
        frequency: 'annually' as PaymentFrequency,
      });

      expect(result.totalPayments).toBe(50);
      expect(result.payoutAmount).toBeGreaterThan(40000);
    });

    test('should handle fractional interest rates', () => {
      const result = calculateAnnuityPayout({
        principal: 250000,
        annualRate: 3.75,
        years: 15,
        frequency: 'monthly' as PaymentFrequency,
      });

      expect(result.payoutAmount).toBeCloseTo(1818.06, 2);
      expect(result.totalPayments).toBe(180);
    });

    test('should handle very small principal amounts', () => {
      const result = calculateAnnuityPayout({
        principal: 1000,
        annualRate: 5,
        years: 2,
        frequency: 'monthly' as PaymentFrequency,
      });

      expect(result.payoutAmount).toBeCloseTo(43.87, 2);
      expect(result.totalPayments).toBe(24);
    });

    test('should handle very large principal amounts', () => {
      const result = calculateAnnuityPayout({
        principal: 10000000,
        annualRate: 5,
        years: 30,
        frequency: 'annually' as PaymentFrequency,
      });

      expect(result.totalPayments).toBe(30);
      expect(result.payoutAmount).toBeGreaterThan(500000);
    });
  });
});
