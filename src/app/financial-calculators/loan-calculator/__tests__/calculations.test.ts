import {
  calculateLoanPayment,
  calculateAmortizationSchedule,
  validateLoanInputs,
  formatCurrency,
  formatPercentage,
  type LoanInputs,
} from '../calculations';

describe('Loan Calculator - Validation', () => {
  it('should validate correct inputs', () => {
    const inputs: LoanInputs = {
      loanAmount: 100000,
      interestRate: 5,
      loanTermYears: 10,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const errors = validateLoanInputs(inputs);
    expect(errors).toHaveLength(0);
  });

  it('should reject negative loan amount', () => {
    const inputs: LoanInputs = {
      loanAmount: -100000,
      interestRate: 5,
      loanTermYears: 10,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const errors = validateLoanInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Loan amount must be greater than 0');
  });

  it('should reject invalid interest rate', () => {
    const inputs: LoanInputs = {
      loanAmount: 100000,
      interestRate: -5,
      loanTermYears: 10,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const errors = validateLoanInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Interest rate must be between 0 and 100');
  });

  it('should reject zero loan term', () => {
    const inputs: LoanInputs = {
      loanAmount: 100000,
      interestRate: 5,
      loanTermYears: 0,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const errors = validateLoanInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Loan term must be greater than 0');
  });
});

describe('Loan Calculator - Monthly Payment Calculation', () => {
  it('Test Case 1: $100,000 at 5% for 10 years', () => {
    const inputs: LoanInputs = {
      loanAmount: 100000,
      interestRate: 5,
      loanTermYears: 10,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const results = calculateLoanPayment(inputs);

    // Expected from calculator.net: Monthly Payment = $1,060.66
    expect(results.monthlyPayment).toBeCloseTo(1060.66, 2);
    // Expected Total Payments = $127,278.62
    expect(results.totalPayment).toBeCloseTo(127278.62, 2);
    // Expected Total Interest = $27,278.62
    expect(results.totalInterest).toBeCloseTo(27278.62, 2);
    // Loan term in months
    expect(results.numberOfPayments).toBe(120);
  });

  it('Test Case 2: $250,000 at 3.5% for 30 years', () => {
    const inputs: LoanInputs = {
      loanAmount: 250000,
      interestRate: 3.5,
      loanTermYears: 30,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const results = calculateLoanPayment(inputs);

    // Expected from calculator.net: Monthly Payment = $1,122.61
    expect(results.monthlyPayment).toBeCloseTo(1122.61, 2);
    // Expected Total Payments = $404,140.22
    expect(results.totalPayment).toBeCloseTo(404140.22, 2);
    // Expected Total Interest = $154,140.22
    expect(results.totalInterest).toBeCloseTo(154140.22, 2);
    // Loan term in months
    expect(results.numberOfPayments).toBe(360);
  });

  it('Test Case 3: $50,000 at 6% for 5 years', () => {
    const inputs: LoanInputs = {
      loanAmount: 50000,
      interestRate: 6,
      loanTermYears: 5,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const results = calculateLoanPayment(inputs);

    // Expected from calculator.net: Monthly Payment = $966.64
    expect(results.monthlyPayment).toBeCloseTo(966.64, 2);
    // Expected Total Payments = $57,998.40
    expect(results.totalPayment).toBeCloseTo(57998.4, 2);
    // Expected Total Interest = $7,998.40
    expect(results.totalInterest).toBeCloseTo(7998.4, 2);
    // Loan term in months
    expect(results.numberOfPayments).toBe(60);
  });

  it('Test Case 4: $20,000 at 4.5% for 3 years 6 months', () => {
    const inputs: LoanInputs = {
      loanAmount: 20000,
      interestRate: 4.5,
      loanTermYears: 3,
      loanTermMonths: 6,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const results = calculateLoanPayment(inputs);

    // Expected from calculator.net: Monthly Payment = $515.56
    expect(results.monthlyPayment).toBeCloseTo(515.56, 2);
    // Expected Total Payments = $21,653.73
    expect(results.totalPayment).toBeCloseTo(21653.73, 2);
    // Expected Total Interest = $1,653.73
    expect(results.totalInterest).toBeCloseTo(1653.73, 2);
    // Loan term in months
    expect(results.numberOfPayments).toBe(42);
  });

  it('Test Case 5: Edge case - $1,000 at 12% for 1 year', () => {
    const inputs: LoanInputs = {
      loanAmount: 1000,
      interestRate: 12,
      loanTermYears: 1,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const results = calculateLoanPayment(inputs);

    // Calculate expected values using loan formula
    // M = P[r(1+r)^n]/[(1+r)^n-1]
    // r = 0.12 / 12 = 0.01
    // n = 12
    // M = 1000[0.01(1.01)^12]/[(1.01)^12-1] = 88.85
    expect(results.monthlyPayment).toBeCloseTo(88.85, 2);
    expect(results.numberOfPayments).toBe(12);
    expect(results.totalPayment).toBeCloseTo(1066.18, 1);
    expect(results.totalInterest).toBeCloseTo(66.18, 1);
  });

  it('Test Case 6: Edge case - Zero interest rate', () => {
    const inputs: LoanInputs = {
      loanAmount: 10000,
      interestRate: 0,
      loanTermYears: 2,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const results = calculateLoanPayment(inputs);

    // With 0% interest, payment should be principal / number of payments
    expect(results.monthlyPayment).toBeCloseTo(416.67, 2);
    expect(results.totalPayment).toBeCloseTo(10000, 2);
    expect(results.totalInterest).toBeCloseTo(0, 2);
  });

  it('Test Case 7: Large loan - $1,000,000 at 4% for 20 years', () => {
    const inputs: LoanInputs = {
      loanAmount: 1000000,
      interestRate: 4,
      loanTermYears: 20,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const results = calculateLoanPayment(inputs);

    // Verify reasonable results
    expect(results.monthlyPayment).toBeGreaterThan(6000);
    expect(results.monthlyPayment).toBeLessThan(7000);
    expect(results.numberOfPayments).toBe(240);
    expect(results.totalInterest).toBeGreaterThan(450000);
  });
});

describe('Loan Calculator - Amortization Schedule', () => {
  it('should generate correct amortization schedule', () => {
    const inputs: LoanInputs = {
      loanAmount: 10000,
      interestRate: 6,
      loanTermYears: 1,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const schedule = calculateAmortizationSchedule(inputs);

    // Should have 12 payments
    expect(schedule).toHaveLength(12);

    // First payment
    expect(schedule[0].paymentNumber).toBe(1);
    expect(schedule[0].principalPayment).toBeGreaterThan(0);
    expect(schedule[0].interestPayment).toBeGreaterThan(0);
    expect(schedule[0].balance).toBeLessThan(10000);

    // Last payment
    expect(schedule[11].paymentNumber).toBe(12);
    expect(schedule[11].balance).toBeCloseTo(0, 2);

    // Balance should decrease each month
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
    }

    // Interest portion should decrease over time
    expect(schedule[11].interestPayment).toBeLessThan(
      schedule[0].interestPayment
    );
  });

  it('should handle extra monthly payments correctly', () => {
    const inputs: LoanInputs = {
      loanAmount: 10000,
      interestRate: 6,
      loanTermYears: 1,
      loanTermMonths: 0,
      startDate: new Date('2025-01-15'),
      paymentFrequency: 'monthly',
      extraPaymentAmount: 100,
      extraPaymentFrequency: 'monthly',
      oneTimePayment: 0,
      oneTimePaymentDate: null,
    };

    const scheduleWithExtra = calculateAmortizationSchedule(inputs);

    const inputsNoExtra: LoanInputs = {
      ...inputs,
      extraPaymentAmount: 0,
      extraPaymentFrequency: 'none',
    };
    const scheduleNoExtra = calculateAmortizationSchedule(inputsNoExtra);

    // With extra payments, should pay off earlier
    expect(scheduleWithExtra.length).toBeLessThan(scheduleNoExtra.length);

    // Total interest should be less with extra payments
    const totalInterestWithExtra = scheduleWithExtra.reduce(
      (sum, payment) => sum + payment.interestPayment,
      0
    );
    const totalInterestNoExtra = scheduleNoExtra.reduce(
      (sum, payment) => sum + payment.interestPayment,
      0
    );
    expect(totalInterestWithExtra).toBeLessThan(totalInterestNoExtra);
  });
});

describe('Utility Functions', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(99.9)).toBe('$99.90');
  });

  it('should format percentage correctly', () => {
    expect(formatPercentage(0.05, 2)).toBe('5.00%');
    expect(formatPercentage(0.125, 1)).toBe('12.5%');
    expect(formatPercentage(1.0, 0)).toBe('100%');
  });
});
