/**
 * Rent Calculator Test Suite
 *
 * This test suite validates the calculation logic for the rent calculator
 * against known inputs and expected outputs.
 *
 * Calculation formulas:
 * - Total Monthly Cost = Monthly Rent + Utilities + Insurance + Parking + Other Costs
 * - With Discount: Total Monthly Cost = Total Monthly Cost * (1 - Discount%)
 * - With Tax: Total Monthly Cost = Total Monthly Cost * (1 + Tax%)
 * - Annual Cost = Total Monthly Cost * 12
 * - Future Year Cost = Annual Cost * (1 + Annual Increase%)^Year
 */

import { describe, it, expect } from 'vitest';

// Calculator function to be tested
export interface RentInputs {
  monthlyRent: number;
  utilities: number;
  insurance: number;
  parking: number;
  otherCosts: number;
  discount: number; // percentage (0-100)
  taxRate: number; // percentage (0-100)
  annualIncrease: number; // percentage (0-100)
  years: number;
}

export interface RentResults {
  monthlyTotal: number;
  annualTotal: number;
  costBreakdown: {
    rent: number;
    utilities: number;
    insurance: number;
    parking: number;
    other: number;
  };
  yearlyProjection: Array<{
    year: number;
    monthlyTotal: number;
    annualTotal: number;
  }>;
}

export function calculateRent(inputs: RentInputs): RentResults {
  const {
    monthlyRent,
    utilities,
    insurance,
    parking,
    otherCosts,
    discount,
    taxRate,
    annualIncrease,
    years,
  } = inputs;

  // Calculate base monthly total
  let monthlyTotal = monthlyRent + utilities + insurance + parking + otherCosts;

  // Apply discount if any
  if (discount > 0) {
    monthlyTotal = monthlyTotal * (1 - discount / 100);
  }

  // Apply tax if any
  if (taxRate > 0) {
    monthlyTotal = monthlyTotal * (1 + taxRate / 100);
  }

  // Calculate annual total
  const annualTotal = monthlyTotal * 12;

  // Calculate cost breakdown (proportional to monthly total)
  const baseTotal = monthlyRent + utilities + insurance + parking + otherCosts;
  const factor = monthlyTotal / baseTotal;

  const costBreakdown = {
    rent: monthlyRent * factor,
    utilities: utilities * factor,
    insurance: insurance * factor,
    parking: parking * factor,
    other: otherCosts * factor,
  };

  // Calculate yearly projection
  const yearlyProjection = [];
  for (let year = 1; year <= years; year++) {
    const yearlyMonthlyTotal = monthlyTotal * Math.pow(1 + annualIncrease / 100, year - 1);
    const yearlyAnnualTotal = yearlyMonthlyTotal * 12;
    yearlyProjection.push({
      year,
      monthlyTotal: yearlyMonthlyTotal,
      annualTotal: yearlyAnnualTotal,
    });
  }

  return {
    monthlyTotal,
    annualTotal,
    costBreakdown,
    yearlyProjection,
  };
}

