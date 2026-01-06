export interface RentVsBuyInputs {
  // Home Purchase
  homePrice: number;
  downPaymentPercent: number;
  mortgageRate: number;
  loanTermYears: number;
  buyingClosingCosts: number;
  propertyTaxRate: number; // Annual percentage of home value
  homeInsuranceAnnual: number;
  hoaFeesMonthly: number;
  maintenancePercent: number; // Annual percentage of home value
  homeAppreciationRate: number; // Annual percentage
  sellingClosingCostsPercent: number; // Percentage of sale price

  // Rental
  monthlyRent: number;
  rentIncreaseRate: number; // Annual percentage
  rentersInsuranceMonthly: number;
  securityDeposit: number;

  // Financial
  yearsToStay: number;
  marginalTaxRate: number; // Combined federal and state
  investmentReturnRate: number; // Annual percentage
}

export interface RentVsBuyResults {
  // Key Metrics
  totalBuyCost: number;
  totalRentCost: number;
  netDifference: number;
  betterOption: 'Buying' | 'Renting';
  breakEvenYear: number | null;

  // Buying Details
  downPaymentAmount: number;
  loanAmount: number;
  monthlyMortgagePayment: number;
  monthlyHousingCost: number; // All-in monthly cost Year 1
  totalInterestPaid: number;
  totalPropertyTax: number;
  totalInsurance: number;
  totalHOA: number;
  totalMaintenance: number;
  homeValueAtEnd: number;
  homeEquity: number;
  totalTaxSavings: number;
  sellingCosts: number;

  // Renting Details
  totalRentPaid: number;
  totalRentersInsurance: number;
  averageMonthlyRent: number;

  // Opportunity Cost
  opportunityCost: number;

  // Detailed Breakdowns
  totalBuyCostBreakdown: {
    downPayment: number;
    closingCosts: number;
    mortgagePayments: number;
    propertyTax: number;
    insurance: number;
    hoa: number;
    maintenance: number;
    sellingCosts: number;
    lessHomeEquity: number;
    lessTaxSavings: number;
  };

  totalRentCostBreakdown: {
    rent: number;
    rentersInsurance: number;
    securityDeposit: number;
  };

  // Year-by-year analysis
  yearlyBreakdown: Array<{
    year: number;
    buyMonthlyAvg: number;
    rentMonthly: number;
    cumulativeBuyCost: number;
    cumulativeRentCost: number;
    homeEquity: number;
  }>;
}

/**
 * Calculate monthly mortgage payment using standard amortization formula
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  if (principal <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);

  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return payment;
}

/**
 * Calculate remaining loan balance after n months
 */
function calculateRemainingBalance(
  principal: number,
  annualRate: number,
  years: number,
  monthsPaid: number
): number {
  if (annualRate === 0) {
    const totalPayments = years * 12;
    return principal * (1 - monthsPaid / totalPayments);
  }

  const monthlyRate = annualRate / 12;
  const totalPayments = years * 12;

  const balance =
    (principal *
      (Math.pow(1 + monthlyRate, totalPayments) -
        Math.pow(1 + monthlyRate, monthsPaid))) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  return Math.max(0, balance);
}

/**
 * Calculate mortgage interest paid in a specific year
 */
function calculateYearlyInterest(
  principal: number,
  annualRate: number,
  years: number,
  yearNumber: number
): number {
  if (annualRate === 0) return 0;

  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
  const startMonth = (yearNumber - 1) * 12;
  const endMonth = Math.min(yearNumber * 12, years * 12);

  let totalInterest = 0;
  let remainingBalance = calculateRemainingBalance(
    principal,
    annualRate,
    years,
    startMonth
  );

  for (let month = startMonth; month < endMonth; month++) {
    const interestPayment = remainingBalance * (annualRate / 12);
    totalInterest += interestPayment;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
  }

  return totalInterest;
}

/**
 * Calculate total cost of buying over the specified period
 */
