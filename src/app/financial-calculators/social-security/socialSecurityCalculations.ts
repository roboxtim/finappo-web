// Types for Social Security Calculator
export interface IdealAgeInputs {
  birthYear: number;
  lifeExpectancy: number;
  investmentReturn: number; // Annual percentage
  cola: number; // Cost of Living Adjustment percentage
}

export interface CompareAgesInputs {
  claimAge1: number;
  monthlyPayment1: number;
  claimAge2: number;
  monthlyPayment2: number;
  investmentReturn: number;
  cola: number;
}

export interface AgeAnalysis {
  age: number;
  monthlyBenefit: number;
  annualBenefit: number;
  lifetimeValue: number;
  presentValue: number;
  percentOfFRA: number;
}

export interface IdealAgeResults {
  fullRetirementAge: number;
  idealClaimAge: number;
  monthlyBenefitAtIdealAge: number;
  annualBenefitAtIdealAge: number;
  lifetimeValueAtIdealAge: number;
  presentValueAtIdealAge: number;
  ageAnalysis: AgeAnalysis[];
  recommendation: string;
  breakEvenVsEarly: number;
  breakEvenVsLate: number;
}

export interface ClaimOption {
  claimAge: number;
  monthlyBenefit: number;
  annualBenefit: number;
  lifetimeValue85: number;
  lifetimeValue90: number;
  lifetimeValue95: number;
  presentValue85: number;
  presentValue90: number;
  presentValue95: number;
}

export interface CumulativeComparison {
  age: number;
  yearsFromStart: number;
  option1Cumulative: number;
  option2Cumulative: number;
  difference: number;
}

export interface CompareAgesResults {
  option1: ClaimOption;
  option2: ClaimOption;
  breakEvenAge: number;
  betterOption: 1 | 2;
  differenceAt85: number;
  differenceAt90: number;
  differenceAt95: number;
  recommendation: string;
  cumulativeComparison: CumulativeComparison[];
}

// Validation function
export function validateSocialSecurityInputs(
  inputs: IdealAgeInputs | CompareAgesInputs,
  type: 'ideal' | 'compare'
): string[] {
  const errors: string[] = [];

  if (type === 'ideal') {
    const { birthYear, lifeExpectancy, investmentReturn, cola } =
      inputs as IdealAgeInputs;

    if (!birthYear || birthYear < 1940 || birthYear > 2010) {
      errors.push('Birth year must be between 1940 and 2010');
    }

    if (!lifeExpectancy || lifeExpectancy < 65 || lifeExpectancy > 110) {
      errors.push('Life expectancy must be between 65 and 110');
    }

    if (investmentReturn < 0 || investmentReturn > 15) {
      errors.push('Investment return must be between 0% and 15%');
    }

    if (cola < 0 || cola > 10) {
      errors.push('COLA must be between 0% and 10%');
    }
  } else {
    const {
      claimAge1,
      monthlyPayment1,
      claimAge2,
      monthlyPayment2,
      investmentReturn,
      cola,
    } = inputs as CompareAgesInputs;

    if (!claimAge1 || claimAge1 < 62 || claimAge1 > 70) {
      errors.push('Claim age must be between 62 and 70');
    }

    if (!claimAge2 || claimAge2 < 62 || claimAge2 > 70) {
      errors.push('Claim age must be between 62 and 70');
    }

    if (!monthlyPayment1 || monthlyPayment1 <= 0) {
      errors.push('Monthly payment must be greater than 0');
    }

    if (!monthlyPayment2 || monthlyPayment2 <= 0) {
      errors.push('Monthly payment must be greater than 0');
    }

    if (investmentReturn < 0 || investmentReturn > 15) {
      errors.push('Investment return must be between 0% and 15%');
    }

    if (cola < 0 || cola > 10) {
      errors.push('COLA must be between 0% and 10%');
    }
  }

  return errors;
}

