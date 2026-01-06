/**
 * IRR Calculator Tests
 *
 * Comprehensive test suite for IRR (Internal Rate of Return) calculations
 * covering various investment scenarios, edge cases, and MIRR calculations.
 *
 * Test categories:
 * 1. Standard IRR calculations with known results
 * 2. Different cash flow patterns (regular, irregular)
 * 3. Edge cases (all positive, all negative, single cash flow)
 * 4. Multiple IRR scenarios
 * 5. MIRR calculations
 * 6. NPV validation
 * 7. Payback period calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateIRR,
  calculateMIRR,
  calculateNPV,
  calculatePaybackPeriod,
  calculateIRRResults,
  validateIRRInputs,
  type CashFlow,
  type IRRInputs,
} from './irrCalculations';

describe('IRR Calculations - Standard Cases', () => {
  it('Test 1: Simple investment with positive returns', () => {
    // Initial investment of $100,000 with annual returns
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000, label: 'Initial Investment' },
      { period: 1, amount: 30000, label: 'Year 1' },
      { period: 2, amount: 40000, label: 'Year 2' },
      { period: 3, amount: 50000, label: 'Year 3' },
      { period: 4, amount: 20000, label: 'Year 4' },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    // IRR should be approximately 15.32%
    expect(results.irr).toBeCloseTo(15.32, 1);
    expect(results.npv).toBeCloseTo(0, 2); // NPV at IRR should be ~0
    expect(results.totalInvestment).toBe(100000);
    expect(results.totalReturns).toBe(140000);
    expect(results.profitLoss).toBe(40000);
    expect(results.paybackPeriod).toBeCloseTo(2.6, 1);
  });

  it('Test 2: Break-even investment scenario', () => {
    // Investment that roughly breaks even
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -50000 },
      { period: 1, amount: 10000 },
      { period: 2, amount: 15000 },
      { period: 3, amount: 20000 },
      { period: 4, amount: 25000 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    // IRR should be approximately 12.83%
    expect(results.irr).toBeCloseTo(12.83, 1);
    expect(results.npv).toBeCloseTo(0, 2);
    expect(results.totalReturns).toBe(70000);
    expect(results.profitLoss).toBe(20000);
  });

  it('Test 3: High return investment', () => {
    // Small investment with high returns
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -10000 },
      { period: 1, amount: 5000 },
      { period: 2, amount: 6000 },
      { period: 3, amount: 7000 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    // IRR should be approximately 33.87%
    expect(results.irr).toBeCloseTo(33.87, 1);
    expect(results.npv).toBeCloseTo(0, 2);
    expect(results.totalInvestment).toBe(10000);
    expect(results.totalReturns).toBe(18000);
  });

  it('Test 4: Multiple sign changes in cash flows', () => {
    // Cash flows with multiple sign changes (can have multiple IRRs)
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 50000 },
      { period: 2, amount: 60000 },
      { period: 3, amount: -20000 },
      { period: 4, amount: 40000 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    // Should find one IRR (there might be multiple)
    expect(results.irr).toBeGreaterThan(0);
    expect(results.irr).toBeLessThan(30);
    expect(Math.abs(results.npv)).toBeLessThan(1); // NPV should be close to 0
  });

  it('Test 5: Long-term investment', () => {
    // 5-year investment with increasing returns
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -200000 },
      { period: 1, amount: 30000 },
      { period: 2, amount: 40000 },
      { period: 3, amount: 50000 },
      { period: 4, amount: 60000 },
      { period: 5, amount: 70000 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    // IRR should be approximately 6.91%
    expect(results.irr).toBeCloseTo(6.91, 1);
    expect(results.npv).toBeCloseTo(0, 2);
    expect(results.totalInvestment).toBe(200000);
    expect(results.totalReturns).toBe(250000);
  });

  it('Test 6: Negative IRR scenario', () => {
    // Poor investment with negative returns
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 20000 },
      { period: 2, amount: 20000 },
      { period: 3, amount: 20000 },
      { period: 4, amount: 20000 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    // IRR should be negative (around -8.36%)
    expect(results.irr).toBeLessThan(0);
    expect(results.irr).toBeCloseTo(-8.36, 1);
    expect(results.totalReturns).toBe(80000);
    expect(results.profitLoss).toBe(-20000);
  });

  it('Test 7: Zero IRR scenario', () => {
    // Investment that returns exactly the principal
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 25000 },
      { period: 2, amount: 25000 },
      { period: 3, amount: 25000 },
      { period: 4, amount: 25000 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    // IRR should be approximately 0%
    expect(results.irr).toBeCloseTo(0, 0);
    expect(results.totalReturns).toBe(100000);
    expect(results.profitLoss).toBe(0);
  });

  it('Test 8: Real estate investment scenario', () => {
    // Property investment with rental income and sale
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -500000, label: 'Property Purchase' },
      { period: 1, amount: 24000, label: 'Year 1 Rental' },
      { period: 2, amount: 24000, label: 'Year 2 Rental' },
      { period: 3, amount: 24000, label: 'Year 3 Rental' },
      { period: 4, amount: 24000, label: 'Year 4 Rental' },
      { period: 5, amount: 624000, label: 'Year 5 Rental + Sale' },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    // IRR should be approximately 8.20%
    expect(results.irr).toBeCloseTo(8.2, 1);
    expect(results.totalInvestment).toBe(500000);
    expect(results.totalReturns).toBe(720000);
  });
});

describe('IRR Calculations - Edge Cases', () => {
  it('Test 9: Very high returns (100%+ IRR)', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -1000 },
      { period: 1, amount: 3000 },
    ];

    const irr = calculateIRR(cashFlows);
    expect(irr).toBeCloseTo(200, 0);
  });

  it('Test 10: All positive cash flows (no IRR)', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: 1000 },
      { period: 1, amount: 1000 },
      { period: 2, amount: 1000 },
    ];

    const irr = calculateIRR(cashFlows);
    expect(irr).toBeNull();
  });

  it('Test 11: All negative cash flows (no IRR)', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -1000 },
      { period: 1, amount: -1000 },
      { period: 2, amount: -1000 },
    ];

    const irr = calculateIRR(cashFlows);
    expect(irr).toBeNull();
  });

  it('Test 12: Single cash flow (no IRR)', () => {
    const cashFlows: CashFlow[] = [{ period: 0, amount: -1000 }];

    const inputs: IRRInputs = { cashFlows };
    const errors = validateIRRInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('At least two'))).toBe(true);
  });

  it('Test 13: Very small cash flows', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -0.01 },
      { period: 1, amount: 0.015 },
    ];

    const irr = calculateIRR(cashFlows);
    expect(irr).toBeCloseTo(50, 0);
  });

  it('Test 14: Irregular periods', () => {
    // Non-sequential periods
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 2, amount: 40000 },
      { period: 5, amount: 100000 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    expect(results.irr).toBeGreaterThan(0);
    expect(results.irr).toBeLessThan(20);
    expect(Math.abs(results.npv)).toBeLessThan(1);
  });
});

describe('MIRR Calculations', () => {
  it('Test 15: MIRR with different finance and reinvestment rates', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 30000 },
      { period: 2, amount: 40000 },
      { period: 3, amount: 50000 },
      { period: 4, amount: 20000 },
    ];

    const inputs: IRRInputs = {
      cashFlows,
      financeRate: 10, // 10% cost of capital
      reinvestmentRate: 12, // 12% reinvestment rate
    };

    const results = calculateIRRResults(inputs);

    expect(results.mirr).toBeDefined();
    expect(results.mirr).toBeGreaterThan(10);
    expect(results.mirr).toBeLessThan(results.irr); // MIRR typically < IRR
  });

  it('Test 16: MIRR with zero rates', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -50000 },
      { period: 1, amount: 20000 },
      { period: 2, amount: 20000 },
      { period: 3, amount: 20000 },
    ];

    const mirr = calculateMIRR(cashFlows, 0, 0);
    expect(mirr).toBeCloseTo(6.27, 1);
  });

  it('Test 17: MIRR with high finance rate', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 40000 },
      { period: 2, amount: 50000 },
      { period: 3, amount: 60000 },
    ];

    const mirr = calculateMIRR(cashFlows, 20, 8);
    expect(mirr).toBeGreaterThan(0);
    expect(mirr).toBeLessThan(20);
  });
});

describe('NPV Calculations', () => {
  it('Test 18: NPV at various discount rates', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 30000 },
      { period: 2, amount: 40000 },
      { period: 3, amount: 50000 },
    ];

    // NPV at 0% should be sum of cash flows
    const npv0 = calculateNPV(cashFlows, 0);
    expect(npv0).toBe(20000);

    // NPV at 10%
    const npv10 = calculateNPV(cashFlows, 0.1);
    expect(npv10).toBeCloseTo(-2103.68, 2);

    // NPV at 20%
    const npv20 = calculateNPV(cashFlows, 0.2);
    expect(npv20).toBeCloseTo(-18287.04, 2);

    // NPV at IRR should be ~0
    const irr = calculateIRR(cashFlows);
    if (irr !== null) {
      const npvAtIRR = calculateNPV(cashFlows, irr / 100);
      expect(Math.abs(npvAtIRR)).toBeLessThan(0.01);
    }
  });

  it('Test 19: NPV with negative discount rate', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 50000 },
      { period: 2, amount: 50000 },
    ];

    const npv = calculateNPV(cashFlows, -0.05);
    expect(npv).toBeGreaterThan(0);
  });
});

describe('Payback Period Calculations', () => {
  it('Test 20: Simple payback period', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 30000 },
      { period: 2, amount: 40000 },
      { period: 3, amount: 50000 },
    ];

    const payback = calculatePaybackPeriod(cashFlows);
    expect(payback).toBeCloseTo(2.6, 1); // Payback in year 3
  });

  it('Test 21: Fractional payback period', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 60000 },
      { period: 2, amount: 60000 },
    ];

    const payback = calculatePaybackPeriod(cashFlows);
    expect(payback).toBeCloseTo(1.667, 2);
  });

  it('Test 22: No payback period', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 20000 },
      { period: 2, amount: 20000 },
      { period: 3, amount: 20000 },
    ];

    const payback = calculatePaybackPeriod(cashFlows);
    expect(payback).toBeUndefined();
  });

  it('Test 23: Immediate payback', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -100000 },
      { period: 1, amount: 120000 },
    ];

    const payback = calculatePaybackPeriod(cashFlows);
    expect(payback).toBeCloseTo(0.833, 2);
  });
});

describe('Input Validation', () => {
  it('Test 24: Valid inputs', () => {
    const inputs: IRRInputs = {
      cashFlows: [
        { period: 0, amount: -100000 },
        { period: 1, amount: 50000 },
        { period: 2, amount: 50000 },
      ],
    };

    const errors = validateIRRInputs(inputs);
    expect(errors.length).toBe(0);
  });

  it('Test 25: Missing cash flows', () => {
    const inputs: IRRInputs = {
      cashFlows: [],
    };

    const errors = validateIRRInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('At least two'))).toBe(true);
  });

  it('Test 26: No positive cash flows', () => {
    const inputs: IRRInputs = {
      cashFlows: [
        { period: 0, amount: -100000 },
        { period: 1, amount: -50000 },
      ],
    };

    const errors = validateIRRInputs(inputs);
    expect(errors.some((e) => e.includes('positive'))).toBe(true);
  });

  it('Test 27: No negative cash flows', () => {
    const inputs: IRRInputs = {
      cashFlows: [
        { period: 0, amount: 100000 },
        { period: 1, amount: 50000 },
      ],
    };

    const errors = validateIRRInputs(inputs);
    expect(errors.some((e) => e.includes('negative'))).toBe(true);
  });

  it('Test 28: Duplicate periods', () => {
    const inputs: IRRInputs = {
      cashFlows: [
        { period: 0, amount: -100000 },
        { period: 1, amount: 50000 },
        { period: 1, amount: 50000 },
      ],
    };

    const errors = validateIRRInputs(inputs);
    expect(errors.some((e) => e.includes('unique'))).toBe(true);
  });

  it('Test 29: Invalid finance rate', () => {
    const inputs: IRRInputs = {
      cashFlows: [
        { period: 0, amount: -100000 },
        { period: 1, amount: 150000 },
      ],
      financeRate: 150,
    };

    const errors = validateIRRInputs(inputs);
    expect(errors.some((e) => e.includes('Finance rate'))).toBe(true);
  });

  it('Test 30: Invalid reinvestment rate', () => {
    const inputs: IRRInputs = {
      cashFlows: [
        { period: 0, amount: -100000 },
        { period: 1, amount: 150000 },
      ],
      reinvestmentRate: -150,
    };

    const errors = validateIRRInputs(inputs);
    expect(errors.some((e) => e.includes('Reinvestment rate'))).toBe(true);
  });
});

describe('Complex Scenarios', () => {
  it('Test 31: Startup investment with J-curve', () => {
    // Typical startup pattern: high initial investment, losses, then profits
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -1000000, label: 'Initial Investment' },
      { period: 1, amount: -200000, label: 'Year 1 Loss' },
      { period: 2, amount: -100000, label: 'Year 2 Loss' },
      { period: 3, amount: 200000, label: 'Year 3 Profit' },
      { period: 4, amount: 500000, label: 'Year 4 Profit' },
      { period: 5, amount: 1500000, label: 'Year 5 Exit' },
    ];

    const inputs: IRRInputs = {
      cashFlows,
      financeRate: 15,
      reinvestmentRate: 10,
    };

    const results = calculateIRRResults(inputs);

    expect(results.irr).toBeGreaterThan(10);
    expect(results.totalInvestment).toBe(1300000);
    expect(results.totalReturns).toBe(2200000);
    expect(results.mirr).toBeDefined();
    expect(results.mirr!).toBeLessThan(results.irr);
  });

  it('Test 32: Bond-like investment', () => {
    // Regular coupon payments with principal return
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -10000 },
      { period: 1, amount: 500 },
      { period: 2, amount: 500 },
      { period: 3, amount: 500 },
      { period: 4, amount: 500 },
      { period: 5, amount: 10500 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    expect(results.irr).toBeCloseTo(5, 0);
    expect(results.paybackPeriod).toBeCloseTo(4.76, 1);
  });

  it('Test 33: Project with initial and additional investments', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -500000 },
      { period: 1, amount: 100000 },
      { period: 2, amount: -200000 }, // Additional investment
      { period: 3, amount: 300000 },
      { period: 4, amount: 400000 },
      { period: 5, amount: 500000 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    expect(results.irr).toBeGreaterThan(0);
    expect(results.totalInvestment).toBe(700000);
    expect(results.totalReturns).toBe(1300000);
  });
});

describe('Performance Tests', () => {
  it('Test 34: Large number of cash flows', () => {
    // Generate 50 years of cash flows
    const cashFlows: CashFlow[] = [{ period: 0, amount: -1000000 }];

    for (let i = 1; i <= 50; i++) {
      cashFlows.push({
        period: i,
        amount: 30000 + i * 1000, // Increasing returns
      });
    }

    const startTime = performance.now();
    const results = calculateIRRResults({ cashFlows });
    const endTime = performance.now();

    expect(results.irr).toBeGreaterThan(0);
    expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
  });

  it('Test 35: Extreme values', () => {
    const cashFlows: CashFlow[] = [
      { period: 0, amount: -1e9 }, // Billion dollar investment
      { period: 1, amount: 5e8 },
      { period: 2, amount: 7e8 },
    ];

    const inputs: IRRInputs = { cashFlows };
    const results = calculateIRRResults(inputs);

    expect(results.irr).toBeGreaterThan(0);
    expect(results.totalInvestment).toBe(1e9);
    expect(results.totalReturns).toBe(1.2e9);
  });
});
