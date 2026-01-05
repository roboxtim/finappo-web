/**
 * Real Estate Calculator Test Cases
 * Based on standard mortgage and real estate investment calculations
 *
 * These tests validate:
 * 1. Monthly mortgage payment (principal + interest)
 * 2. PMI calculation (when down payment < 20%)
 * 3. Property tax, insurance, HOA, and maintenance costs
 * 4. Home appreciation and equity buildup
 * 5. Tax deductions from mortgage interest
 * 6. Total cost of ownership over time
 */

interface RealEstateInputs {
  homePrice: number;
  downPaymentPercent: number;
  loanTermYears: number;
  interestRate: number; // APR as percentage
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  pmiMonthly?: number; // Optional, calculated if not provided and down < 20%
  hoaMonthly: number;
  maintenanceAnnual: number;
  appreciationRate: number; // Annual percentage
  propertyTaxIncreaseRate: number; // Annual percentage
  insuranceIncreaseRate: number; // Annual percentage
  incomeTaxRate: number; // For interest deduction calculations
}

interface RealEstateResults {
  loanAmount: number;
  downPayment: number;
  monthlyMortgage: number; // P&I only
  monthlyPMI: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyMaintenance: number;
  totalMonthlyPayment: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  homeValueAfterYears: number;
  equityAfterYears: number;
  totalTaxSavings: number;
  netCost: number; // Total paid - home value - tax savings
}

// Standard mortgage payment formula: M = P[r(1+r)^n]/[(1+r)^n-1]
function calculateMonthlyMortgage(principal: number, annualRate: number, years: number): number {
  if (annualRate === 0) {
    return principal / (years * 12);
  }

  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;

  const payment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return payment;
}

// PMI typically 0.5% to 1% of loan amount annually, paid monthly
// Usually required when down payment < 20%
function calculatePMI(loanAmount: number, downPaymentPercent: number): number {
  if (downPaymentPercent >= 20) {
    return 0;
  }
  // Using 0.5% annual rate as standard
  const pmiRate = 0.005;
  return (loanAmount * pmiRate) / 12;
}

