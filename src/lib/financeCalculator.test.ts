import { describe, it, expect } from 'vitest';
import { calculateTVM, TVMInputs } from './financeCalculator';

describe('Finance Calculator (Time Value of Money)', () => {
  describe('Solve for Future Value (FV)', () => {
    it('should calculate FV with example from calculator.net: PV=20000, PMT=-2000, N=10, I/Y=6', () => {
      // This is the exact example shown on calculator.net
      const inputs: TVMInputs = {
        solveFor: 'FV',
        N: 10,
        IY: 6,
        PV: 20000,
        PMT: -2000,
        FV: 0,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // calculator.net shows: FV = -$9,455.36
      expect(result.FV).toBeCloseTo(-9455.36, 1);
    });

    it('should calculate FV for simple investment: PV=-10000, PMT=0, N=5, I/Y=8', () => {
      const inputs: TVMInputs = {
        solveFor: 'FV',
        N: 5,
        IY: 8,
        PV: -10000,
        PMT: 0,
        FV: 0,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // FV = PV * (1 + r)^n = 10000 * (1.08)^5 = 14693.28
      expect(result.FV).toBeCloseTo(14693.28, 2);
    });

    it('should calculate FV for monthly savings: PV=0, PMT=-500, N=24, I/Y=6, P/Y=12, C/Y=12', () => {
      const inputs: TVMInputs = {
        solveFor: 'FV',
        N: 24,
        IY: 6,
        PV: 0,
        PMT: -500,
        FV: 0,
        PY: 12,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // Monthly compounding: 24 months of $500 at 6% annual
      expect(result.FV).toBeCloseTo(12715.98, 1);
    });

    it('should calculate FV with payments at beginning of period', () => {
      const inputs: TVMInputs = {
        solveFor: 'FV',
        N: 12,
        IY: 5,
        PV: 0,
        PMT: -1000,
        FV: 0,
        PY: 1,
        CY: 1,
        PMTatBeginning: true,
      };

      const result = calculateTVM(inputs);

      // Beginning-of-period payments: each payment compounds for full period
      expect(result.FV).toBeCloseTo(16712.98, 1);
    });
  });

  describe('Solve for Present Value (PV)', () => {
    it('should calculate PV for future lump sum: FV=15000, PMT=0, N=10, I/Y=5', () => {
      const inputs: TVMInputs = {
        solveFor: 'PV',
        N: 10,
        IY: 5,
        PV: 0,
        PMT: 0,
        FV: 15000,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // PV = FV / (1 + r)^n = 15000 / (1.05)^10 = 9208.70
      expect(result.PV).toBeCloseTo(-9208.70, 1);
    });

    it('should calculate PV for annuity: FV=0, PMT=500, N=20, I/Y=7', () => {
      const inputs: TVMInputs = {
        solveFor: 'PV',
        N: 20,
        IY: 7,
        PV: 0,
        PMT: 500,
        FV: 0,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // PV of annuity
      expect(result.PV).toBeCloseTo(-5297.01, 1);
    });

    it('should calculate PV with monthly payments: FV=0, PMT=300, N=36, I/Y=6, P/Y=12, C/Y=12', () => {
      const inputs: TVMInputs = {
        solveFor: 'PV',
        N: 36,
        IY: 6,
        PV: 0,
        PMT: 300,
        FV: 0,
        PY: 12,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      expect(result.PV).toBeCloseTo(-9861.30, 1);
    });
  });

  describe('Solve for Payment (PMT)', () => {
    it('should calculate PMT for loan: PV=10000, FV=0, N=36, I/Y=6, P/Y=12, C/Y=12', () => {
      // Standard loan payment calculation
      const inputs: TVMInputs = {
        solveFor: 'PMT',
        N: 36,
        IY: 6,
        PV: 10000,
        PMT: 0,
        FV: 0,
        PY: 12,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // Monthly payment for $10k loan at 6% APR for 36 months
      expect(result.PMT).toBeCloseTo(-304.22, 2);
    });

    it('should calculate PMT for savings goal: PV=0, FV=100000, N=30, I/Y=8', () => {
      const inputs: TVMInputs = {
        solveFor: 'PMT',
        N: 30,
        IY: 8,
        PV: 0,
        PMT: 0,
        FV: 100000,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      expect(result.PMT).toBeCloseTo(-882.74, 2);
    });

    it('should calculate PMT for mortgage: PV=300000, FV=0, N=360, I/Y=4.5, P/Y=12, C/Y=12', () => {
      const inputs: TVMInputs = {
        solveFor: 'PMT',
        N: 360,
        IY: 4.5,
        PV: 300000,
        PMT: 0,
        FV: 0,
        PY: 12,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // 30-year mortgage payment
      expect(result.PMT).toBeCloseTo(-1520.06, 2);
    });
  });

  describe('Solve for Number of Periods (N)', () => {
    it('should calculate N for loan payoff: PV=5000, PMT=-150, FV=0, I/Y=12, P/Y=12, C/Y=12', () => {
      const inputs: TVMInputs = {
        solveFor: 'N',
        N: 0,
        IY: 12,
        PV: 5000,
        PMT: -150,
        FV: 0,
        PY: 12,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      expect(result.N).toBeCloseTo(40.75, 1);
    });

    it('should calculate N for investment goal: PV=-10000, PMT=-500, FV=30000, I/Y=7, P/Y=12, C/Y=12', () => {
      const inputs: TVMInputs = {
        solveFor: 'N',
        N: 0,
        IY: 7,
        PV: -10000,
        PMT: -500,
        FV: 30000,
        PY: 12,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      expect(result.N).toBeCloseTo(32.62, 1);
    });

    it('should calculate N for simple compounding: PV=-1000, PMT=0, FV=2000, I/Y=8', () => {
      const inputs: TVMInputs = {
        solveFor: 'N',
        N: 0,
        IY: 8,
        PV: -1000,
        PMT: 0,
        FV: 2000,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // Rule of 72: approximately 9 years to double at 8%
      expect(result.N).toBeCloseTo(9.01, 1);
    });
  });

  describe('Solve for Interest Rate (I/Y)', () => {
    it('should calculate I/Y for loan: PV=10000, PMT=-300, FV=0, N=36, P/Y=12, C/Y=12', () => {
      const inputs: TVMInputs = {
        solveFor: 'IY',
        N: 36,
        IY: 0,
        PV: 10000,
        PMT: -300,
        FV: 0,
        PY: 12,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // Around 5.06% APR
      expect(result.IY).toBeCloseTo(5.06, 1);
    });

    it('should calculate I/Y for investment: PV=-5000, PMT=0, FV=10000, N=10', () => {
      const inputs: TVMInputs = {
        solveFor: 'IY',
        N: 10,
        IY: 0,
        PV: -5000,
        PMT: 0,
        FV: 10000,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // Doubling in 10 years = 7.18% annual return
      expect(result.IY).toBeCloseTo(7.18, 1);
    });

    it('should calculate I/Y for annuity: PV=-20000, PMT=500, FV=0, N=48, P/Y=12, C/Y=12', () => {
      // Simpler case for testing interest rate solver
      const inputs: TVMInputs = {
        solveFor: 'IY',
        N: 48,
        IY: 0,
        PV: -20000,
        PMT: 500,
        FV: 0,
        PY: 12,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // Should converge to around 9% APR
      expect(result.IY).toBeGreaterThan(8);
      expect(result.IY).toBeLessThan(10);
    });
  });

  describe('Different compounding frequencies', () => {
    it('should handle quarterly compounding: PV=-10000, N=20, I/Y=6, P/Y=4, C/Y=4', () => {
      const inputs: TVMInputs = {
        solveFor: 'FV',
        N: 20,
        IY: 6,
        PV: -10000,
        PMT: 0,
        FV: 0,
        PY: 4,
        CY: 4,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // 5 years (20 quarters) at 6% annual, compounded quarterly
      expect(result.FV).toBeCloseTo(13468.55, 1);
    });

    it('should handle monthly compounding with annual payments: PV=0, PMT=-1000, N=10, I/Y=5, P/Y=1, C/Y=12', () => {
      const inputs: TVMInputs = {
        solveFor: 'FV',
        N: 10,
        IY: 5,
        PV: 0,
        PMT: -1000,
        FV: 0,
        PY: 1,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // Annual payments but monthly compounding
      expect(result.FV).toBeCloseTo(12646.32, 1);
    });

    it('should handle daily compounding: PV=-5000, N=1825, I/Y=4, P/Y=365, C/Y=365', () => {
      const inputs: TVMInputs = {
        solveFor: 'FV',
        N: 1825,
        IY: 4,
        PV: -5000,
        PMT: 0,
        FV: 0,
        PY: 365,
        CY: 365,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // 5 years daily compounding at 4%
      expect(result.FV).toBeCloseTo(6106.90, 1);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero interest rate', () => {
      const inputs: TVMInputs = {
        solveFor: 'PMT',
        N: 12,
        IY: 0,
        PV: 12000,
        PMT: 0,
        FV: 0,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      // Simple division: 12000 / 12 = 1000
      expect(result.PMT).toBeCloseTo(-1000, 2);
    });

    it('should handle very small interest rates', () => {
      const inputs: TVMInputs = {
        solveFor: 'FV',
        N: 12,
        IY: 0.5,
        PV: -10000,
        PMT: 0,
        FV: 0,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      expect(result.FV).toBeCloseTo(10616.78, 1);
    });

    it('should handle large numbers', () => {
      const inputs: TVMInputs = {
        solveFor: 'PMT',
        N: 360,
        IY: 3.5,
        PV: 1000000,
        PMT: 0,
        FV: 0,
        PY: 12,
        CY: 12,
        PMTatBeginning: false,
      };

      const result = calculateTVM(inputs);

      expect(result.PMT).toBeCloseTo(-4490.45, 2);
    });

    it('should handle payments at beginning vs end correctly', () => {
      const inputsEnd: TVMInputs = {
        solveFor: 'FV',
        N: 10,
        IY: 6,
        PV: 0,
        PMT: -1000,
        FV: 0,
        PY: 1,
        CY: 1,
        PMTatBeginning: false,
      };

      const inputsBeginning: TVMInputs = {
        ...inputsEnd,
        PMTatBeginning: true,
      };

      const resultEnd = calculateTVM(inputsEnd);
      const resultBeginning = calculateTVM(inputsBeginning);

      // Beginning should be higher due to extra compounding period
      expect(resultBeginning.FV).toBeGreaterThan(resultEnd.FV);
      expect(resultEnd.FV).toBeCloseTo(13180.79, 1);
      expect(resultBeginning.FV).toBeCloseTo(13971.64, 1);
    });
  });
});