// Get Full Retirement Age based on birth year
export function getFullRetirementAge(birthYear: number): number {
  if (birthYear <= 1937) return 65;
  if (birthYear === 1938) return 65.167;
  if (birthYear === 1939) return 65.333;
  if (birthYear === 1940) return 65.5;
  if (birthYear === 1941) return 65.667;
  if (birthYear === 1942) return 65.833;
  if (birthYear >= 1943 && birthYear <= 1954) return 66;
  if (birthYear === 1955) return 66.167;
  if (birthYear === 1956) return 66.333;
  if (birthYear === 1957) return 66.5;
  if (birthYear === 1958) return 66.667;
  if (birthYear === 1959) return 66.833;
  if (birthYear >= 1960) return 67;
  return 67;
}

// Calculate monthly benefit based on claim age
export function calculateMonthlyBenefit(
  fullBenefit: number,
  claimAge: number,
  fullRetirementAge: number
): number {
  const monthsEarlyOrLate = (claimAge - fullRetirementAge) * 12;

  if (claimAge < fullRetirementAge) {
    // Early retirement reduction
    const monthsEarly = Math.abs(monthsEarlyOrLate);
    let reduction = 0;

    if (monthsEarly <= 36) {
      // First 36 months: 5/9 of 1% per month
      reduction = monthsEarly * (5 / 9) * 0.01;
    } else {
      // Beyond 36 months: 5/12 of 1% per month
      reduction = 36 * (5 / 9) * 0.01 + (monthsEarly - 36) * (5 / 12) * 0.01;
    }

    return fullBenefit * (1 - reduction);
  } else if (claimAge > fullRetirementAge) {
    // Delayed retirement credits: 8% per year (2/3% per month)
    const monthsLate = monthsEarlyOrLate;
    const maxMonths = (70 - fullRetirementAge) * 12;
    const actualMonths = Math.min(monthsLate, maxMonths);
    const increase = actualMonths * (2 / 3) * 0.01;

    return fullBenefit * (1 + increase);
  }

  return fullBenefit;
}

// Calculate lifetime value of benefits
export function calculateLifetimeValue(
  monthlyBenefit: number,
  claimAge: number,
  lifeExpectancy: number,
  cola: number,
  investmentReturn: number
): number {
  const yearsOfBenefits = lifeExpectancy - claimAge;
  if (yearsOfBenefits <= 0) return 0;

  let totalValue = 0;
  const annualCola = cola / 100;

  for (let year = 0; year < yearsOfBenefits; year++) {
    // Apply COLA to benefit
    const adjustedBenefit = monthlyBenefit * Math.pow(1 + annualCola, year);
    const annualBenefit = adjustedBenefit * 12;

    // Discount to present value
    const discountFactor = Math.pow(1 + investmentReturn / 100, year);
    const presentValue = annualBenefit / discountFactor;

    totalValue += presentValue;
  }

  return Math.round(totalValue);
}

// Calculate break-even age between two claiming strategies
export function calculateBreakEvenAge(
  earlyAge: number,
  earlyBenefit: number,
  laterAge: number,
  laterBenefit: number,
  cola: number
): number {
  if (laterBenefit <= earlyBenefit) return Infinity;

  const annualCola = cola / 100;
  let earlyTotal = 0;
  let laterTotal = 0;

  for (let age = earlyAge; age <= 100; age++) {
    const earlyYears = Math.max(0, age - earlyAge);
    const laterYears = Math.max(0, age - laterAge);

    if (earlyYears > 0) {
      const adjustedEarlyBenefit =
        earlyBenefit * Math.pow(1 + annualCola, earlyYears - 1);
      earlyTotal += adjustedEarlyBenefit * 12;
    }

    if (laterYears > 0) {
      const adjustedLaterBenefit =
        laterBenefit * Math.pow(1 + annualCola, laterYears - 1);
      laterTotal += adjustedLaterBenefit * 12;
    }

    if (laterTotal > earlyTotal && laterYears > 0) {
      return age;
    }
  }

  return 100;
}