export function calculateTotalBuyingCost(inputs: RentVsBuyInputs): number {
  const downPayment = (inputs.homePrice * inputs.downPaymentPercent) / 100;
  const loanAmount = inputs.homePrice - downPayment;
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    inputs.mortgageRate / 100,
    inputs.loanTermYears
  );

  const monthsToStay = Math.min(
    inputs.yearsToStay * 12,
    inputs.loanTermYears * 12
  );
  const totalMortgagePayments = monthlyPayment * monthsToStay;

  // Calculate recurring costs with appreciation/inflation
  let totalPropertyTax = 0;
  let totalInsurance = 0;
  let totalHOA = 0;
  let totalMaintenance = 0;
  let currentHomeValue = inputs.homePrice;

  for (let year = 1; year <= inputs.yearsToStay; year++) {
    // Property tax and maintenance are based on home value
    totalPropertyTax += (currentHomeValue * inputs.propertyTaxRate) / 100;
    totalMaintenance += (currentHomeValue * inputs.maintenancePercent) / 100;

    // Insurance and HOA with general inflation (using same as appreciation for simplicity)
    const inflationFactor = Math.pow(
      1 + inputs.homeAppreciationRate / 100,
      year - 1
    );
    totalInsurance += inputs.homeInsuranceAnnual * inflationFactor;
    totalHOA += inputs.hoaFeesMonthly * 12 * inflationFactor;

    // Appreciate home value for next year
    currentHomeValue *= 1 + inputs.homeAppreciationRate / 100;
  }

  // Calculate home equity (principal paid + appreciation)
  const remainingBalance = calculateRemainingBalance(
    loanAmount,
    inputs.mortgageRate / 100,
    inputs.loanTermYears,
    monthsToStay
  );
  const homeEquity = currentHomeValue - remainingBalance;

  // Calculate tax savings
  let totalTaxSavings = 0;
  for (let year = 1; year <= inputs.yearsToStay; year++) {
    const yearlyInterest = calculateYearlyInterest(
      loanAmount,
      inputs.mortgageRate / 100,
      inputs.loanTermYears,
      year
    );
    const yearlyPropertyTax =
      (inputs.homePrice *
        Math.pow(1 + inputs.homeAppreciationRate / 100, year - 1) *
        inputs.propertyTaxRate) /
      100;

    // Standard deduction limits benefit of itemizing
    // Simplified: assume itemizing if interest + property tax > $13,850 (single) or $27,700 (married)
    const deductibleAmount = yearlyInterest + yearlyPropertyTax;
    const standardDeduction = 27700; // Assume married for now

    if (deductibleAmount > standardDeduction) {
      totalTaxSavings +=
        ((deductibleAmount - standardDeduction) * inputs.marginalTaxRate) / 100;
    }
  }

  // Selling costs
  const sellingCosts =
    (currentHomeValue * inputs.sellingClosingCostsPercent) / 100;

  // Total cost = All payments - equity gained - tax savings
  const totalCost =
    downPayment +
    inputs.buyingClosingCosts +
    totalMortgagePayments +
    totalPropertyTax +
    totalInsurance +
    totalHOA +
    totalMaintenance +
    sellingCosts -
    homeEquity -
    totalTaxSavings;

  return totalCost;
}

/**
 * Calculate total cost of renting over the specified period
 */
export function calculateTotalRentingCost(inputs: RentVsBuyInputs): number {
  let totalRent = 0;
  let currentMonthlyRent = inputs.monthlyRent;

  for (let year = 1; year <= inputs.yearsToStay; year++) {
    totalRent += currentMonthlyRent * 12;
    currentMonthlyRent *= 1 + inputs.rentIncreaseRate / 100;
  }

  const totalRentersInsurance =
    inputs.rentersInsuranceMonthly * 12 * inputs.yearsToStay;

  // Opportunity cost on security deposit (could have been invested)
  const securityDepositOpportunityCost =
    inputs.securityDeposit *
    (Math.pow(1 + inputs.investmentReturnRate / 100, inputs.yearsToStay) - 1);

  return totalRent + totalRentersInsurance + securityDepositOpportunityCost;
}