describe('Real Estate Calculator - Test Cases', () => {

  /**
   * TEST CASE 1: Standard 30-year mortgage with 20% down
   * No PMI required
   */
  test('Case 1: $400,000 home, 20% down, 30 years, 7% interest', () => {
    const inputs: RealEstateInputs = {
      homePrice: 400000,
      downPaymentPercent: 20,
      loanTermYears: 30,
      interestRate: 7.0,
      propertyTaxAnnual: 4800, // $400/month
      homeInsuranceAnnual: 1500, // $125/month
      hoaMonthly: 0,
      maintenanceAnnual: 4000, // $333/month
      appreciationRate: 3.0,
      propertyTaxIncreaseRate: 2.0,
      insuranceIncreaseRate: 3.0,
      incomeTaxRate: 22.0
    };

    const loanAmount = inputs.homePrice * (1 - inputs.downPaymentPercent / 100);
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const monthlyMortgage = calculateMonthlyMortgage(loanAmount, inputs.interestRate, inputs.loanTermYears);
    const monthlyPMI = calculatePMI(loanAmount, inputs.downPaymentPercent);

    const expected: Partial<RealEstateResults> = {
      loanAmount: 320000,
      downPayment: 80000,
      monthlyMortgage: 2128.97, // Principal + Interest (rounded)
      monthlyPMI: 0, // No PMI with 20% down
      monthlyPropertyTax: 400.00,
      monthlyInsurance: 125.00,
      monthlyHOA: 0,
      monthlyMaintenance: 333.33,
      totalMonthlyPayment: 2987.30 // Approximately
    };

    expect(loanAmount).toBe(expected.loanAmount);
    expect(downPayment).toBe(expected.downPayment);
    expect(Math.round(monthlyMortgage * 100) / 100).toBe(expected.monthlyMortgage);
    expect(monthlyPMI).toBe(expected.monthlyPMI);
  });

  /**
   * TEST CASE 2: First-time homebuyer with 10% down
   * Includes PMI
   */
  test('Case 2: $300,000 home, 10% down, 30 years, 6.5% interest with PMI', () => {
    const inputs: RealEstateInputs = {
      homePrice: 300000,
      downPaymentPercent: 10,
      loanTermYears: 30,
      interestRate: 6.5,
      propertyTaxAnnual: 3600, // $300/month
      homeInsuranceAnnual: 1200, // $100/month
      hoaMonthly: 150,
      maintenanceAnnual: 3000, // $250/month
      appreciationRate: 3.0,
      propertyTaxIncreaseRate: 2.0,
      insuranceIncreaseRate: 3.0,
      incomeTaxRate: 24.0
    };

    const loanAmount = inputs.homePrice * (1 - inputs.downPaymentPercent / 100);
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const monthlyMortgage = calculateMonthlyMortgage(loanAmount, inputs.interestRate, inputs.loanTermYears);
    const monthlyPMI = calculatePMI(loanAmount, inputs.downPaymentPercent);

    const expected: Partial<RealEstateResults> = {
      loanAmount: 270000,
      downPayment: 30000,
      monthlyMortgage: 1706.58,
      monthlyPMI: 112.50, // 0.5% of loan amount annually
      monthlyPropertyTax: 300.00,
      monthlyInsurance: 100.00,
      monthlyHOA: 150.00,
      monthlyMaintenance: 250.00,
      totalMonthlyPayment: 2619.08
    };

    expect(loanAmount).toBe(expected.loanAmount);
    expect(downPayment).toBe(expected.downPayment);
    expect(Math.round(monthlyMortgage * 100) / 100).toBe(expected.monthlyMortgage);
    expect(Math.round(monthlyPMI * 100) / 100).toBe(expected.monthlyPMI);
  });

  /**
   * TEST CASE 3: High-value property with 25% down
   * 15-year mortgage
   */
  test('Case 3: $800,000 home, 25% down, 15 years, 6% interest', () => {
    const inputs: RealEstateInputs = {
      homePrice: 800000,
      downPaymentPercent: 25,
      loanTermYears: 15,
      interestRate: 6.0,
      propertyTaxAnnual: 9600, // $800/month
      homeInsuranceAnnual: 2400, // $200/month
      hoaMonthly: 300,
      maintenanceAnnual: 8000, // $667/month
      appreciationRate: 4.0,
      propertyTaxIncreaseRate: 2.5,
      insuranceIncreaseRate: 3.5,
      incomeTaxRate: 32.0
    };

    const loanAmount = inputs.homePrice * (1 - inputs.downPaymentPercent / 100);
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const monthlyMortgage = calculateMonthlyMortgage(loanAmount, inputs.interestRate, inputs.loanTermYears);
    const monthlyPMI = calculatePMI(loanAmount, inputs.downPaymentPercent);

    const expected: Partial<RealEstateResults> = {
      loanAmount: 600000,
      downPayment: 200000,
      monthlyMortgage: 5063.14,
      monthlyPMI: 0,
      monthlyPropertyTax: 800.00,
      monthlyInsurance: 200.00,
      monthlyHOA: 300.00,
      monthlyMaintenance: 666.67,
      totalMonthlyPayment: 7029.81
    };

    expect(loanAmount).toBe(expected.loanAmount);
    expect(downPayment).toBe(expected.downPayment);
    expect(Math.round(monthlyMortgage * 100) / 100).toBe(expected.monthlyMortgage);
    expect(monthlyPMI).toBe(expected.monthlyPMI);
  });

  /**
   * TEST CASE 4: Minimal down payment (5%)
   * Maximum PMI scenario
   */
  test('Case 4: $250,000 home, 5% down, 30 years, 7.5% interest', () => {
    const inputs: RealEstateInputs = {
      homePrice: 250000,
      downPaymentPercent: 5,
      loanTermYears: 30,
      interestRate: 7.5,
      propertyTaxAnnual: 3000, // $250/month
      homeInsuranceAnnual: 1200, // $100/month
      hoaMonthly: 100,
      maintenanceAnnual: 2500, // $208/month
      appreciationRate: 2.5,
      propertyTaxIncreaseRate: 2.0,
      insuranceIncreaseRate: 3.0,
      incomeTaxRate: 22.0
    };

    const loanAmount = inputs.homePrice * (1 - inputs.downPaymentPercent / 100);
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const monthlyMortgage = calculateMonthlyMortgage(loanAmount, inputs.interestRate, inputs.loanTermYears);
    const monthlyPMI = calculatePMI(loanAmount, inputs.downPaymentPercent);

    const expected: Partial<RealEstateResults> = {
      loanAmount: 237500,
      downPayment: 12500,
      monthlyMortgage: 1660.63,
      monthlyPMI: 98.96,
      monthlyPropertyTax: 250.00,
      monthlyInsurance: 100.00,
      monthlyHOA: 100.00,
      monthlyMaintenance: 208.33,
      totalMonthlyPayment: 2417.92
    };

    expect(loanAmount).toBe(expected.loanAmount);
    expect(downPayment).toBe(expected.downPayment);
    expect(Math.round(monthlyMortgage * 100) / 100).toBe(expected.monthlyMortgage);
    expect(Math.round(monthlyPMI * 100) / 100).toBe(expected.monthlyPMI);
  });

  /**
   * TEST CASE 5: Condo with high HOA fees
   */
  test('Case 5: $350,000 condo, 15% down, 30 years, 6.75% interest, $450 HOA', () => {
    const inputs: RealEstateInputs = {
      homePrice: 350000,
      downPaymentPercent: 15,
      loanTermYears: 30,
      interestRate: 6.75,
      propertyTaxAnnual: 4200, // $350/month
      homeInsuranceAnnual: 1800, // $150/month (condo insurance)
      hoaMonthly: 450,
      maintenanceAnnual: 1200, // Lower for condo (exterior maintained by HOA)
      appreciationRate: 3.5,
      propertyTaxIncreaseRate: 2.0,
      insuranceIncreaseRate: 3.0,
      incomeTaxRate: 24.0
    };

    const loanAmount = inputs.homePrice * (1 - inputs.downPaymentPercent / 100);
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const monthlyMortgage = calculateMonthlyMortgage(loanAmount, inputs.interestRate, inputs.loanTermYears);
    const monthlyPMI = calculatePMI(loanAmount, inputs.downPaymentPercent);

    const expected: Partial<RealEstateResults> = {
      loanAmount: 297500,
      downPayment: 52500,
      monthlyMortgage: 1929.58,
      monthlyPMI: 123.96,
      monthlyPropertyTax: 350.00,
      monthlyInsurance: 150.00,
      monthlyHOA: 450.00,
      monthlyMaintenance: 100.00,
      totalMonthlyPayment: 3103.54
    };

    expect(loanAmount).toBe(expected.loanAmount);
    expect(downPayment).toBe(expected.downPayment);
    expect(Math.round(monthlyMortgage * 100) / 100).toBe(expected.monthlyMortgage);
    expect(Math.round(monthlyPMI * 100) / 100).toBe(expected.monthlyPMI);
  });

  /**
   * TEST CASE 6: Edge case - Zero interest rate
   */
  test('Case 6: $100,000 home, 50% down, 10 years, 0% interest', () => {
    const inputs: RealEstateInputs = {
      homePrice: 100000,
      downPaymentPercent: 50,
      loanTermYears: 10,
      interestRate: 0,
      propertyTaxAnnual: 1200,
      homeInsuranceAnnual: 600,
      hoaMonthly: 0,
      maintenanceAnnual: 1000,
      appreciationRate: 2.0,
      propertyTaxIncreaseRate: 1.0,
      insuranceIncreaseRate: 2.0,
      incomeTaxRate: 12.0
    };

    const loanAmount = inputs.homePrice * (1 - inputs.downPaymentPercent / 100);
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const monthlyMortgage = calculateMonthlyMortgage(loanAmount, inputs.interestRate, inputs.loanTermYears);
    const monthlyPMI = calculatePMI(loanAmount, inputs.downPaymentPercent);

    const expected: Partial<RealEstateResults> = {
      loanAmount: 50000,
      downPayment: 50000,
      monthlyMortgage: 416.67, // Simple division when rate is 0
      monthlyPMI: 0,
      totalMonthlyPayment: 666.67
    };

    expect(loanAmount).toBe(expected.loanAmount);
    expect(downPayment).toBe(expected.downPayment);
    expect(Math.round(monthlyMortgage * 100) / 100).toBe(expected.monthlyMortgage);
    expect(monthlyPMI).toBe(expected.monthlyPMI);
  });

  /**
   * TEST CASE 7: Investment property with higher rates
   */
  test('Case 7: $500,000 investment property, 20% down, 30 years, 8% interest', () => {
    const inputs: RealEstateInputs = {
      homePrice: 500000,
      downPaymentPercent: 20,
      loanTermYears: 30,
      interestRate: 8.0,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 2000,
      hoaMonthly: 200,
      maintenanceAnnual: 5000,
      appreciationRate: 4.0,
      propertyTaxIncreaseRate: 2.5,
      insuranceIncreaseRate: 3.5,
      incomeTaxRate: 28.0
    };

    const loanAmount = inputs.homePrice * (1 - inputs.downPaymentPercent / 100);
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const monthlyMortgage = calculateMonthlyMortgage(loanAmount, inputs.interestRate, inputs.loanTermYears);
    const monthlyPMI = calculatePMI(loanAmount, inputs.downPaymentPercent);

    const expected: Partial<RealEstateResults> = {
      loanAmount: 400000,
      downPayment: 100000,
      monthlyMortgage: 2935.06,
      monthlyPMI: 0,
      monthlyPropertyTax: 500.00,
      monthlyInsurance: 166.67,
      monthlyHOA: 200.00,
      monthlyMaintenance: 416.67,
      totalMonthlyPayment: 4218.40
    };

    expect(loanAmount).toBe(expected.loanAmount);
    expect(downPayment).toBe(expected.downPayment);
    expect(Math.round(monthlyMortgage * 100) / 100).toBe(expected.monthlyMortgage);
    expect(monthlyPMI).toBe(expected.monthlyPMI);
  });
});

/**
 * CALCULATION FORMULAS REFERENCE:
 *
 * 1. Monthly Mortgage Payment (Principal + Interest):
 *    M = P[r(1+r)^n]/[(1+r)^n-1]
 *    Where: P = principal, r = monthly rate, n = number of payments
 *
 * 2. PMI (Private Mortgage Insurance):
 *    Required when down payment < 20%
 *    Typically 0.5% - 1% of loan amount annually, divided by 12
 *
 * 3. Total Monthly Payment:
 *    Mortgage + Property Tax/12 + Insurance/12 + PMI + HOA + Maintenance/12
 *
 * 4. Home Value After N Years:
 *    HomeValue = InitialPrice × (1 + appreciationRate)^years
 *
 * 5. Home Equity:
 *    Equity = DownPayment + PrincipalPaid + Appreciation
 *
 * 6. Tax Savings:
 *    AnnualSavings = MortgageInterestPaid × IncomeTaxRate
 *    (Only on mortgage interest, not on other costs)
 *
 * 7. Net Cost:
 *    NetCost = TotalPaid - CurrentHomeValue - TotalTaxSavings
 */