// Main calculation function for ideal claim age
export function calculateIdealClaimAge(
  inputs: IdealAgeInputs
): IdealAgeResults {
  const { birthYear, lifeExpectancy, investmentReturn, cola } = inputs;
  const fullRetirementAge = getFullRetirementAge(birthYear);

  // Assume full benefit at FRA is $2500 (baseline for comparison)
  const fullBenefit = 2500;
  const ageAnalysis: AgeAnalysis[] = [];
  let maxPresentValue = 0;
  let idealClaimAge = 62;

  // Analyze each possible claim age from 62 to 70
  for (let age = 62; age <= 70; age++) {
    const monthlyBenefit = calculateMonthlyBenefit(
      fullBenefit,
      age,
      fullRetirementAge
    );
    const annualBenefit = monthlyBenefit * 12;
    const lifetimeValue = calculateLifetimeValue(
      monthlyBenefit,
      age,
      lifeExpectancy,
      cola,
      investmentReturn
    );

    // Calculate present value considering opportunity cost
    const yearsToWait = age - 62;
    const discountFactor = Math.pow(1 + investmentReturn / 100, yearsToWait);
    const presentValue = lifetimeValue / discountFactor;

    ageAnalysis.push({
      age,
      monthlyBenefit: Math.round(monthlyBenefit),
      annualBenefit: Math.round(annualBenefit),
      lifetimeValue: Math.round(lifetimeValue),
      presentValue: Math.round(presentValue),
      percentOfFRA: (monthlyBenefit / fullBenefit) * 100,
    });

    if (presentValue > maxPresentValue) {
      maxPresentValue = presentValue;
      idealClaimAge = age;
    }
  }

  const idealAgeData = ageAnalysis.find((a) => a.age === idealClaimAge)!;

  // Calculate break-even points
  const earlyClaimData = ageAnalysis.find((a) => a.age === 62)!;
  const lateClaimData = ageAnalysis.find((a) => a.age === 70)!;

  const breakEvenVsEarly = calculateBreakEvenAge(
    62,
    earlyClaimData.monthlyBenefit,
    idealClaimAge,
    idealAgeData.monthlyBenefit,
    cola
  );

  const breakEvenVsLate = calculateBreakEvenAge(
    idealClaimAge,
    idealAgeData.monthlyBenefit,
    70,
    lateClaimData.monthlyBenefit,
    cola
  );

  // Generate recommendation
  let recommendation = '';
  if (idealClaimAge <= 64) {
    recommendation = `Based on your life expectancy of ${lifeExpectancy} and investment return of ${investmentReturn}%, claiming benefits earlier at age ${idealClaimAge} maximizes your lifetime value. The higher investment returns make it beneficial to receive money sooner.`;
  } else if (idealClaimAge >= 68) {
    recommendation = `Given your life expectancy of ${lifeExpectancy} and investment return of ${investmentReturn}%, delaying benefits until age ${idealClaimAge} is optimal. The increased monthly payments and your longer life expectancy outweigh the opportunity cost of waiting.`;
  } else {
    recommendation = `For your situation with a life expectancy of ${lifeExpectancy} and ${investmentReturn}% investment return, claiming at age ${idealClaimAge} provides the best balance between monthly benefit amount and total lifetime value.`;
  }

  return {
    fullRetirementAge,
    idealClaimAge,
    monthlyBenefitAtIdealAge: idealAgeData.monthlyBenefit,
    annualBenefitAtIdealAge: idealAgeData.annualBenefit,
    lifetimeValueAtIdealAge: idealAgeData.lifetimeValue,
    presentValueAtIdealAge: idealAgeData.presentValue,
    ageAnalysis,
    recommendation,
    breakEvenVsEarly,
    breakEvenVsLate,
  };
}