describe('Rent Calculator', () => {
  describe('Basic Calculations', () => {
    it('Test Case 1: Basic rent calculation without additional costs', () => {
      const inputs: RentInputs = {
        monthlyRent: 1500,
        utilities: 0,
        insurance: 0,
        parking: 0,
        otherCosts: 0,
        discount: 0,
        taxRate: 0,
        annualIncrease: 0,
        years: 1,
      };

      const results = calculateRent(inputs);

      expect(results.monthlyTotal).toBe(1500);
      expect(results.annualTotal).toBe(18000);
      expect(results.costBreakdown.rent).toBe(1500);
    });

    it('Test Case 2: Rent with all additional costs', () => {
      const inputs: RentInputs = {
        monthlyRent: 2000,
        utilities: 150,
        insurance: 25,
        parking: 100,
        otherCosts: 50,
        discount: 0,
        taxRate: 0,
        annualIncrease: 0,
        years: 1,
      };

      const results = calculateRent(inputs);

      // Total should be sum of all costs
      expect(results.monthlyTotal).toBe(2325);
      expect(results.annualTotal).toBe(27900);
      expect(results.costBreakdown.rent).toBe(2000);
      expect(results.costBreakdown.utilities).toBe(150);
      expect(results.costBreakdown.insurance).toBe(25);
      expect(results.costBreakdown.parking).toBe(100);
      expect(results.costBreakdown.other).toBe(50);
    });

    it('Test Case 3: Rent with 10% discount', () => {
      const inputs: RentInputs = {
        monthlyRent: 2000,
        utilities: 150,
        insurance: 25,
        parking: 100,
        otherCosts: 50,
        discount: 10,
        taxRate: 0,
        annualIncrease: 0,
        years: 1,
      };

      const results = calculateRent(inputs);

      // Total before discount: 2325
      // After 10% discount: 2325 * 0.9 = 2092.50
      expect(results.monthlyTotal).toBeCloseTo(2092.5, 2);
      expect(results.annualTotal).toBeCloseTo(25110, 2);
    });

    it('Test Case 4: Rent with 5% tax', () => {
      const inputs: RentInputs = {
        monthlyRent: 2000,
        utilities: 150,
        insurance: 25,
        parking: 100,
        otherCosts: 50,
        discount: 0,
        taxRate: 5,
        annualIncrease: 0,
        years: 1,
      };

      const results = calculateRent(inputs);

      // Total before tax: 2325
      // After 5% tax: 2325 * 1.05 = 2441.25
      expect(results.monthlyTotal).toBeCloseTo(2441.25, 2);
      expect(results.annualTotal).toBeCloseTo(29295, 2);
    });

    it('Test Case 5: Rent with both discount and tax', () => {
      const inputs: RentInputs = {
        monthlyRent: 2000,
        utilities: 150,
        insurance: 25,
        parking: 100,
        otherCosts: 50,
        discount: 10,
        taxRate: 5,
        annualIncrease: 0,
        years: 1,
      };

      const results = calculateRent(inputs);

      // Total: 2325
      // After 10% discount: 2325 * 0.9 = 2092.50
      // After 5% tax: 2092.50 * 1.05 = 2197.125
      expect(results.monthlyTotal).toBeCloseTo(2197.125, 2);
      expect(results.annualTotal).toBeCloseTo(26365.5, 2);
    });
  });

  describe('Annual Increase Calculations', () => {
    it('Test Case 6: 3% annual increase over 3 years', () => {
      const inputs: RentInputs = {
        monthlyRent: 2000,
        utilities: 150,
        insurance: 25,
        parking: 100,
        otherCosts: 50,
        discount: 0,
        taxRate: 0,
        annualIncrease: 3,
        years: 3,
      };

      const results = calculateRent(inputs);

      // Year 1: 2325 monthly, 27900 annually
      expect(results.yearlyProjection[0].monthlyTotal).toBeCloseTo(2325, 2);
      expect(results.yearlyProjection[0].annualTotal).toBeCloseTo(27900, 2);

      // Year 2: 2325 * 1.03 = 2394.75 monthly, 28737 annually
      expect(results.yearlyProjection[1].monthlyTotal).toBeCloseTo(2394.75, 2);
      expect(results.yearlyProjection[1].annualTotal).toBeCloseTo(28737, 2);

      // Year 3: 2325 * 1.03^2 = 2466.59 monthly, 29599.13 annually
      expect(results.yearlyProjection[2].monthlyTotal).toBeCloseTo(2466.5925, 2);
      expect(results.yearlyProjection[2].annualTotal).toBeCloseTo(29599.11, 2);
    });

    it('Test Case 7: 5% annual increase over 5 years', () => {
      const inputs: RentInputs = {
        monthlyRent: 1800,
        utilities: 120,
        insurance: 20,
        parking: 80,
        otherCosts: 0,
        discount: 0,
        taxRate: 0,
        annualIncrease: 5,
        years: 5,
      };

      const results = calculateRent(inputs);

      // Base monthly: 2020
      expect(results.yearlyProjection[0].monthlyTotal).toBeCloseTo(2020, 2);

      // Year 5: 2020 * 1.05^4 = 2455.32
      expect(results.yearlyProjection[4].monthlyTotal).toBeCloseTo(2455.322625, 2);
      expect(results.yearlyProjection[4].annualTotal).toBeCloseTo(29463.8715, 2);
    });
  });

  describe('Complex Scenarios', () => {
    it('Test Case 8: High rent with all costs, discount, tax, and increase', () => {
      const inputs: RentInputs = {
        monthlyRent: 3500,
        utilities: 200,
        insurance: 35,
        parking: 150,
        otherCosts: 100,
        discount: 5,
        taxRate: 8,
        annualIncrease: 4,
        years: 3,
      };

      const results = calculateRent(inputs);

      // Base: 3985
      // After 5% discount: 3985 * 0.95 = 3785.75
      // After 8% tax: 3785.75 * 1.08 = 4088.61
      expect(results.monthlyTotal).toBeCloseTo(4088.61, 2);
      expect(results.annualTotal).toBeCloseTo(49063.32, 2);

      // Year 3 with 4% increase: 4088.61 * 1.04^2 = 4422.24
      expect(results.yearlyProjection[2].monthlyTotal).toBeCloseTo(4422.24, 2);
    });

    it('Test Case 9: Low rent scenario', () => {
      const inputs: RentInputs = {
        monthlyRent: 800,
        utilities: 75,
        insurance: 15,
        parking: 0,
        otherCosts: 20,
        discount: 0,
        taxRate: 0,
        annualIncrease: 2,
        years: 2,
      };

      const results = calculateRent(inputs);

      expect(results.monthlyTotal).toBeCloseTo(910, 2);
      expect(results.annualTotal).toBeCloseTo(10920, 2);

      // Year 2: 910 * 1.02 = 928.20
      expect(results.yearlyProjection[1].monthlyTotal).toBeCloseTo(928.2, 2);
    });

    it('Test Case 10: Zero rent with only utilities (edge case)', () => {
      const inputs: RentInputs = {
        monthlyRent: 0,
        utilities: 100,
        insurance: 20,
        parking: 50,
        otherCosts: 30,
        discount: 0,
        taxRate: 0,
        annualIncrease: 0,
        years: 1,
      };

      const results = calculateRent(inputs);

      expect(results.monthlyTotal).toBe(200);
      expect(results.annualTotal).toBe(2400);
    });

    it('Test Case 11: Maximum discount (50%)', () => {
      const inputs: RentInputs = {
        monthlyRent: 2000,
        utilities: 100,
        insurance: 20,
        parking: 80,
        otherCosts: 0,
        discount: 50,
        taxRate: 0,
        annualIncrease: 0,
        years: 1,
      };

      const results = calculateRent(inputs);

      // Base: 2200
      // After 50% discount: 1100
      expect(results.monthlyTotal).toBe(1100);
      expect(results.annualTotal).toBe(13200);
    });

    it('Test Case 12: High annual increase (10%) over 10 years', () => {
      const inputs: RentInputs = {
        monthlyRent: 1500,
        utilities: 100,
        insurance: 20,
        parking: 75,
        otherCosts: 25,
        discount: 0,
        taxRate: 0,
        annualIncrease: 10,
        years: 10,
      };

      const results = calculateRent(inputs);

      // Base: 1720
      expect(results.yearlyProjection[0].monthlyTotal).toBeCloseTo(1720, 2);

      // Year 10: 1720 * 1.10^9 = 4055.67
      expect(results.yearlyProjection[9].monthlyTotal).toBeCloseTo(4055.67, 2);
    });
  });

  describe('Affordability Calculations', () => {
    it('Test Case 13: Calculate affordability ratio (30% rule)', () => {
      const monthlyIncome = 5000;
      const inputs: RentInputs = {
        monthlyRent: 1500,
        utilities: 100,
        insurance: 20,
        parking: 50,
        otherCosts: 30,
        discount: 0,
        taxRate: 0,
        annualIncrease: 0,
        years: 1,
      };

      const results = calculateRent(inputs);
      const affordabilityRatio = (results.monthlyTotal / monthlyIncome) * 100;

      // Total: 1700
      // Ratio: 1700 / 5000 = 34%
      expect(affordabilityRatio).toBeCloseTo(34, 2);
      expect(affordabilityRatio).toBeGreaterThan(30); // Above recommended 30%
    });

    it('Test Case 14: Affordable rent scenario (under 30%)', () => {
      const monthlyIncome = 6000;
      const inputs: RentInputs = {
        monthlyRent: 1500,
        utilities: 100,
        insurance: 20,
        parking: 50,
        otherCosts: 30,
        discount: 0,
        taxRate: 0,
        annualIncrease: 0,
        years: 1,
      };

      const results = calculateRent(inputs);
      const affordabilityRatio = (results.monthlyTotal / monthlyIncome) * 100;

      // Total: 1700
      // Ratio: 1700 / 6000 = 28.33%
      expect(affordabilityRatio).toBeCloseTo(28.33, 2);
      expect(affordabilityRatio).toBeLessThan(30); // Below recommended 30%
    });
  });
});