/**
 * Calculate home equity at a given point in time
 */
export function calculateHomeEquity(inputs: RentVsBuyInputs): number {
  const downPayment = (inputs.homePrice * inputs.downPaymentPercent) / 100;
  const loanAmount = inputs.homePrice - downPayment;

  // Calculate current home value with appreciation
  const currentHomeValue =
    inputs.homePrice *
    Math.pow(1 + inputs.homeAppreciationRate / 100, inputs.yearsToStay);

  // Calculate remaining loan balance
  const monthsPaid = Math.min(
    inputs.yearsToStay * 12,
    inputs.loanTermYears * 12
  );
  const remainingBalance = calculateRemainingBalance(
    loanAmount,
    inputs.mortgageRate / 100,
    inputs.loanTermYears,
    monthsPaid
  );

  return currentHomeValue - remainingBalance;
}

/**
 * Calculate tax benefit from mortgage interest and property tax deductions
 */
export function calculateTaxBenefit(inputs: RentVsBuyInputs): number {
  const loanAmount = inputs.homePrice * (1 - inputs.downPaymentPercent / 100);
  let totalTaxSavings = 0;

  for (let year = 1; year <= inputs.yearsToStay; year++) {
    const yearlyInterest = calculateYearlyInterest(
      loanAmount,
      inputs.mortgageRate / 100,
      inputs.loanTermYears,
      year
    );

    const homeValue =
      inputs.homePrice *
      Math.pow(1 + inputs.homeAppreciationRate / 100, year - 1);
    const yearlyPropertyTax = (homeValue * inputs.propertyTaxRate) / 100;

    // Simplified tax benefit calculation
    const deductibleAmount = yearlyInterest + yearlyPropertyTax;
    const standardDeduction = 27700; // Married filing jointly

    if (deductibleAmount > standardDeduction) {
      const taxableBenefit = deductibleAmount - standardDeduction;
      totalTaxSavings += (taxableBenefit * inputs.marginalTaxRate) / 100;
    }
  }

  return totalTaxSavings;
}

/**
 * Calculate opportunity cost of down payment and equity
 */
export function calculateOpportunityCost(inputs: RentVsBuyInputs): number {
  const downPayment = (inputs.homePrice * inputs.downPaymentPercent) / 100;
  const totalUpfront = downPayment + inputs.buyingClosingCosts;

  // Calculate what the upfront costs would have grown to if invested
  const futureValueOfUpfront =
    totalUpfront *
    Math.pow(1 + inputs.investmentReturnRate / 100, inputs.yearsToStay);

  // Calculate opportunity cost on monthly savings (if renting is cheaper monthly)
  const loanAmount = inputs.homePrice - downPayment;
  const monthlyMortgage = calculateMonthlyPayment(
    loanAmount,
    inputs.mortgageRate / 100,
    inputs.loanTermYears
  );

  const monthlyPropertyTax =
    (inputs.homePrice * inputs.propertyTaxRate) / 100 / 12;
  const monthlyInsurance = inputs.homeInsuranceAnnual / 12;
  const monthlyMaintenance =
    (inputs.homePrice * inputs.maintenancePercent) / 100 / 12;

  const totalMonthlyBuying =
    monthlyMortgage +
    monthlyPropertyTax +
    monthlyInsurance +
    inputs.hoaFeesMonthly +
    monthlyMaintenance;

  let cumulativeSavingsIfRenting = 0;
  let currentRent = inputs.monthlyRent;

  for (let month = 1; month <= inputs.yearsToStay * 12; month++) {
    if (month % 12 === 1 && month > 1) {
      currentRent *= 1 + inputs.rentIncreaseRate / 100;
    }

    const monthlySavings =
      totalMonthlyBuying - (currentRent + inputs.rentersInsuranceMonthly);
    if (monthlySavings > 0) {
      const monthsRemaining = inputs.yearsToStay * 12 - month;
      const futureValue =
        monthlySavings *
        Math.pow(1 + inputs.investmentReturnRate / 100 / 12, monthsRemaining);
      cumulativeSavingsIfRenting += futureValue;
    }
  }

  // Total opportunity cost
  return (
    futureValueOfUpfront -
    totalUpfront +
    Math.max(0, cumulativeSavingsIfRenting)
  );
}

