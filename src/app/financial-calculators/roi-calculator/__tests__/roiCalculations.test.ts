/**
 * ROI Calculator - Comprehensive Test Suite
 * Tests ROI calculation logic for various investment scenarios
 */

import { describe, it, expect } from 'vitest';
import {
  calculateROIResults,
  validateROIInputs,
  formatPercentage,
  formatCurrency,
  calculateBasicROI,
  calculateAnnualizedROI,
  type ROIInputs,
  type InvestmentScenario,
} from '../roiCalculations';

describe('ROI Calculator Tests', () => {
  describe('Basic ROI Calculation', () => {
    it('should calculate simple positive ROI', () => {
      const roi = calculateBasicROI(10000, 15000);
      expect(roi).toBe(50); // (15000-10000)/10000 * 100 = 50%
    });

    it('should calculate simple negative ROI', () => {
      const roi = calculateBasicROI(25000, 20000);
      expect(roi).toBe(-20); // (20000-25000)/25000 * 100 = -20%
    });

    it('should calculate break-even ROI', () => {
      const roi = calculateBasicROI(10000, 10000);
      expect(roi).toBe(0);
    });

    it('should handle zero initial investment', () => {
      const roi = calculateBasicROI(0, 1000);
      expect(roi).toBe(Infinity);
    });

    it('should calculate large positive ROI', () => {
      const roi = calculateBasicROI(100000, 250000);
      expect(roi).toBe(150); // (250000-100000)/100000 * 100 = 150%
    });

    it('should calculate small ROI with decimal precision', () => {
      const roi = calculateBasicROI(1000, 1100);
      expect(roi).toBe(10); // (1100-1000)/1000 * 100 = 10%
    });
  });

  describe('Annualized ROI Calculation', () => {
    it('should calculate annualized ROI for 1 year', () => {
      const annualizedROI = calculateAnnualizedROI(50, 1);
      expect(annualizedROI).toBe(50); // Same as simple ROI for 1 year
    });

    it('should calculate annualized ROI for multiple years', () => {
      const annualizedROI = calculateAnnualizedROI(50, 3);
      // ((1.50)^(1/3) - 1) * 100 ≈ 14.47%
      expect(annualizedROI).toBeCloseTo(14.47, 2);
    });

    it('should calculate annualized ROI for half year', () => {
      const annualizedROI = calculateAnnualizedROI(10, 0.5);
      // ((1.10)^(1/0.5) - 1) * 100 = 21%
      expect(annualizedROI).toBeCloseTo(21, 1);
    });

    it('should handle negative ROI annualization', () => {
      const annualizedROI = calculateAnnualizedROI(-20, 2);
      // ((0.80)^(1/2) - 1) * 100 ≈ -10.56%
      expect(annualizedROI).toBeCloseTo(-10.56, 2);
    });

    it('should handle large multi-year returns', () => {
      const annualizedROI = calculateAnnualizedROI(150, 5);
      // ((2.50)^(1/5) - 1) * 100 ≈ 20.11%
      expect(annualizedROI).toBeCloseTo(20.11, 2);
    });
  });

  describe('Complete ROI Results Calculation', () => {
    it('should calculate complete ROI results - Test Case 1', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 15000,
        investmentPeriod: 1,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.roi).toBe(50);
      expect(results.annualizedROI).toBe(50);
      expect(results.totalReturn).toBe(15000);
      expect(results.netProfit).toBe(5000);
      expect(results.totalInvested).toBe(10000);
      expect(results.totalGain).toBe(5000);
      expect(results.effectivePeriodInYears).toBe(1);
    });

    it('should calculate complete ROI results - Test Case 2', () => {
      const inputs: ROIInputs = {
        initialInvestment: 50000,
        finalValue: 75000,
        investmentPeriod: 3,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.roi).toBe(50);
      expect(results.annualizedROI).toBeCloseTo(14.47, 2);
      expect(results.totalReturn).toBe(75000);
      expect(results.netProfit).toBe(25000);
      expect(results.totalInvested).toBe(50000);
    });

    it('should calculate complete ROI results - Test Case 3', () => {
      const inputs: ROIInputs = {
        initialInvestment: 25000,
        finalValue: 20000,
        investmentPeriod: 2,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.roi).toBe(-20);
      expect(results.annualizedROI).toBeCloseTo(-10.56, 2);
      expect(results.totalReturn).toBe(20000);
      expect(results.netProfit).toBe(-5000);
      expect(results.totalInvested).toBe(25000);
    });

    it('should calculate complete ROI results - Test Case 4', () => {
      const inputs: ROIInputs = {
        initialInvestment: 100000,
        finalValue: 250000,
        investmentPeriod: 5,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.roi).toBe(150);
      expect(results.annualizedROI).toBeCloseTo(20.11, 2);
      expect(results.totalReturn).toBe(250000);
      expect(results.netProfit).toBe(150000);
    });

    it('should calculate complete ROI results - Test Case 5', () => {
      const inputs: ROIInputs = {
        initialInvestment: 1000,
        finalValue: 1100,
        investmentPeriod: 6,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'months',
      };

      const results = calculateROIResults(inputs);

      expect(results.roi).toBe(10);
      expect(results.effectivePeriodInYears).toBe(0.5);
      expect(results.annualizedROI).toBeCloseTo(21, 1);
      expect(results.netProfit).toBe(100);
    });
  });

  describe('ROI with Additional Costs and Gains', () => {
    it('should include additional costs in calculation', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 15000,
        investmentPeriod: 1,
        additionalCosts: 500, // Fees, maintenance, etc.
        additionalGains: 0,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.totalInvested).toBe(10500);
      expect(results.netProfit).toBe(4500); // 15000 - 10500
      expect(results.roi).toBeCloseTo(42.86, 2); // 4500/10500 * 100
    });

    it('should include additional gains in calculation', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 15000,
        investmentPeriod: 1,
        additionalCosts: 0,
        additionalGains: 2000, // Dividends, rental income, etc.
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.totalReturn).toBe(17000); // 15000 + 2000
      expect(results.netProfit).toBe(7000); // 17000 - 10000
      expect(results.roi).toBe(70); // 7000/10000 * 100
    });

    it('should handle both additional costs and gains', () => {
      const inputs: ROIInputs = {
        initialInvestment: 50000,
        finalValue: 70000,
        investmentPeriod: 2,
        additionalCosts: 3000,
        additionalGains: 5000,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.totalInvested).toBe(53000);
      expect(results.totalReturn).toBe(75000);
      expect(results.netProfit).toBe(22000);
      expect(results.roi).toBeCloseTo(41.51, 2);
      expect(results.annualizedROI).toBeCloseTo(18.96, 2);
    });
  });

  describe('Period Type Handling', () => {
    it('should convert months to years correctly', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 11000,
        investmentPeriod: 18,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'months',
      };

      const results = calculateROIResults(inputs);

      expect(results.effectivePeriodInYears).toBe(1.5);
      expect(results.roi).toBe(10);
      expect(results.annualizedROI).toBeCloseTo(6.56, 2);
    });

    it('should convert days to years correctly', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 10500,
        investmentPeriod: 365,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'days',
      };

      const results = calculateROIResults(inputs);

      expect(results.effectivePeriodInYears).toBe(1);
      expect(results.roi).toBe(5);
      expect(results.annualizedROI).toBeCloseTo(5, 1);
    });

    it('should handle partial year periods', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 10250,
        investmentPeriod: 90,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'days',
      };

      const results = calculateROIResults(inputs);

      expect(results.effectivePeriodInYears).toBeCloseTo(0.247, 3);
      expect(results.roi).toBe(2.5);
      // Annualized: ((1.025)^(1/0.247) - 1) * 100
      expect(results.annualizedROI).toBeCloseTo(10.53, 1);
    });
  });

  describe('Multiple Investment Scenarios Comparison', () => {
    it('should compare multiple investment scenarios', () => {
      const scenarios: InvestmentScenario[] = [
        {
          name: 'Stock Investment',
          initialInvestment: 10000,
          finalValue: 15000,
          period: 2,
          periodType: 'years',
        },
        {
          name: 'Real Estate',
          initialInvestment: 100000,
          finalValue: 130000,
          period: 3,
          periodType: 'years',
        },
        {
          name: 'Bonds',
          initialInvestment: 50000,
          finalValue: 55000,
          period: 1,
          periodType: 'years',
        },
      ];

      const results = scenarios.map((scenario) => {
        const inputs: ROIInputs = {
          initialInvestment: scenario.initialInvestment,
          finalValue: scenario.finalValue,
          investmentPeriod: scenario.period,
          additionalCosts: 0,
          additionalGains: 0,
          periodType: scenario.periodType,
        };
        return {
          name: scenario.name,
          ...calculateROIResults(inputs),
        };
      });

      // Stock Investment
      expect(results[0].roi).toBe(50);
      expect(results[0].annualizedROI).toBeCloseTo(22.47, 2);

      // Real Estate
      expect(results[1].roi).toBe(30);
      expect(results[1].annualizedROI).toBeCloseTo(9.14, 2);

      // Bonds
      expect(results[2].roi).toBe(10);
      expect(results[2].annualizedROI).toBeCloseTo(10, 1);
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', () => {
      const inputs: ROIInputs = {
        initialInvestment: 0,
        finalValue: 10000,
        investmentPeriod: 1,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const errors = validateROIInputs(inputs);
      expect(errors).toContain('Initial investment must be greater than 0');
    });

    it('should validate final value', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: -100,
        investmentPeriod: 1,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const errors = validateROIInputs(inputs);
      expect(errors).toContain(
        'Final value must be greater than or equal to 0'
      );
    });

    it('should validate investment period', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 15000,
        investmentPeriod: 0,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const errors = validateROIInputs(inputs);
      expect(errors).toContain('Investment period must be greater than 0');
    });

    it('should validate negative additional costs', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 15000,
        investmentPeriod: 1,
        additionalCosts: -100,
        additionalGains: 0,
        periodType: 'years',
      };

      const errors = validateROIInputs(inputs);
      expect(errors).toContain('Additional costs cannot be negative');
    });

    it('should validate negative additional gains', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 15000,
        investmentPeriod: 1,
        additionalCosts: 0,
        additionalGains: -100,
        periodType: 'years',
      };

      const errors = validateROIInputs(inputs);
      expect(errors).toContain('Additional gains cannot be negative');
    });

    it('should pass validation for correct inputs', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 15000,
        investmentPeriod: 1,
        additionalCosts: 100,
        additionalGains: 500,
        periodType: 'years',
      };

      const errors = validateROIInputs(inputs);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small ROI', () => {
      const inputs: ROIInputs = {
        initialInvestment: 1000000,
        finalValue: 1001000,
        investmentPeriod: 1,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);
      expect(results.roi).toBe(0.1);
      expect(results.netProfit).toBe(1000);
    });

    it('should handle very large ROI', () => {
      const inputs: ROIInputs = {
        initialInvestment: 100,
        finalValue: 10000,
        investmentPeriod: 1,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);
      expect(results.roi).toBe(9900);
      expect(results.netProfit).toBe(9900);
    });

    it('should handle total loss', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 0,
        investmentPeriod: 1,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);
      expect(results.roi).toBe(-100);
      expect(results.netProfit).toBe(-10000);
      expect(results.annualizedROI).toBe(-100);
    });

    it('should handle very long investment periods', () => {
      const inputs: ROIInputs = {
        initialInvestment: 1000,
        finalValue: 3000,
        investmentPeriod: 30,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);
      expect(results.roi).toBe(200);
      expect(results.annualizedROI).toBeCloseTo(3.73, 2);
    });

    it('should handle very short investment periods', () => {
      const inputs: ROIInputs = {
        initialInvestment: 10000,
        finalValue: 10100,
        investmentPeriod: 1,
        additionalCosts: 0,
        additionalGains: 0,
        periodType: 'days',
      };

      const results = calculateROIResults(inputs);
      expect(results.roi).toBe(1);
      expect(results.effectivePeriodInYears).toBeCloseTo(0.00274, 5);
      // Annualized return for 1% in 1 day
      expect(results.annualizedROI).toBeGreaterThan(1000);
    });
  });

  describe('Formatting Functions', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(50, 2)).toBe('50.00%');
      expect(formatPercentage(12.345, 2)).toBe('12.35%');
      expect(formatPercentage(-10.5, 1)).toBe('-10.5%');
      expect(formatPercentage(0, 0)).toBe('0%');
    });

    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
      expect(formatCurrency(-5000)).toBe('-$5,000.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('Real-World Scenarios', () => {
    it('should calculate ROI for rental property investment', () => {
      const inputs: ROIInputs = {
        initialInvestment: 200000, // Property purchase
        finalValue: 250000, // Property value after 5 years
        investmentPeriod: 5,
        additionalCosts: 25000, // Maintenance, taxes, insurance
        additionalGains: 60000, // Rental income over 5 years
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.totalInvested).toBe(225000);
      expect(results.totalReturn).toBe(310000);
      expect(results.netProfit).toBe(85000);
      expect(results.roi).toBeCloseTo(37.78, 2);
      expect(results.annualizedROI).toBeCloseTo(6.62, 2);
    });

    it('should calculate ROI for stock market investment with dividends', () => {
      const inputs: ROIInputs = {
        initialInvestment: 50000,
        finalValue: 65000,
        investmentPeriod: 3,
        additionalCosts: 500, // Trading fees
        additionalGains: 4500, // Dividends
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.totalInvested).toBe(50500);
      expect(results.totalReturn).toBe(69500);
      expect(results.netProfit).toBe(19000);
      expect(results.roi).toBeCloseTo(37.62, 2);
      expect(results.annualizedROI).toBeCloseTo(11.23, 2);
    });

    it('should calculate ROI for business investment', () => {
      const inputs: ROIInputs = {
        initialInvestment: 100000,
        finalValue: 0, // Business still operating, no sale
        investmentPeriod: 2,
        additionalCosts: 20000, // Operating costs
        additionalGains: 180000, // Revenue/profits
        periodType: 'years',
      };

      const results = calculateROIResults(inputs);

      expect(results.totalInvested).toBe(120000);
      expect(results.totalReturn).toBe(180000);
      expect(results.netProfit).toBe(60000);
      expect(results.roi).toBe(50);
      expect(results.annualizedROI).toBeCloseTo(22.47, 2);
    });
  });
});
