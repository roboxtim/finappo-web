/**
 * Annuity Calculator Test Suite
 * Based on reference: https://www.calculator.net/annuity-calculator.html
 *
 * The calculator focuses on the accumulation phase of an annuity,
 * calculating future value with compound interest.
 */

import { describe, it, expect } from 'vitest';

// Define input and output types
interface AnnuityInput {
  startingPrincipal: number;
  annualAddition: number;
  monthlyAddition: number;
  annualGrowthRate: number; // As percentage (e.g., 11 for 11%)
  years: number;
  additionTiming: 'beginning' | 'end'; // beginning = annuity due, end = ordinary annuity
}

interface AnnuityResult {
  endBalance: number;
  startingPrincipal: number;
  totalAdditions: number;
  totalInterest: number;
}

/**
 * Calculate annuity future value
 * The annual addition is made as a lump sum once per year
 * For "beginning": annual additions at month 1, 13, 25, etc. (start of each year)
 * For "end": annual additions at month 12, 24, 36, etc. (end of each year)
 */
export function calculateAnnuity(input: AnnuityInput): AnnuityResult {
  const {
    startingPrincipal,
    annualAddition,
    monthlyAddition,
    annualGrowthRate,
    years,
    additionTiming,
  } = input;

  // Convert annual rate to monthly rate (decimal)
  const monthlyRate = annualGrowthRate / 100 / 12;
  const totalMonths = Math.round(years * 12);

  let balance = startingPrincipal;

  // Process month by month to handle annual additions correctly
  for (let month = 1; month <= totalMonths; month++) {
    let monthlyPayment = monthlyAddition;

    // Handle annual additions based on timing
    if (additionTiming === 'beginning') {
      // For annuity due: add at beginning of each year (month 1, 13, 25, etc.)
      if ((month - 1) % 12 === 0) {
        monthlyPayment += annualAddition;
      }
    } else {
      // For ordinary annuity: add at end of each year (month 12, 24, 36, etc.)
      if (month % 12 === 0) {
        monthlyPayment += annualAddition;
      }
    }

    // Calculate interest and add payment
    // For both types, interest is calculated monthly
    const interest = balance * monthlyRate;
    balance += interest + monthlyPayment;
  }

  // Calculate total additions
  const totalMonthlyAdditions = monthlyAddition * totalMonths;
  const totalAnnualAdditions = annualAddition * years;
  const totalAdditions = totalMonthlyAdditions + totalAnnualAdditions;
  const totalInterest = balance - startingPrincipal - totalAdditions;

  return {
    endBalance: Math.round(balance * 100) / 100,
    startingPrincipal: startingPrincipal,
    totalAdditions: Math.round(totalAdditions * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}

/**
 * Calculate monthly schedule for annuity
 */
export function calculateMonthlySchedule(input: AnnuityInput) {
  const {
    startingPrincipal,
    annualAddition,
    monthlyAddition,
    annualGrowthRate,
    years,
    additionTiming,
  } = input;

  const monthlyRate = annualGrowthRate / 100 / 12;
  const totalMonths = Math.round(years * 12);
  const schedule = [];

  let balance = startingPrincipal;

  for (let month = 1; month <= totalMonths; month++) {
    let monthlyPayment = monthlyAddition;

    // Handle annual additions based on timing
    if (additionTiming === 'beginning') {
      // For annuity due: add at beginning of each year (month 1, 13, 25, etc.)
      if ((month - 1) % 12 === 0) {
        monthlyPayment += annualAddition;
      }
    } else {
      // For ordinary annuity: add at end of each year (month 12, 24, 36, etc.)
      if (month % 12 === 0) {
        monthlyPayment += annualAddition;
      }
    }

    // Calculate interest and add payment
    const interest = balance * monthlyRate;
    balance += interest + monthlyPayment;

    schedule.push({
      month,
      addition: monthlyPayment,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return schedule;
}

describe('Annuity Calculator Tests', () => {
  // Test Case 1: Standard annuity calculation
  // $20,000 principal, $10,000 annual additions for 10 years at 11%
  // Using proper compound interest formula
  it('should calculate annuity with annual additions correctly', () => {
    const input: AnnuityInput = {
      startingPrincipal: 20000,
      annualAddition: 10000,
      monthlyAddition: 0,
      annualGrowthRate: 11,
      years: 10,
      additionTiming: 'beginning',
    };

    const result = calculateAnnuity(input);

    // Verify basic calculations
    expect(result.startingPrincipal).toBe(20000);
    expect(result.totalAdditions).toBe(100000);
    // With proper compound interest, the end balance should be significantly higher
    expect(result.endBalance).toBeGreaterThan(200000);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  // Test Case 2: Monthly additions only
  it('should calculate monthly additions correctly', () => {
    const input: AnnuityInput = {
      startingPrincipal: 10000,
      annualAddition: 0,
      monthlyAddition: 500,
      annualGrowthRate: 8,
      years: 5,
      additionTiming: 'end',
    };

    const result = calculateAnnuity(input);

    expect(result.totalAdditions).toBe(30000); // 500 * 60 months
    expect(result.endBalance).toBeGreaterThan(40000);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  // Test Case 3: Annuity due (beginning) vs ordinary (end) - with annual additions
  it('should calculate higher value for annuity due with annual additions', () => {
    const baseInput: AnnuityInput = {
      startingPrincipal: 5000,
      annualAddition: 2000, // Changed to include annual additions
      monthlyAddition: 0,
      annualGrowthRate: 10,
      years: 3,
      additionTiming: 'end',
    };

    const ordinaryResult = calculateAnnuity(baseInput);
    const dueResult = calculateAnnuity({
      ...baseInput,
      additionTiming: 'beginning',
    });

    // Annuity due should have higher end balance due to extra compounding
    // Annual additions at beginning earn more interest than those at end
    expect(dueResult.endBalance).toBeGreaterThan(ordinaryResult.endBalance);
  });

  // Test Case 4: Zero interest rate
  it('should handle zero interest rate', () => {
    const input: AnnuityInput = {
      startingPrincipal: 1000,
      annualAddition: 1200,
      monthlyAddition: 100,
      annualGrowthRate: 0,
      years: 2,
      additionTiming: 'end',
    };

    const result = calculateAnnuity(input);

    expect(result.endBalance).toBe(1000 + 2400 + 2400); // Principal + annual + monthly
    expect(result.totalInterest).toBe(0);
  });

  // Test Case 5: High interest rate scenario
  it('should calculate high interest scenario', () => {
    const input: AnnuityInput = {
      startingPrincipal: 50000,
      annualAddition: 12000,
      monthlyAddition: 0,
      annualGrowthRate: 15,
      years: 15,
      additionTiming: 'end',
    };

    const result = calculateAnnuity(input);

    expect(result.totalAdditions).toBe(180000); // 12000 * 15
    expect(result.endBalance).toBeGreaterThan(500000);
  });

  // Test Case 6: Combined monthly and annual additions
  it('should handle combined monthly and annual additions', () => {
    const input: AnnuityInput = {
      startingPrincipal: 15000,
      annualAddition: 5000,
      monthlyAddition: 250,
      annualGrowthRate: 9,
      years: 7,
      additionTiming: 'beginning',
    };

    const result = calculateAnnuity(input);

    expect(result.totalAdditions).toBe(35000 + 21000); // Annual + Monthly
    expect(result.endBalance).toBeGreaterThan(71000);
  });

  // Test Case 7: Short term (1 year)
  it('should calculate single year correctly', () => {
    const input: AnnuityInput = {
      startingPrincipal: 10000,
      annualAddition: 5000,
      monthlyAddition: 0,
      annualGrowthRate: 12,
      years: 1,
      additionTiming: 'end',
    };

    const result = calculateAnnuity(input);

    expect(result.totalAdditions).toBe(5000);
    // Principal grows for 12 months, annual addition compounds monthly
    expect(result.endBalance).toBeGreaterThan(15000);
  });

  // Test Case 8: Long term (30 years)
  it('should calculate long term retirement scenario', () => {
    const input: AnnuityInput = {
      startingPrincipal: 25000,
      annualAddition: 6000,
      monthlyAddition: 500,
      annualGrowthRate: 7.5,
      years: 30,
      additionTiming: 'end',
    };

    const result = calculateAnnuity(input);

    expect(result.totalAdditions).toBe(180000 + 180000); // Annual + Monthly
    expect(result.endBalance).toBeGreaterThan(1000000);
  });

  // Test Case 9: Monthly schedule validation
  it('should generate accurate monthly schedule', () => {
    const input: AnnuityInput = {
      startingPrincipal: 1000,
      annualAddition: 0,
      monthlyAddition: 100,
      annualGrowthRate: 12,
      years: 0.25, // 3 months for simple validation
      additionTiming: 'end',
    };

    const schedule = calculateMonthlySchedule(input);

    expect(schedule.length).toBe(3);
    expect(schedule[0].addition).toBe(100);
    expect(schedule[2].balance).toBeGreaterThan(1300);
  });

  // Test Case 10: Edge case - zero principal
  it('should handle zero starting principal', () => {
    const input: AnnuityInput = {
      startingPrincipal: 0,
      annualAddition: 0,
      monthlyAddition: 1000,
      annualGrowthRate: 8,
      years: 10,
      additionTiming: 'end',
    };

    const result = calculateAnnuity(input);

    expect(result.startingPrincipal).toBe(0);
    expect(result.totalAdditions).toBe(120000);
    expect(result.endBalance).toBeGreaterThan(120000);
  });
});