/**
 * Find the break-even year where buying becomes cheaper than renting
 */
export function findBreakEvenYear(inputs: RentVsBuyInputs): number | null {
  for (let year = 1; year <= 30; year++) {
    const testInputs = { ...inputs, yearsToStay: year };
    const buyCost = calculateTotalBuyingCost(testInputs);
    const rentCost = calculateTotalRentingCost(testInputs);

    if (buyCost < rentCost) {
      return year;
    }
  }

  return null; // No break-even within 30 years
}

/**
 * Main calculation function for rent vs buy analysis
 */
export function calculateRentVsBuy(inputs: RentVsBuyInputs): RentVsBuyResults {
  // Validate inputs
  if (inputs.homePrice <= 0) throw new Error('Home price must be positive');
  if (inputs.monthlyRent <= 0) throw new Error('Monthly rent must be positive');
  if (inputs.downPaymentPercent < 0 || inputs.downPaymentPercent > 100) {
    throw new Error('Down payment percent must be between 0 and 100');
  }
  if (inputs.yearsToStay <= 0)
    throw new Error('Years to stay must be positive');

  // Calculate key amounts
  const downPaymentAmount =
    (inputs.homePrice * inputs.downPaymentPercent) / 100;
  const loanAmount = inputs.homePrice - downPaymentAmount;
  const monthlyMortgagePayment = calculateMonthlyPayment(
    loanAmount,
    inputs.mortgageRate / 100,
    inputs.loanTermYears
  );

  // Calculate all components
  const monthsToStay = Math.min(
    inputs.yearsToStay * 12,
    inputs.loanTermYears * 12
  );

  // Calculate interest paid
  let totalInterestPaid = 0;
  for (let year = 1; year <= inputs.yearsToStay; year++) {
    totalInterestPaid += calculateYearlyInterest(
      loanAmount,
      inputs.mortgageRate / 100,
      inputs.loanTermYears,
      year
    );
  }

  // Calculate recurring costs
  let totalPropertyTax = 0;
  let totalInsurance = 0;
  let totalHOA = 0;
  let totalMaintenance = 0;
  let currentHomeValue = inputs.homePrice;

  for (let year = 1; year <= inputs.yearsToStay; year++) {
    const inflationFactor = Math.pow(
      1 + inputs.homeAppreciationRate / 100,
      year - 1
    );
    currentHomeValue =
      inputs.homePrice * Math.pow(1 + inputs.homeAppreciationRate / 100, year);

    totalPropertyTax +=
      (inputs.homePrice *
        Math.pow(1 + inputs.homeAppreciationRate / 100, year - 1) *
        inputs.propertyTaxRate) /
      100;
    totalMaintenance +=
      (inputs.homePrice *
        Math.pow(1 + inputs.homeAppreciationRate / 100, year - 1) *
        inputs.maintenancePercent) /
      100;
    totalInsurance += inputs.homeInsuranceAnnual * inflationFactor;
    totalHOA += inputs.hoaFeesMonthly * 12 * inflationFactor;
  }

  const homeValueAtEnd = currentHomeValue;
  const sellingCosts =
    (homeValueAtEnd * inputs.sellingClosingCostsPercent) / 100;

  // Calculate equity
  const remainingBalance = calculateRemainingBalance(
    loanAmount,
    inputs.mortgageRate / 100,
    inputs.loanTermYears,
    monthsToStay
  );
  const homeEquity = homeValueAtEnd - remainingBalance;

  // Calculate tax savings
  const totalTaxSavings = calculateTaxBenefit(inputs);

  // Calculate monthly housing cost (Year 1)
  const monthlyPropertyTax =
    (inputs.homePrice * inputs.propertyTaxRate) / 100 / 12;
  const monthlyInsurance = inputs.homeInsuranceAnnual / 12;
  const monthlyMaintenance =
    (inputs.homePrice * inputs.maintenancePercent) / 100 / 12;
  const monthlyHousingCost =
    monthlyMortgagePayment +
    monthlyPropertyTax +
    monthlyInsurance +
    inputs.hoaFeesMonthly +
    monthlyMaintenance;

  // Calculate renting costs
  let totalRentPaid = 0;
  let currentRent = inputs.monthlyRent;

  for (let year = 1; year <= inputs.yearsToStay; year++) {
    totalRentPaid += currentRent * 12;
    currentRent *= 1 + inputs.rentIncreaseRate / 100;
  }

  const totalRentersInsurance =
    inputs.rentersInsuranceMonthly * 12 * inputs.yearsToStay;
  const averageMonthlyRent = totalRentPaid / (inputs.yearsToStay * 12);

  // Calculate opportunity cost
  const opportunityCost = calculateOpportunityCost(inputs);

  // Calculate total costs
  const totalBuyCostComponents = {
    downPayment: downPaymentAmount,
    closingCosts: inputs.buyingClosingCosts,
    mortgagePayments: monthlyMortgagePayment * monthsToStay,
    propertyTax: totalPropertyTax,
    insurance: totalInsurance,
    hoa: totalHOA,
    maintenance: totalMaintenance,
    sellingCosts: sellingCosts,
    lessHomeEquity: -homeEquity,
    lessTaxSavings: -totalTaxSavings,
  };

  const totalBuyCost =
    Object.values(totalBuyCostComponents).reduce((sum, val) => sum + val, 0) +
    opportunityCost;

  const totalRentCostComponents = {
    rent: totalRentPaid,
    rentersInsurance: totalRentersInsurance,
    securityDeposit: inputs.securityDeposit, // Will get back but lose opportunity
  };

  const totalRentCost =
    totalRentPaid +
    totalRentersInsurance +
    inputs.securityDeposit *
      (Math.pow(1 + inputs.investmentReturnRate / 100, inputs.yearsToStay) - 1);

  // Determine which is better
  const netDifference = Math.abs(totalBuyCost - totalRentCost);
  const betterOption = totalBuyCost < totalRentCost ? 'Buying' : 'Renting';

  // Calculate break-even year
  const breakEvenYear = findBreakEvenYear(inputs);

  // Generate yearly breakdown
  const yearlyBreakdown = [];
  for (let year = 1; year <= inputs.yearsToStay; year++) {
    const yearInputs = { ...inputs, yearsToStay: year };
    const yearBuyCost = calculateTotalBuyingCost(yearInputs);
    const yearRentCost = calculateTotalRentingCost(yearInputs);
    const yearEquity = calculateHomeEquity(yearInputs);

    yearlyBreakdown.push({
      year,
      buyMonthlyAvg: yearBuyCost / (year * 12),
      rentMonthly:
        inputs.monthlyRent *
        Math.pow(1 + inputs.rentIncreaseRate / 100, year - 1),
      cumulativeBuyCost: yearBuyCost,
      cumulativeRentCost: yearRentCost,
      homeEquity: yearEquity,
    });
  }

  return {
    // Key Metrics
    totalBuyCost,
    totalRentCost,
    netDifference,
    betterOption,
    breakEvenYear,

    // Buying Details
    downPaymentAmount,
    loanAmount,
    monthlyMortgagePayment,
    monthlyHousingCost,
    totalInterestPaid,
    totalPropertyTax,
    totalInsurance,
    totalHOA,
    totalMaintenance,
    homeValueAtEnd,
    homeEquity,
    totalTaxSavings,
    sellingCosts,

    // Renting Details
    totalRentPaid,
    totalRentersInsurance,
    averageMonthlyRent,

    // Opportunity Cost
    opportunityCost,

    // Detailed Breakdowns
    totalBuyCostBreakdown: totalBuyCostComponents,
    totalRentCostBreakdown: totalRentCostComponents,

    // Year-by-year analysis
    yearlyBreakdown,
  };
}
