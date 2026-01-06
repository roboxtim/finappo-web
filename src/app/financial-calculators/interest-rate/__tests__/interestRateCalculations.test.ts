import { describe, it, expect } from 'vitest';
import {
  calculateInterestRate,
  verifyInterestRate,
  type InterestRateInputs,
} from './interestRateCalculations';

describe('Interest Rate Calculator', () => {
  /**
   * Test Case 1: Standard Auto Loan
   * Loan: $10,000 over 12 months with $850 monthly payment
   * Expected: ~2.97% APR (calculated using standard loan formulas)
   */
  it('calculates interest rate for 12-month $10,000 loan with $850 payment', () => {
    const inputs: InterestRateInputs = {
      loanAmount: 10000,
      loanTermMonths: 12,
      monthlyPayment: 850,
    };

    const result = calculateInterestRate(inputs);

    // Verify the calculated rate is reasonable
    expect(result.annualInterestRate).toBeGreaterThan(0);
    expect(result.annualInterestRate).toBeLessThan(10);

    // Verify total payment
    expect(result.totalPayment).toBe(850 * 12);
    expect(result.totalPayment).toBe(10200);

    // Verify total interest
    expect(result.totalInterest).toBe(200);

    // Verify by calculating payment with the found rate
    const verifiedPayment = verifyInterestRate(
      10000,
      result.annualInterestRate,
      12
    );
    expect(Math.abs(verifiedPayment - 850)).toBeLessThan(0.01);

    // Expected APR should be around 3.67%
    expect(result.annualInterestRate).toBeGreaterThan(3.6);
    expect(result.annualInterestRate).toBeLessThan(3.8);
  });

  /**
   * Test Case 2: Personal Loan
   * Loan: $25,000 over 60 months with $475 monthly payment
   * Expected: ~5.06% APR
   */
  it('calculates interest rate for 60-month $25,000 loan with $475 payment', () => {
    const inputs: InterestRateInputs = {
      loanAmount: 25000,
      loanTermMonths: 60,
      monthlyPayment: 475,
    };

    const result = calculateInterestRate(inputs);

    // Verify the calculated rate is reasonable
    expect(result.annualInterestRate).toBeGreaterThan(0);
    expect(result.annualInterestRate).toBeLessThan(15);

    // Verify total payment
    expect(result.totalPayment).toBe(475 * 60);
    expect(result.totalPayment).toBe(28500);

    // Verify total interest
    expect(result.totalInterest).toBe(3500);

    // Verify by calculating payment with the found rate
    const verifiedPayment = verifyInterestRate(
      25000,
      result.annualInterestRate,
      60
    );
    expect(Math.abs(verifiedPayment - 475)).toBeLessThan(0.01);

    // Expected APR should be around 5.28%
    expect(result.annualInterestRate).toBeGreaterThan(5.2);
    expect(result.annualInterestRate).toBeLessThan(5.4);
  });

  /**
   * Test Case 3: Long-term Loan
   * Loan: $50,000 over 120 months with $555 monthly payment
   * Expected: ~5.07% APR
   */
  it('calculates interest rate for 120-month $50,000 loan with $555 payment', () => {
    const inputs: InterestRateInputs = {
      loanAmount: 50000,
      loanTermMonths: 120,
      monthlyPayment: 555,
    };

    const result = calculateInterestRate(inputs);

    // Verify the calculated rate is reasonable
    expect(result.annualInterestRate).toBeGreaterThan(0);
    expect(result.annualInterestRate).toBeLessThan(15);

    // Verify total payment
    expect(result.totalPayment).toBe(555 * 120);
    expect(result.totalPayment).toBe(66600);

    // Verify total interest
    expect(result.totalInterest).toBe(16600);

    // Verify by calculating payment with the found rate
    const verifiedPayment = verifyInterestRate(
      50000,
      result.annualInterestRate,
      120
    );
    expect(Math.abs(verifiedPayment - 555)).toBeLessThan(0.01);

    // Expected APR should be around 5.99%
    expect(result.annualInterestRate).toBeGreaterThan(5.9);
    expect(result.annualInterestRate).toBeLessThan(6.1);
  });

  /**
   * Test Case 4: Short-term Loan
   * Loan: $5,000 over 24 months with $220 monthly payment
   * Expected: ~2.48% APR
   */
  it('calculates interest rate for 24-month $5,000 loan with $220 payment', () => {
    const inputs: InterestRateInputs = {
      loanAmount: 5000,
      loanTermMonths: 24,
      monthlyPayment: 220,
    };

    const result = calculateInterestRate(inputs);

    // Verify the calculated rate is reasonable
    expect(result.annualInterestRate).toBeGreaterThan(0);
    expect(result.annualInterestRate).toBeLessThan(10);

    // Verify total payment
    expect(result.totalPayment).toBe(220 * 24);
    expect(result.totalPayment).toBe(5280);

    // Verify total interest
    expect(result.totalInterest).toBe(280);

    // Verify by calculating payment with the found rate
    const verifiedPayment = verifyInterestRate(
      5000,
      result.annualInterestRate,
      24
    );
    expect(Math.abs(verifiedPayment - 220)).toBeLessThan(0.01);

    // Expected APR should be around 5.29%
    expect(result.annualInterestRate).toBeGreaterThan(5.2);
    expect(result.annualInterestRate).toBeLessThan(5.4);
  });

  /**
   * Test Case 5: Mortgage Simulation
   * Loan: $100,000 over 360 months with $600 monthly payment
   * Expected: ~6.91% APR
   */
  it('calculates interest rate for 360-month $100,000 loan with $600 payment', () => {
    const inputs: InterestRateInputs = {
      loanAmount: 100000,
      loanTermMonths: 360,
      monthlyPayment: 600,
    };

    const result = calculateInterestRate(inputs);

    // Verify the calculated rate is reasonable
    expect(result.annualInterestRate).toBeGreaterThan(0);
    expect(result.annualInterestRate).toBeLessThan(20);

    // Verify total payment
    expect(result.totalPayment).toBe(600 * 360);
    expect(result.totalPayment).toBe(216000);

    // Verify total interest
    expect(result.totalInterest).toBe(116000);

    // Verify by calculating payment with the found rate
    const verifiedPayment = verifyInterestRate(
      100000,
      result.annualInterestRate,
      360
    );
    expect(Math.abs(verifiedPayment - 600)).toBeLessThan(0.01);

    // Expected APR should be around 6.01%
    expect(result.annualInterestRate).toBeGreaterThan(5.9);
    expect(result.annualInterestRate).toBeLessThan(6.1);
  });

  /**
   * Test Case 6: Zero Interest Rate
   * When payment exactly equals principal/months, rate should be 0%
   */
  it('calculates 0% rate when payment equals principal divided by months', () => {
    const inputs: InterestRateInputs = {
      loanAmount: 12000,
      loanTermMonths: 12,
      monthlyPayment: 1000, // Exactly 12000/12
    };

    const result = calculateInterestRate(inputs);

    // Should be very close to 0%
    expect(result.annualInterestRate).toBeLessThan(0.01);
    expect(result.totalPayment).toBe(12000);
    expect(result.totalInterest).toBe(0);
  });

  /**
   * Test Case 7: High Interest Rate
   * Loan: $10,000 over 24 months with $500 monthly payment (high payment)
   * Expected: ~12.9% APR
   */
  it('calculates high interest rate for expensive loan', () => {
    const inputs: InterestRateInputs = {
      loanAmount: 10000,
      loanTermMonths: 24,
      monthlyPayment: 500,
    };

    const result = calculateInterestRate(inputs);

    // Verify the calculated rate is reasonable for high interest
    expect(result.annualInterestRate).toBeGreaterThan(18);
    expect(result.annualInterestRate).toBeLessThan(18.5);

    // Verify total payment
    expect(result.totalPayment).toBe(12000);

    // Verify total interest
    expect(result.totalInterest).toBe(2000);

    // Verify by calculating payment with the found rate
    const verifiedPayment = verifyInterestRate(
      10000,
      result.annualInterestRate,
      24
    );
    expect(Math.abs(verifiedPayment - 500)).toBeLessThan(0.01);
  });

  /**
   * Test Case 8: Reference Example from Calculator.net
   * Loan: $32,000 over 36 months with ~$960 monthly payment
   * Expected: 5.065% APR (as shown on reference site)
   */
  it('matches reference calculator example from calculator.net', () => {
    // Working backwards from the reference: 5.065% rate should give us the payment
    // First, let's find what payment gives us 5.065%
    const referenceRate = 5.065;
    const referencePayment = verifyInterestRate(32000, referenceRate, 36);

    const inputs: InterestRateInputs = {
      loanAmount: 32000,
      loanTermMonths: 36,
      monthlyPayment: referencePayment,
    };

    const result = calculateInterestRate(inputs);

    // Should match the reference rate very closely
    expect(Math.abs(result.annualInterestRate - referenceRate)).toBeLessThan(
      0.01
    );

    // Verify total interest matches reference ($2,560)
    expect(Math.abs(result.totalInterest - 2560)).toBeLessThan(1);
  });

  /**
   * Test Case 9: Edge Case - Very Low Payment (should throw error)
   */
  it('throws error when monthly payment is too low', () => {
    const inputs: InterestRateInputs = {
      loanAmount: 10000,
      loanTermMonths: 12,
      monthlyPayment: 500, // Too low to pay off in 12 months
    };

    expect(() => calculateInterestRate(inputs)).toThrow(
      'Monthly payment is too low'
    );
  });

  /**
   * Test Case 10: Edge Case - Invalid Inputs
   */
  it('throws error for invalid inputs', () => {
    expect(() =>
      calculateInterestRate({
        loanAmount: -1000,
        loanTermMonths: 12,
        monthlyPayment: 100,
      })
    ).toThrow('All inputs must be positive numbers');

    expect(() =>
      calculateInterestRate({
        loanAmount: 1000,
        loanTermMonths: 0,
        monthlyPayment: 100,
      })
    ).toThrow('All inputs must be positive numbers');

    expect(() =>
      calculateInterestRate({
        loanAmount: 1000,
        loanTermMonths: 12,
        monthlyPayment: 0,
      })
    ).toThrow('All inputs must be positive numbers');
  });

  /**
   * Test Case 11: Precision Test
   * Ensure the calculated rate produces the exact payment amount
   */
  it('produces precise results that verify correctly', () => {
    const testCases = [
      { loan: 15000, months: 36, payment: 450 },
      { loan: 20000, months: 48, payment: 475 },
      { loan: 8000, months: 24, payment: 350 },
      { loan: 75000, months: 180, payment: 650 },
    ];

    testCases.forEach(({ loan, months, payment }) => {
      const result = calculateInterestRate({
        loanAmount: loan,
        loanTermMonths: months,
        monthlyPayment: payment,
      });

      // Verify the rate produces the correct payment
      const verifiedPayment = verifyInterestRate(
        loan,
        result.annualInterestRate,
        months
      );

      expect(Math.abs(verifiedPayment - payment)).toBeLessThan(0.01);
    });
  });
});
