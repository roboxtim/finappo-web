/**
 * Payback Period Calculator Tests
 *
 * Comprehensive test suite for Payback Period calculations covering both
 * simple (undiscounted) and discounted payback period methods.
 *
 * Test categories:
 * 1. Simple payback period with even cash flows
 * 2. Simple payback period with uneven cash flows
 * 3. Discounted payback period calculations
 * 4. Edge cases (no payback, immediate payback, zero flows)
 * 5. Monthly vs annual cash flows
 * 6. Multiple metrics (ROI, NPV) for comparison
 * 7. Cumulative cash flow tracking
 * 8. Input validation
 *
 * Test data verified against: https://www.calculator.net/payback-period-calculator.html
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCumulativeCashFlows,
  calculatePaybackResults,
  validatePaybackInputs,
  calculateROI,
  calculateNPV,
  type CashFlow,
  type PaybackInputs,
} from './paybackCalculations';

describe('Simple Payback Period - Even Cash Flows', () => {
  it('Test 1: Classic example - $100 investment, $20 annual returns', () => {
    // Reference calculator example: 5 years
    const inputs: PaybackInputs = {
      initialInvestment: 100,
      cashFlows: [
        { period: 1, amount: 20, label: 'Year 1' },
        { period: 2, amount: 20, label: 'Year 2' },
        { period: 3, amount: 20, label: 'Year 3' },
        { period: 4, amount: 20, label: 'Year 4' },
        { period: 5, amount: 20, label: 'Year 5' },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBe(5);
    expect(results.simplePaybackYears).toBe(5);
    expect(results.simplePaybackMonths).toBe(0);
    expect(results.totalCashInflows).toBe(100);
    expect(results.profitAfterPayback).toBe(0);
  });

  it('Test 2: $10,000 investment, $3,000 annual returns', () => {
    // Payback: 3.33 years (3 years 4 months)
    const inputs: PaybackInputs = {
      initialInvestment: 10000,
      cashFlows: [
        { period: 1, amount: 3000 },
        { period: 2, amount: 3000 },
        { period: 3, amount: 3000 },
        { period: 4, amount: 3000 },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(3.33, 2);
    expect(results.simplePaybackYears).toBe(3);
    expect(results.simplePaybackMonths).toBe(4);
  });

  it('Test 3: $50,000 investment, $15,000 annual returns', () => {
    // Payback: 3.33 years
    const inputs: PaybackInputs = {
      initialInvestment: 50000,
      cashFlows: [
        { period: 1, amount: 15000 },
        { period: 2, amount: 15000 },
        { period: 3, amount: 15000 },
        { period: 4, amount: 15000 },
        { period: 5, amount: 15000 },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(3.33, 2);
    expect(results.totalCashInflows).toBe(75000);
  });

  it('Test 4: Fractional payback period', () => {
    // $100,000 investment, $45,000 annual returns
    // Payback: 2.22 years (2 years 3 months)
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 45000 },
        { period: 2, amount: 45000 },
        { period: 3, amount: 45000 },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(2.22, 2);
    expect(results.simplePaybackYears).toBe(2);
    expect(results.simplePaybackMonths).toBe(3);
  });
});

describe('Simple Payback Period - Uneven Cash Flows', () => {
  it('Test 5: Increasing cash flows', () => {
    // $100,000 investment with increasing returns
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 20000, label: 'Year 1' },
        { period: 2, amount: 30000, label: 'Year 2' },
        { period: 3, amount: 40000, label: 'Year 3' },
        { period: 4, amount: 50000, label: 'Year 4' },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    // Cumulative: 20k, 50k, 90k, 140k - pays back during year 3
    expect(results.simplePaybackPeriod).toBeCloseTo(3.2, 1);
    expect(results.simplePaybackYears).toBe(3);
    expect(results.simplePaybackMonths).toBeGreaterThanOrEqual(2);
  });

  it('Test 6: Decreasing cash flows', () => {
    // $100,000 investment with decreasing returns
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 50000 },
        { period: 2, amount: 30000 },
        { period: 3, amount: 20000 },
        { period: 4, amount: 10000 },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    // Cumulative: 50k, 80k, 100k - pays back exactly in year 3
    expect(results.simplePaybackPeriod).toBe(3);
    expect(results.simplePaybackYears).toBe(3);
    expect(results.simplePaybackMonths).toBe(0);
  });

  it('Test 7: Irregular cash flows', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 200000,
      cashFlows: [
        { period: 1, amount: 30000 },
        { period: 2, amount: 60000 },
        { period: 3, amount: 45000 },
        { period: 4, amount: 80000 },
        { period: 5, amount: 50000 },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    // Cumulative: 30k, 90k, 135k, 215k - pays back in year 4
    expect(results.simplePaybackPeriod).toBeCloseTo(3.81, 2);
    expect(results.simplePaybackYears).toBe(3);
    expect(results.simplePaybackMonths).toBe(10);
  });

  it('Test 8: Real estate investment scenario', () => {
    // Property investment with rental income
    const inputs: PaybackInputs = {
      initialInvestment: 500000,
      cashFlows: [
        { period: 1, amount: 24000, label: 'Year 1 Rent' },
        { period: 2, amount: 24000, label: 'Year 2 Rent' },
        { period: 3, amount: 24000, label: 'Year 3 Rent' },
        { period: 4, amount: 24000, label: 'Year 4 Rent' },
        { period: 5, amount: 24000, label: 'Year 5 Rent' },
        { period: 6, amount: 24000, label: 'Year 6 Rent' },
        { period: 7, amount: 24000, label: 'Year 7 Rent' },
        { period: 8, amount: 24000, label: 'Year 8 Rent' },
        { period: 9, amount: 24000, label: 'Year 9 Rent' },
        { period: 10, amount: 524000, label: 'Year 10 Rent + Sale' },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    // Cumulative: 24k*9 = 216k, then 740k in year 10
    expect(results.simplePaybackPeriod).toBeCloseTo(9.54, 2);
    expect(results.totalCashInflows).toBe(740000);
  });
});

describe('Discounted Payback Period', () => {
  it('Test 9: Classic example with 10% discount rate', () => {
    // $100 investment, $20 annual returns, 10% discount
    // Reference calculator: 7.27 years
    const inputs: PaybackInputs = {
      initialInvestment: 100,
      cashFlows: [
        { period: 1, amount: 20 },
        { period: 2, amount: 20 },
        { period: 3, amount: 20 },
        { period: 4, amount: 20 },
        { period: 5, amount: 20 },
        { period: 6, amount: 20 },
        { period: 7, amount: 20 },
        { period: 8, amount: 20 },
      ],
      discountRate: 10,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.discountedPaybackPeriod).toBeCloseTo(7.27, 1);
    expect(results.discountedPaybackYears).toBe(7);
    expect(results.discountedPaybackMonths).toBeGreaterThan(2);
    expect(results.discountedPaybackMonths).toBeLessThan(4);
  });

  it('Test 10: Higher discount rate increases payback period', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 30000 },
        { period: 2, amount: 30000 },
        { period: 3, amount: 30000 },
        { period: 4, amount: 30000 },
        { period: 5, amount: 30000 },
      ],
      discountRate: 15,
    };

    const results = calculatePaybackResults(inputs);

    // Higher discount rate than test 11
    expect(results.discountedPaybackPeriod).toBeGreaterThan(
      results.simplePaybackPeriod
    );
    expect(results.discountedPaybackPeriod).toBeCloseTo(4.96, 1);
  });

  it('Test 11: Low discount rate (5%)', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 30000 },
        { period: 2, amount: 30000 },
        { period: 3, amount: 30000 },
        { period: 4, amount: 30000 },
        { period: 5, amount: 30000 },
      ],
      discountRate: 5,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(3.33, 2);
    expect(results.discountedPaybackPeriod).toBeCloseTo(3.74, 2);
    expect(results.discountedPaybackPeriod).toBeGreaterThan(
      results.simplePaybackPeriod
    );
  });

  it('Test 12: Zero discount rate equals simple payback', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 50000,
      cashFlows: [
        { period: 1, amount: 15000 },
        { period: 2, amount: 20000 },
        { period: 3, amount: 25000 },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(
      results.discountedPaybackPeriod!,
      2
    );
  });

  it('Test 13: Uneven cash flows with discount', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 200000,
      cashFlows: [
        { period: 1, amount: 40000 },
        { period: 2, amount: 60000 },
        { period: 3, amount: 80000 },
        { period: 4, amount: 70000 },
        { period: 5, amount: 50000 },
      ],
      discountRate: 12,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeLessThan(
      results.discountedPaybackPeriod!
    );
    expect(results.discountedPaybackPeriod).toBeCloseTo(4.53, 2);
  });
});

describe('Edge Cases', () => {
  it('Test 14: Never pays back (insufficient cash flows)', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 10000 },
        { period: 2, amount: 10000 },
        { period: 3, amount: 10000 },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeNull();
    expect(results.simplePaybackYears).toBeNull();
    expect(results.simplePaybackMonths).toBeNull();
    expect(results.paysBack).toBe(false);
  });

  it('Test 15: Never pays back with discounting', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 15000 },
        { period: 2, amount: 15000 },
        { period: 3, amount: 15000 },
        { period: 4, amount: 15000 },
        { period: 5, amount: 15000 },
      ],
      discountRate: 20, // High discount rate
    };

    const results = calculatePaybackResults(inputs);

    // This actually doesn't pay back even in simple terms with only 75k total
    expect(results.paysBack).toBe(false);
    expect(results.discountedPaybackPeriod).toBeNull();
    expect(results.discountedPaysBack).toBe(false);
  });

  it('Test 16: Immediate payback (first period)', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 50000,
      cashFlows: [
        { period: 1, amount: 75000 },
        { period: 2, amount: 20000 },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(0.67, 2);
    expect(results.simplePaybackYears).toBe(0);
    expect(results.simplePaybackMonths).toBe(8);
  });

  it('Test 17: Exact payback at period end', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 25000 },
        { period: 2, amount: 25000 },
        { period: 3, amount: 25000 },
        { period: 4, amount: 25000 },
      ],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBe(4);
    expect(results.simplePaybackYears).toBe(4);
    expect(results.simplePaybackMonths).toBe(0);
  });

  it('Test 18: Very small investment', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100,
      cashFlows: [
        { period: 1, amount: 30 },
        { period: 2, amount: 30 },
        { period: 3, amount: 30 },
        { period: 4, amount: 30 },
      ],
      discountRate: 5,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(3.33, 2);
    expect(results.paysBack).toBe(true);
  });

  it('Test 19: Very large investment', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 10000000,
      cashFlows: [
        { period: 1, amount: 2000000 },
        { period: 2, amount: 2500000 },
        { period: 3, amount: 3000000 },
        { period: 4, amount: 3500000 },
      ],
      discountRate: 8,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(3.71, 2);
    expect(results.totalCashInflows).toBe(11000000);
  });

  it('Test 20: Single large cash flow', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 1000000,
      cashFlows: [{ period: 1, amount: 1500000 }],
      discountRate: 0,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(0.67, 2);
    expect(results.profitAfterPayback).toBe(500000);
  });
});

describe('Monthly vs Annual Periods', () => {
  it('Test 21: Monthly cash flows', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 12000,
      cashFlows: [
        { period: 1, amount: 1000, label: 'Month 1' },
        { period: 2, amount: 1000, label: 'Month 2' },
        { period: 3, amount: 1000, label: 'Month 3' },
        { period: 4, amount: 1000, label: 'Month 4' },
        { period: 5, amount: 1000, label: 'Month 5' },
        { period: 6, amount: 1000, label: 'Month 6' },
        { period: 7, amount: 1000, label: 'Month 7' },
        { period: 8, amount: 1000, label: 'Month 8' },
        { period: 9, amount: 1000, label: 'Month 9' },
        { period: 10, amount: 1000, label: 'Month 10' },
        { period: 11, amount: 1000, label: 'Month 11' },
        { period: 12, amount: 1000, label: 'Month 12' },
      ],
      discountRate: 0,
      periodType: 'monthly',
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBe(12);
    expect(results.totalCashInflows).toBe(12000);
  });

  it('Test 22: Annual conversion to months', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 36000,
      cashFlows: [
        { period: 1, amount: 12000, label: 'Year 1' },
        { period: 2, amount: 12000, label: 'Year 2' },
        { period: 3, amount: 12000, label: 'Year 3' },
      ],
      discountRate: 0,
      periodType: 'annual',
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBe(3);
    expect(results.simplePaybackYears).toBe(3);
    expect(results.simplePaybackMonths).toBe(0);
  });
});

describe('Cumulative Cash Flow Tracking', () => {
  it('Test 23: Cumulative cash flows calculated correctly', () => {
    const cashFlows: CashFlow[] = [
      { period: 1, amount: 10000 },
      { period: 2, amount: 20000 },
      { period: 3, amount: 30000 },
      { period: 4, amount: 40000 },
    ];

    const cumulative = calculateCumulativeCashFlows(cashFlows, 50000, 0);

    expect(cumulative[0].cumulativeCashFlow).toBe(-40000); // 10k - 50k
    expect(cumulative[1].cumulativeCashFlow).toBe(-20000); // 30k - 50k
    expect(cumulative[2].cumulativeCashFlow).toBe(10000); // 60k - 50k
    expect(cumulative[3].cumulativeCashFlow).toBe(50000); // 100k - 50k
  });

  it('Test 24: Discounted cumulative cash flows', () => {
    const cashFlows: CashFlow[] = [
      { period: 1, amount: 10000 },
      { period: 2, amount: 10000 },
      { period: 3, amount: 10000 },
    ];

    const cumulative = calculateCumulativeCashFlows(cashFlows, 25000, 10);

    // Each cash flow discounted at 10%
    expect(cumulative[0].discountedValue).toBeCloseTo(9090.91, 2);
    expect(cumulative[1].discountedValue).toBeCloseTo(8264.46, 2);
    expect(cumulative[2].discountedValue).toBeCloseTo(7513.15, 2);

    expect(cumulative[0].discountedCumulativeCashFlow).toBeCloseTo(
      -15909.09,
      2
    );
    expect(cumulative[1].discountedCumulativeCashFlow).toBeCloseTo(-7644.63, 2);
    expect(cumulative[2].discountedCumulativeCashFlow).toBeCloseTo(-131.48, 2);
  });
});

describe('ROI and NPV Calculations', () => {
  it('Test 25: ROI calculation', () => {
    const initialInvestment = 100000;
    const totalReturns = 150000;

    const roi = calculateROI(initialInvestment, totalReturns);

    expect(roi).toBe(50);
  });

  it('Test 26: Negative ROI', () => {
    const initialInvestment = 100000;
    const totalReturns = 80000;

    const roi = calculateROI(initialInvestment, totalReturns);

    expect(roi).toBe(-20);
  });

  it('Test 27: NPV calculation at discount rate', () => {
    const cashFlows: CashFlow[] = [
      { period: 1, amount: 30000 },
      { period: 2, amount: 40000 },
      { period: 3, amount: 50000 },
    ];
    const initialInvestment = 100000;
    const discountRate = 10;

    const npv = calculateNPV(cashFlows, initialInvestment, discountRate);

    // NPV = -100000 + 30000/1.1 + 40000/1.1^2 + 50000/1.1^3
    // NPV = -100000 + 27272.73 + 33057.85 + 37565.74 = -2103.68
    expect(npv).toBeCloseTo(-2103.68, 2);
  });

  it('Test 28: Positive NPV', () => {
    const cashFlows: CashFlow[] = [
      { period: 1, amount: 40000 },
      { period: 2, amount: 50000 },
      { period: 3, amount: 60000 },
    ];
    const initialInvestment = 100000;
    const discountRate = 8;

    const npv = calculateNPV(cashFlows, initialInvestment, discountRate);

    expect(npv).toBeGreaterThan(0);
    expect(npv).toBeCloseTo(27533.91, 2);
  });

  it('Test 29: NPV at 0% equals simple profit', () => {
    const cashFlows: CashFlow[] = [
      { period: 1, amount: 30000 },
      { period: 2, amount: 40000 },
      { period: 3, amount: 50000 },
    ];
    const initialInvestment = 100000;
    const discountRate = 0;

    const npv = calculateNPV(cashFlows, initialInvestment, discountRate);

    expect(npv).toBe(20000); // 120000 - 100000
  });
});

describe('Input Validation', () => {
  it('Test 30: Valid inputs', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 30000 },
        { period: 2, amount: 40000 },
      ],
      discountRate: 10,
    };

    const errors = validatePaybackInputs(inputs);
    expect(errors.length).toBe(0);
  });

  it('Test 31: Zero initial investment', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 0,
      cashFlows: [{ period: 1, amount: 30000 }],
      discountRate: 0,
    };

    const errors = validatePaybackInputs(inputs);
    expect(errors.some((e) => e.includes('greater than zero'))).toBe(true);
  });

  it('Test 32: Negative initial investment', () => {
    const inputs: PaybackInputs = {
      initialInvestment: -10000,
      cashFlows: [{ period: 1, amount: 30000 }],
      discountRate: 0,
    };

    const errors = validatePaybackInputs(inputs);
    expect(errors.some((e) => e.includes('greater than zero'))).toBe(true);
  });

  it('Test 33: Empty cash flows', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [],
      discountRate: 0,
    };

    const errors = validatePaybackInputs(inputs);
    expect(errors.some((e) => e.includes('At least one'))).toBe(true);
  });

  it('Test 34: Negative cash flow', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 30000 },
        { period: 2, amount: -10000 },
      ],
      discountRate: 0,
    };

    const errors = validatePaybackInputs(inputs);
    expect(
      errors.some((e) => e.includes('greater than or equal to zero'))
    ).toBe(true);
  });

  it('Test 35: Invalid discount rate (negative)', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [{ period: 1, amount: 30000 }],
      discountRate: -5,
    };

    const errors = validatePaybackInputs(inputs);
    expect(errors.some((e) => e.includes('between 0 and 100'))).toBe(true);
  });

  it('Test 36: Invalid discount rate (over 100)', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [{ period: 1, amount: 30000 }],
      discountRate: 150,
    };

    const errors = validatePaybackInputs(inputs);
    expect(errors.some((e) => e.includes('between 0 and 100'))).toBe(true);
  });

  it('Test 37: Duplicate periods', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 100000,
      cashFlows: [
        { period: 1, amount: 30000 },
        { period: 1, amount: 40000 },
      ],
      discountRate: 0,
    };

    const errors = validatePaybackInputs(inputs);
    expect(errors.some((e) => e.includes('unique'))).toBe(true);
  });
});

describe('Complex Scenarios', () => {
  it('Test 38: Business equipment purchase', () => {
    // Equipment cost $80,000, saves $2,000/month
    const inputs: PaybackInputs = {
      initialInvestment: 80000,
      cashFlows: Array.from({ length: 48 }, (_, i) => ({
        period: i + 1,
        amount: 2000,
        label: `Month ${i + 1}`,
      })),
      discountRate: 6, // 6% annual = ~0.5% monthly
      periodType: 'monthly',
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBe(40);
    expect(results.paysBack).toBe(true);
  });

  it('Test 39: Solar panel investment', () => {
    // $25,000 solar panels, $200/month savings for 20 years
    const inputs: PaybackInputs = {
      initialInvestment: 25000,
      cashFlows: Array.from({ length: 240 }, (_, i) => ({
        period: i + 1,
        amount: 200,
      })),
      discountRate: 5,
      periodType: 'monthly',
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBe(125);
    expect(results.simplePaybackYears).toBe(10);
    expect(results.simplePaybackMonths).toBe(5);
  });

  it('Test 40: Startup investment with growing returns', () => {
    const inputs: PaybackInputs = {
      initialInvestment: 500000,
      cashFlows: [
        { period: 1, amount: 50000, label: 'Year 1' },
        { period: 2, amount: 75000, label: 'Year 2' },
        { period: 3, amount: 100000, label: 'Year 3' },
        { period: 4, amount: 150000, label: 'Year 4' },
        { period: 5, amount: 200000, label: 'Year 5' },
      ],
      discountRate: 15,
    };

    const results = calculatePaybackResults(inputs);

    expect(results.simplePaybackPeriod).toBeCloseTo(4.63, 2);
    if (results.discountedPaybackPeriod !== null) {
      expect(results.discountedPaybackPeriod).toBeGreaterThan(5);
    }
    expect(results.roi).toBeCloseTo(15, 0);
  });
});