// Main calculation function for comparing two claim ages
export function compareTwoClaimAges(
  inputs: CompareAgesInputs
): CompareAgesResults {
  const {
    claimAge1,
    monthlyPayment1,
    claimAge2,
    monthlyPayment2,
    investmentReturn,
    cola,
  } = inputs;

  // Calculate lifetime values at different life expectancies
  const calculateOption = (
    claimAge: number,
    monthlyBenefit: number
  ): ClaimOption => {
    const annualBenefit = monthlyBenefit * 12;

    const lifetimeValue85 = calculateLifetimeValue(
      monthlyBenefit,
      claimAge,
      85,
      cola,
      investmentReturn
    );

    const lifetimeValue90 = calculateLifetimeValue(
      monthlyBenefit,
      claimAge,
      90,
      cola,
      investmentReturn
    );

    const lifetimeValue95 = calculateLifetimeValue(
      monthlyBenefit,
      claimAge,
      95,
      cola,
      investmentReturn
    );

    // Calculate present values
    const yearsToWait = claimAge - 62;
    const discountFactor = Math.pow(1 + investmentReturn / 100, yearsToWait);

    return {
      claimAge,
      monthlyBenefit,
      annualBenefit,
      lifetimeValue85,
      lifetimeValue90,
      lifetimeValue95,
      presentValue85: Math.round(lifetimeValue85 / discountFactor),
      presentValue90: Math.round(lifetimeValue90 / discountFactor),
      presentValue95: Math.round(lifetimeValue95 / discountFactor),
    };
  };

  const option1 = calculateOption(claimAge1, monthlyPayment1);
  const option2 = calculateOption(claimAge2, monthlyPayment2);

  // Calculate break-even age
  const breakEvenAge = calculateBreakEvenAge(
    claimAge1,
    monthlyPayment1,
    claimAge2,
    monthlyPayment2,
    cola
  );

  // Calculate cumulative comparison
  const cumulativeComparison: CumulativeComparison[] = [];
  const startAge = Math.min(claimAge1, claimAge2);
  const annualCola = cola / 100;

  for (let age = startAge; age <= 95; age += 1) {
    let option1Cumulative = 0;
    let option2Cumulative = 0;

    // Calculate cumulative benefits for option 1
    if (age >= claimAge1) {
      const years = age - claimAge1;
      for (let y = 0; y <= years; y++) {
        const adjustedBenefit = monthlyPayment1 * Math.pow(1 + annualCola, y);
        option1Cumulative += adjustedBenefit * 12;
      }
    }

    // Calculate cumulative benefits for option 2
    if (age >= claimAge2) {
      const years = age - claimAge2;
      for (let y = 0; y <= years; y++) {
        const adjustedBenefit = monthlyPayment2 * Math.pow(1 + annualCola, y);
        option2Cumulative += adjustedBenefit * 12;
      }
    }

    cumulativeComparison.push({
      age,
      yearsFromStart: age - startAge,
      option1Cumulative: Math.round(option1Cumulative),
      option2Cumulative: Math.round(option2Cumulative),
      difference: Math.round(option1Cumulative - option2Cumulative),
    });
  }

  // Determine better option based on present value at age 85 (typical planning age)
  const betterOption = option1.presentValue85 > option2.presentValue85 ? 1 : 2;

  // Calculate differences
  const differenceAt85 = option1.presentValue85 - option2.presentValue85;
  const differenceAt90 = option1.presentValue90 - option2.presentValue90;
  const differenceAt95 = option1.presentValue95 - option2.presentValue95;

  // Generate recommendation
  let recommendation = '';
  if (betterOption === 1) {
    if (breakEvenAge === Infinity) {
      recommendation = `Option 1 (claiming at age ${claimAge1}) is always better due to equal or higher monthly benefits starting earlier.`;
    } else if (breakEvenAge > 85) {
      recommendation = `Option 1 (claiming at age ${claimAge1}) is recommended. While Option 2 offers higher monthly payments, the break-even age of ${Math.round(breakEvenAge)} is beyond typical life expectancy, making early claiming more valuable.`;
    } else {
      recommendation = `Option 1 (claiming at age ${claimAge1}) provides better value given your ${investmentReturn}% investment return. The opportunity to invest benefits earlier outweighs the higher monthly payments of Option 2.`;
    }
  } else {
    if (breakEvenAge < 80) {
      recommendation = `Option 2 (claiming at age ${claimAge2}) is strongly recommended. The break-even age is ${Math.round(breakEvenAge)}, and the higher monthly payments provide significantly more value over a typical retirement.`;
    } else {
      recommendation = `Option 2 (claiming at age ${claimAge2}) is recommended for most scenarios. The ${((monthlyPayment2 / monthlyPayment1 - 1) * 100).toFixed(1)}% higher monthly benefit provides better long-term value despite the delay.`;
    }
  }

  return {
    option1,
    option2,
    breakEvenAge: Math.round(breakEvenAge),
    betterOption,
    differenceAt85,
    differenceAt90,
    differenceAt95,
    recommendation,
    cumulativeComparison,
  };
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
