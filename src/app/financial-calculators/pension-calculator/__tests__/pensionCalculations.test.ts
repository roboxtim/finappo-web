/**
 * Pension Calculator - Test Suite
 *
 * Comprehensive tests covering all pension calculation scenarios:
 * - Lump sum vs. monthly pension
 * - Single-life vs. joint-and-survivor
 * - Work longer (early vs. delayed retirement)
 */

import {
  calculateLumpSumVsMonthly,
  calculateSingleLifeVsJoint,
  calculateWorkLonger,
  validateLumpSumVsMonthlyInputs,
  validateSingleLifeVsJointInputs,
  validateWorkLongerInputs,
  calculatePresentValue,
  calculateFutureValue,
  calculateTotalReceived,
  formatCurrency,
  formatPercentage,
  formatYears,
  formatMonths,
  type LumpSumVsMonthlyInputs,
  type SingleLifeVsJointInputs,
  type WorkLongerInputs,
} from './pensionCalculations';

describe('Pension Calculator - Lump Sum vs. Monthly Pension', () => {
  test('Test Case 1: Lump sum $500k vs $3k monthly, 7% return, 2% COLA', () => {
    const inputs: LumpSumVsMonthlyInputs = {
      retirementAge: 65,
      lumpSumAmount: 500000,
      monthlyPensionAmount: 3000,
      investmentReturnPercent: 7,
      colaPercent: 2,
      lifeExpectancy: 85,
    };

    const results = calculateLumpSumVsMonthly(inputs);

    // Verify basic calculations
    expect(results.lumpSumInitialValue).toBe(500000);
    expect(results.monthlyPensionInitialAmount).toBe(3000);

    // Over 20 years with 7% return, lump sum should grow significantly
    expect(results.lumpSumProjectedValue).toBeGreaterThan(1500000);
    expect(results.lumpSumProjectedValue).toBeLessThan(2500000);

    // 4% withdrawal rule on 500k = $20k/year = $1,667/month
    expect(results.lumpSumMonthlyWithdrawal).toBeCloseTo(1666.67, 1);

    // Monthly pension with 2% COLA should grow over time
    expect(results.monthlyPensionFinalAmount).toBeGreaterThan(3000);
    expect(results.monthlyPensionFinalAmount).toBeLessThan(5000);

    // Total received over 20 years
    expect(results.monthlyPensionTotalReceived).toBeGreaterThan(720000); // 3k * 240 months
    expect(results.monthlyPensionTotalReceived).toBeLessThan(900000);

    // Present value comparison
    expect(results.monthlyPensionPresentValue).toBeGreaterThan(400000);
    expect(results.monthlyPensionPresentValue).toBeLessThan(600000);

    // Break-even should occur somewhere between retirement and life expectancy
    expect(results.breakEvenAge).toBeGreaterThanOrEqual(65);
    expect(results.breakEvenAge).toBeLessThanOrEqual(85);

    // Year-by-year projections should cover entire retirement period
    expect(results.yearByYearProjection.length).toBe(21); // 0 to 20 years
    expect(results.yearByYearProjection[0].age).toBe(65);
    expect(results.yearByYearProjection[20].age).toBe(85);
  });

  test('Test Case 2: Smaller lump sum $250k vs $2k monthly, 5% return, 0% COLA', () => {
    const inputs: LumpSumVsMonthlyInputs = {
      retirementAge: 62,
      lumpSumAmount: 250000,
      monthlyPensionAmount: 2000,
      investmentReturnPercent: 5,
      colaPercent: 0,
      lifeExpectancy: 82,
    };

    const results = calculateLumpSumVsMonthly(inputs);

    expect(results.lumpSumInitialValue).toBe(250000);
    expect(results.monthlyPensionInitialAmount).toBe(2000);

    // With no COLA, final monthly amount should equal initial
    expect(results.monthlyPensionFinalAmount).toBeCloseTo(2000, 0);

    // 20 years * 12 months * $2000 = $480,000
    expect(results.monthlyPensionTotalReceived).toBeCloseTo(480000, -2);

    // 4% rule: 250k * 0.04 / 12 = $833.33/month
    expect(results.lumpSumMonthlyWithdrawal).toBeCloseTo(833.33, 1);
  });

  test('Test Case 3: Large lump sum $1M vs $5k monthly, 8% return, 3% COLA', () => {
    const inputs: LumpSumVsMonthlyInputs = {
      retirementAge: 67,
      lumpSumAmount: 1000000,
      monthlyPensionAmount: 5000,
      investmentReturnPercent: 8,
      colaPercent: 3,
      lifeExpectancy: 90,
    };

    const results = calculateLumpSumVsMonthly(inputs);

    expect(results.lumpSumInitialValue).toBe(1000000);

    // With 8% return over 23 years, should grow substantially
    expect(results.lumpSumProjectedValue).toBeGreaterThan(5000000);

    // Monthly pension with 3% COLA should compound significantly
    expect(results.monthlyPensionFinalAmount).toBeGreaterThan(8000);

    // 4% rule: 1M * 0.04 / 12 = $3,333/month
    expect(results.lumpSumMonthlyWithdrawal).toBeCloseTo(3333.33, 1);
  });

  test('Test Case 4: Edge case - Very short retirement (70 to 75)', () => {
    const inputs: LumpSumVsMonthlyInputs = {
      retirementAge: 70,
      lumpSumAmount: 300000,
      monthlyPensionAmount: 2500,
      investmentReturnPercent: 6,
      colaPercent: 1,
      lifeExpectancy: 75,
    };

    const results = calculateLumpSumVsMonthly(inputs);

    // Only 5 years of retirement
    expect(results.yearByYearProjection.length).toBe(6); // 0 to 5 years

    // Short timeframe means pension total is closer to simple calculation
    // 5 years * 12 months * ~$2500 = ~$150,000
    expect(results.monthlyPensionTotalReceived).toBeGreaterThan(145000);
    expect(results.monthlyPensionTotalReceived).toBeLessThan(160000);
  });

  test('Test Case 5: High COLA scenario (inflation protection)', () => {
    const inputs: LumpSumVsMonthlyInputs = {
      retirementAge: 65,
      lumpSumAmount: 600000,
      monthlyPensionAmount: 3500,
      investmentReturnPercent: 6,
      colaPercent: 4, // High COLA
      lifeExpectancy: 85,
    };

    const results = calculateLumpSumVsMonthly(inputs);

    // With 4% COLA, final monthly amount should be significantly higher
    // 3500 * (1.04)^20 ≈ 7,674
    expect(results.monthlyPensionFinalAmount).toBeGreaterThan(7000);
    expect(results.monthlyPensionFinalAmount).toBeLessThan(8500);

    // High COLA means pension present value should be higher
    expect(results.monthlyPensionPresentValue).toBeGreaterThan(500000);
  });

  test('Validation: Reject invalid inputs', () => {
    const invalidInputs: LumpSumVsMonthlyInputs = {
      retirementAge: 65,
      lumpSumAmount: -100000, // Invalid: negative
      monthlyPensionAmount: 0, // Invalid: zero
      investmentReturnPercent: 60, // Invalid: too high
      colaPercent: -5, // Invalid: negative
      lifeExpectancy: 60, // Invalid: less than retirement age
    };

    const errors = validateLumpSumVsMonthlyInputs(invalidInputs);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('Pension Calculator - Single-Life vs. Joint-and-Survivor', () => {
  test('Test Case 1: Single $4k vs Joint $3.6k (90%), 50% survivor benefit', () => {
    const inputs: SingleLifeVsJointInputs = {
      retirementAge: 65,
      lifeExpectancy: 85,
      spouseAgeAtRetirement: 63,
      spouseLifeExpectancy: 88,
      singleLifePensionAmount: 4000,
      jointSurvivorPensionAmount: 3600, // 90% of single life
      survivorBenefitPercent: 50,
      investmentReturnPercent: 6,
      colaPercent: 2,
    };

    const results = calculateSingleLifeVsJoint(inputs);

    // Single life pays for 20 years (65 to 85)
    expect(results.singleLifeMonthsOfPayment).toBe(240);

    // Joint survivor pays for 20 years + 3 more years for spouse (88-85)
    // Note: Spouse is 63 at start, so when you die at 85, spouse is 83, lives to 88 = 5 more years
    expect(results.jointSurvivorMonthsOfPayment).toBeGreaterThan(240);

    // Single life total should be higher monthly amount but shorter duration
    expect(results.singleLifeTotalReceived).toBeGreaterThan(800000);

    // Joint survivor total includes spouse benefits
    expect(results.jointSurvivorTotalReceived).toBeGreaterThan(
      results.singleLifeTotalReceived
    );

    // Spouse monthly amount should be 50% of joint benefit
    expect(results.jointSurvivorSpouseMonthlyAmount).toBeGreaterThan(0);

    // If you die first, joint option provides spouse protection
    expect(results.ifYouDieFirst.totalReceived).toBeGreaterThan(0);

    // Projections should cover max of both life expectancies
    expect(results.yearByYearProjection.length).toBeGreaterThan(20);
  });

  test('Test Case 2: Single $5k vs Joint $4k (80%), 75% survivor benefit', () => {
    const inputs: SingleLifeVsJointInputs = {
      retirementAge: 67,
      lifeExpectancy: 87,
      spouseAgeAtRetirement: 65,
      spouseLifeExpectancy: 90,
      singleLifePensionAmount: 5000,
      jointSurvivorPensionAmount: 4000, // 80% of single life
      survivorBenefitPercent: 75, // Higher survivor benefit
      investmentReturnPercent: 5,
      colaPercent: 1.5,
    };

    const results = calculateSingleLifeVsJoint(inputs);

    expect(results.singleLifeMonthsOfPayment).toBe(240); // 20 years

    // With higher survivor benefit (75%), spouse gets more
    // Spouse monthly should be ~75% of the final joint amount
    expect(results.jointSurvivorSpouseMonthlyAmount).toBeGreaterThan(3000);
  });

  test('Test Case 3: Single $3k vs Joint $2.7k (90%), 100% survivor benefit', () => {
    const inputs: SingleLifeVsJointInputs = {
      retirementAge: 62,
      lifeExpectancy: 82,
      spouseAgeAtRetirement: 60,
      spouseLifeExpectancy: 85,
      singleLifePensionAmount: 3000,
      jointSurvivorPensionAmount: 2700, // 90% of single life
      survivorBenefitPercent: 100, // Full continuation
      investmentReturnPercent: 7,
      colaPercent: 2.5,
    };

    const results = calculateSingleLifeVsJoint(inputs);

    // With 100% survivor benefit, spouse gets full joint amount
    // After COLA adjustments, spouse monthly should equal the grown joint amount
    expect(results.jointSurvivorSpouseMonthlyAmount).toBeGreaterThan(2700);

    // Total joint survivor should be significantly higher with 100% survivor benefit
    expect(results.jointSurvivorTotalReceived).toBeGreaterThan(
      results.singleLifeTotalReceived * 1.1
    );
  });

  test('Test Case 4: Spouse much younger (10 year age gap)', () => {
    const inputs: SingleLifeVsJointInputs = {
      retirementAge: 65,
      lifeExpectancy: 85,
      spouseAgeAtRetirement: 55, // 10 years younger
      spouseLifeExpectancy: 95, // Lives longer
      singleLifePensionAmount: 4500,
      jointSurvivorPensionAmount: 3800,
      survivorBenefitPercent: 66,
      investmentReturnPercent: 6,
      colaPercent: 2,
    };

    const results = calculateSingleLifeVsJoint(inputs);

    // Spouse will likely outlive you by many years
    // Total months should include many years of survivor benefits
    expect(results.jointSurvivorMonthsOfPayment).toBeGreaterThan(240);

    // Joint survivor option likely better due to long survivor period
    expect(results.jointSurvivorSpouseTotalReceived).toBeGreaterThan(100000);
  });

  test('Test Case 5: No COLA, equal ages', () => {
    const inputs: SingleLifeVsJointInputs = {
      retirementAge: 65,
      lifeExpectancy: 85,
      spouseAgeAtRetirement: 65,
      spouseLifeExpectancy: 85,
      singleLifePensionAmount: 3500,
      jointSurvivorPensionAmount: 3200,
      survivorBenefitPercent: 50,
      investmentReturnPercent: 5,
      colaPercent: 0, // No COLA
    };

    const results = calculateSingleLifeVsJoint(inputs);

    // With no COLA and same life expectancies, calculations are simpler
    // Single life: 3500 * 12 * 20 = 840,000
    expect(results.singleLifeTotalReceived).toBeCloseTo(840000, -2);

    // Joint survivor: 3200 * 12 * 20 = 768,000 (base, not including spouse survival)
    expect(results.jointSurvivorTotalReceived).toBeGreaterThan(760000);
  });

  test('Validation: Reject invalid inputs', () => {
    const invalidInputs: SingleLifeVsJointInputs = {
      retirementAge: 65,
      lifeExpectancy: 60, // Invalid: less than retirement age
      spouseAgeAtRetirement: 63,
      spouseLifeExpectancy: 60, // Invalid: less than spouse age
      singleLifePensionAmount: 0, // Invalid: zero
      jointSurvivorPensionAmount: 5000, // Invalid: exceeds single life
      survivorBenefitPercent: 150, // Invalid: > 100
      investmentReturnPercent: 6,
      colaPercent: 2,
    };

    const errors = validateSingleLifeVsJointInputs(invalidInputs);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('Pension Calculator - Work Longer Analysis', () => {
  test('Test Case 1: Retire at 62 ($2.5k) vs 67 ($3.5k)', () => {
    const inputs: WorkLongerInputs = {
      currentAge: 55,
      option1RetirementAge: 62,
      option1MonthlyAmount: 2500,
      option2RetirementAge: 67,
      option2MonthlyAmount: 3500,
      lifeExpectancy: 85,
      investmentReturnPercent: 6,
      colaPercent: 2,
    };

    const results = calculateWorkLonger(inputs);

    // Option 1: 23 years of retirement (62 to 85)
    expect(results.option1YearsOfRetirement).toBe(23);
    expect(results.option1MonthsOfPayment).toBe(276);

    // Option 2: 18 years of retirement (67 to 85)
    expect(results.option2YearsOfRetirement).toBe(18);
    expect(results.option2MonthsOfPayment).toBe(216);

    // Additional years worked
    expect(results.additionalYearsWorked).toBe(5);

    // Option 1 has more years but lower amount
    // Option 2 has fewer years but higher amount
    expect(results.option1TotalReceived).toBeGreaterThan(600000);
    expect(results.option2TotalReceived).toBeGreaterThan(600000);

    // Break-even age calculation
    // Note: Option 1 starts earlier, so it may accumulate value that option 2 never catches
    // Break-even could be at option 1 start age if option 1 is always ahead
    expect(results.breakEvenAge).toBeGreaterThanOrEqual(62);
    expect(results.breakEvenAge).toBeLessThanOrEqual(85);

    // Projections should start from current age
    expect(results.yearByYearProjection[0].age).toBe(55);
    expect(
      results.yearByYearProjection[results.yearByYearProjection.length - 1].age
    ).toBe(85);
  });

  test('Test Case 2: Retire at 65 ($3k) vs 70 ($4.2k)', () => {
    const inputs: WorkLongerInputs = {
      currentAge: 60,
      option1RetirementAge: 65,
      option1MonthlyAmount: 3000,
      option2RetirementAge: 70,
      option2MonthlyAmount: 4200, // 40% increase for waiting
      lifeExpectancy: 88,
      investmentReturnPercent: 5,
      colaPercent: 1.5,
    };

    const results = calculateWorkLonger(inputs);

    // Option 1: 23 years
    expect(results.option1YearsOfRetirement).toBe(23);

    // Option 2: 18 years
    expect(results.option2YearsOfRetirement).toBe(18);

    // Additional years worked
    expect(results.additionalYearsWorked).toBe(5);

    // Both options should have substantial totals
    expect(results.option1TotalReceived).toBeGreaterThan(700000);
    expect(results.option2TotalReceived).toBeGreaterThan(700000);
  });

  test('Test Case 3: Small difference - 65 vs 66', () => {
    const inputs: WorkLongerInputs = {
      currentAge: 62,
      option1RetirementAge: 65,
      option1MonthlyAmount: 3000,
      option2RetirementAge: 66,
      option2MonthlyAmount: 3200, // Small increase
      lifeExpectancy: 85,
      investmentReturnPercent: 6,
      colaPercent: 2,
    };

    const results = calculateWorkLonger(inputs);

    // Only 1 year difference
    expect(results.additionalYearsWorked).toBe(1);

    // Option 1: 20 years
    expect(results.option1YearsOfRetirement).toBe(20);

    // Option 2: 19 years
    expect(results.option2YearsOfRetirement).toBe(19);

    // Totals should be relatively close
    const ratio = results.option1TotalReceived / results.option2TotalReceived;
    expect(ratio).toBeGreaterThan(0.95);
    expect(ratio).toBeLessThan(1.05);
  });

  test('Test Case 4: High COLA affects both options', () => {
    const inputs: WorkLongerInputs = {
      currentAge: 58,
      option1RetirementAge: 62,
      option1MonthlyAmount: 2800,
      option2RetirementAge: 67,
      option2MonthlyAmount: 3800,
      lifeExpectancy: 87,
      investmentReturnPercent: 7,
      colaPercent: 3.5, // High COLA
    };

    const results = calculateWorkLonger(inputs);

    // With high COLA, final amounts should be significantly higher
    const finalProjection =
      results.yearByYearProjection[results.yearByYearProjection.length - 1];

    // Option 1 monthly should have grown substantially over 25 years
    expect(finalProjection.option1MonthlyAmount).toBeGreaterThan(5000);

    // Both totals should be high due to COLA
    expect(results.option1TotalReceived).toBeGreaterThan(1000000);
    expect(results.option2TotalReceived).toBeGreaterThan(800000);
  });

  test('Test Case 5: No COLA, equal amounts (testing break-even)', () => {
    const inputs: WorkLongerInputs = {
      currentAge: 60,
      option1RetirementAge: 65,
      option1MonthlyAmount: 3000,
      option2RetirementAge: 67,
      option2MonthlyAmount: 3000, // Same amount
      lifeExpectancy: 85,
      investmentReturnPercent: 5,
      colaPercent: 0,
    };

    const results = calculateWorkLonger(inputs);

    // With same monthly amounts, option 1 (earlier retirement) should win
    expect(results.betterOption).toBe('option1');

    // Option 1 gets 2 more years of payments
    // 2 years * 12 months * $3000 = $72,000 more
    expect(results.option1TotalReceived).toBeGreaterThan(
      results.option2TotalReceived + 70000
    );
  });

  test('Validation: Reject invalid inputs', () => {
    const invalidInputs: WorkLongerInputs = {
      currentAge: 60,
      option1RetirementAge: 55, // Invalid: before current age
      option1MonthlyAmount: 0, // Invalid: zero
      option2RetirementAge: 55, // Invalid: before current age
      option2MonthlyAmount: -1000, // Invalid: negative
      lifeExpectancy: 50, // Invalid: before retirement ages
      investmentReturnPercent: 6,
      colaPercent: 2,
    };

    const errors = validateWorkLongerInputs(invalidInputs);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('Helper Functions', () => {
  test('calculatePresentValue: Simple annuity (no growth)', () => {
    const pv = calculatePresentValue(1000, 120, 6, 0);

    // PV of $1000/month for 10 years at 6% should be around $90k
    expect(pv).toBeGreaterThan(80000);
    expect(pv).toBeLessThan(100000);
  });

  test('calculatePresentValue: Growing annuity', () => {
    const pv = calculatePresentValue(1000, 120, 6, 2);

    // With 2% growth, PV should be higher than no-growth case
    expect(pv).toBeGreaterThan(90000);
  });

  test('calculateFutureValue: 10 years at 7%', () => {
    const fv = calculateFutureValue(100000, 7, 10);

    // 100k at 7% for 10 years: 100k * 1.07^10 ≈ 196,715
    expect(fv).toBeCloseTo(196715, -2);
  });

  test('calculateFutureValue: 0 years returns principal', () => {
    const fv = calculateFutureValue(100000, 7, 0);
    expect(fv).toBe(100000);
  });

  test('calculateTotalReceived: No COLA', () => {
    const total = calculateTotalReceived(1000, 120, 0);

    // 1000 * 120 = 120,000
    expect(total).toBeCloseTo(120000, 0);
  });

  test('calculateTotalReceived: With 2% COLA', () => {
    const total = calculateTotalReceived(1000, 120, 2);

    // Should be more than simple 120k due to growth
    expect(total).toBeGreaterThan(120000);
    expect(total).toBeLessThan(140000);
  });

  test('formatCurrency: Various amounts', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1234567)).toBe('$1,234,567');
    expect(formatCurrency(999.99)).toBe('$1,000');
  });

  test('formatPercentage: Various values', () => {
    expect(formatPercentage(5.5)).toBe('5.5%');
    expect(formatPercentage(10, 0)).toBe('10%');
    expect(formatPercentage(3.14159, 2)).toBe('3.14%');
  });

  test('formatYears: Singular and plural', () => {
    expect(formatYears(1)).toBe('1 year');
    expect(formatYears(5)).toBe('5 years');
    expect(formatYears(20)).toBe('20 years');
  });

  test('formatMonths: Various durations', () => {
    expect(formatMonths(6)).toBe('6 months');
    expect(formatMonths(12)).toBe('1 year');
    expect(formatMonths(24)).toBe('2 years');
    expect(formatMonths(18)).toBe('1 year, 6 months');
    expect(formatMonths(25)).toBe('2 years, 1 month');
  });
});
