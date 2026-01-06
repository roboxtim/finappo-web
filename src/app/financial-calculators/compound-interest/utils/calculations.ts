export type CompoundingFrequency =
  | 'annually'
  | 'semiannually'
  | 'quarterly'
  | 'monthly'
  | 'semimonthly'
  | 'biweekly'
  | 'weekly'
  | 'daily'
  | 'continuously';

export type ContributionTiming = 'beginning' | 'end';

export interface CompoundInterestInputs {
  initialInvestment: number;
  interestRate: number; // Annual percentage rate
  years: number;
  months: number;
  compoundingFrequency: CompoundingFrequency;
  monthlyContribution: number;
  annualContribution: number;
  contributionTiming: ContributionTiming;
  taxRate: number; // Percentage
  inflationRate: number; // Percentage
}

export interface ScheduleRow {
  period: number;
  month: number;
  year: number;
  deposit: number;
  interest: number;
  balance: number;
  cumulativeDeposits: number;
  cumulativeInterest: number;
}

export interface CompoundInterestResults {
  endingBalance: number;
  totalPrincipal: number;
  totalContributions: number;
  totalInterest: number;
  interestFromInitial: number;
  interestFromContributions: number;
  afterTaxAmount: number;
  inflationAdjustedAmount: number;
  effectiveAnnualRate: number;
  totalReturn: number; // Percentage
  schedule: ScheduleRow[];
  monthlySchedule: ScheduleRow[];
}

// Helper function to get compounds per year
function getCompoundsPerYear(frequency: CompoundingFrequency): number {
  const frequencyMap: Record<CompoundingFrequency, number> = {
    annually: 1,
    semiannually: 2,
    quarterly: 4,
    monthly: 12,
    semimonthly: 24,
    biweekly: 26,
    weekly: 52,
    daily: 365,
    continuously: 0, // Special case
  };
  return frequencyMap[frequency];
}

export function calculateCompoundInterest(
  inputs: CompoundInterestInputs
): CompoundInterestResults {
  const {
    initialInvestment,
    interestRate,
    years,
    months,
    compoundingFrequency,
    monthlyContribution,
    annualContribution,
    contributionTiming,
    taxRate,
    inflationRate,
  } = inputs;

  const totalYears = years + months / 12;
  const annualRate = interestRate / 100;
  const taxRateDecimal = taxRate / 100;
  const inflationRateDecimal = inflationRate / 100;

  // Handle continuous compounding specially
  if (compoundingFrequency === 'continuously') {
    return calculateContinuousCompounding(inputs, totalYears);
  }

  const compoundsPerYear = getCompoundsPerYear(compoundingFrequency);
  const totalPeriods = Math.floor(totalYears * compoundsPerYear);
  const periodRate = annualRate / compoundsPerYear;

  let balance = initialInvestment;
  let totalInterestEarned = 0;
  let totalContributionsAmount = 0;
  const monthlySchedule: ScheduleRow[] = [];
  const detailedSchedule: ScheduleRow[] = [];

  // Track interest separately for initial vs contributions
  let balanceFromInitial = initialInvestment;
  let interestFromInitial = 0;
  let balanceFromContributions = 0;
  let interestFromContributions = 0;

  // Calculate effective monthly contribution (including annual contribution)
  const effectiveMonthlyContribution =
    monthlyContribution + annualContribution / 12;

  for (let period = 1; period <= totalPeriods; period++) {
    let periodDeposit = 0;

    // Add contributions at beginning of period
    if (contributionTiming === 'beginning') {
      periodDeposit = calculatePeriodContribution(
        period,
        compoundsPerYear,
        effectiveMonthlyContribution
      );
      balance += periodDeposit;
      balanceFromContributions += periodDeposit;
      totalContributionsAmount += periodDeposit;
    }

    // Calculate interest for this period
    const grossInterest = balance * periodRate;
    const taxOnInterest = grossInterest * taxRateDecimal;
    const netInterest = grossInterest - taxOnInterest;

    // Track interest from different sources
    const initialPortion = balance > 0 ? balanceFromInitial / balance : 0;
    const contributionPortion =
      balance > 0 ? balanceFromContributions / balance : 0;

    const initialPortionInterest = netInterest * initialPortion;
    const contributionPortionInterest = netInterest * contributionPortion;

    interestFromInitial += initialPortionInterest;
    interestFromContributions += contributionPortionInterest;

    balance += netInterest;
    balanceFromInitial += initialPortionInterest;
    balanceFromContributions += contributionPortionInterest;
    totalInterestEarned += netInterest;

    // Add contributions at end of period
    if (contributionTiming === 'end') {
      periodDeposit = calculatePeriodContribution(
        period,
        compoundsPerYear,
        effectiveMonthlyContribution
      );
      balance += periodDeposit;
      balanceFromContributions += periodDeposit;
      totalContributionsAmount += periodDeposit;
    }

    const currentMonth = Math.ceil((period / compoundsPerYear) * 12);
    const currentYear = Math.ceil(period / compoundsPerYear);

    detailedSchedule.push({
      period,
      month: currentMonth,
      year: currentYear,
      deposit: periodDeposit,
      interest: netInterest,
      balance,
      cumulativeDeposits: initialInvestment + totalContributionsAmount,
      cumulativeInterest: totalInterestEarned,
    });

    // Add to monthly schedule if it's a monthly period
    if (compoundsPerYear >= 12 && period % (compoundsPerYear / 12) === 0) {
      monthlySchedule.push({
        period: monthlySchedule.length + 1,
        month: monthlySchedule.length + 1,
        year: Math.ceil((monthlySchedule.length + 1) / 12),
        deposit: periodDeposit,
        interest: netInterest,
        balance,
        cumulativeDeposits: initialInvestment + totalContributionsAmount,
        cumulativeInterest: totalInterestEarned,
      });
    }
  }

  // Create annual summary
  const annualSchedule: ScheduleRow[] = [];
  for (let year = 1; year <= Math.ceil(totalYears); year++) {
    const yearPeriods = detailedSchedule.filter((s) => s.year === year);
    if (yearPeriods.length > 0) {
      const lastPeriod = yearPeriods[yearPeriods.length - 1];
      const yearDeposits = yearPeriods.reduce((sum, p) => sum + p.deposit, 0);
      const yearInterest = yearPeriods.reduce((sum, p) => sum + p.interest, 0);

      annualSchedule.push({
        period: year,
        month: year * 12,
        year,
        deposit: yearDeposits,
        interest: yearInterest,
        balance: lastPeriod.balance,
        cumulativeDeposits: lastPeriod.cumulativeDeposits,
        cumulativeInterest: lastPeriod.cumulativeInterest,
      });
    }
  }

  // Apply inflation to final amount
  const inflationFactor = Math.pow(1 + inflationRateDecimal, totalYears);
  const inflationAdjustedAmount = balance / inflationFactor;

  // Calculate after-tax amount (balance already includes tax-adjusted interest)
  // If no tax was applied, afterTaxAmount equals balance
  // If tax was applied, the balance already reflects the net (after-tax) value
  const afterTaxAmount = balance;

  // Calculate effective annual rate
  const effectiveAnnualRate =
    totalContributionsAmount + initialInvestment > 0
      ? ((totalInterestEarned /
          (totalContributionsAmount + initialInvestment)) *
          100) /
        totalYears
      : 0;

  // Calculate total return percentage
  const totalReturn =
    totalContributionsAmount + initialInvestment > 0
      ? (totalInterestEarned / (totalContributionsAmount + initialInvestment)) *
        100
      : 0;

  return {
    endingBalance: balance,
    totalPrincipal: initialInvestment,
    totalContributions: totalContributionsAmount,
    totalInterest: totalInterestEarned,
    interestFromInitial: interestFromInitial,
    interestFromContributions: interestFromContributions,
    afterTaxAmount,
    inflationAdjustedAmount,
    effectiveAnnualRate,
    totalReturn,
    schedule: annualSchedule,
    monthlySchedule:
      compoundsPerYear === 12 ? detailedSchedule : monthlySchedule,
  };
}

function calculatePeriodContribution(
  period: number,
  compoundsPerYear: number,
  effectiveMonthlyContribution: number
): number {
  if (effectiveMonthlyContribution === 0) return 0;

  // For monthly or more frequent compounding
  if (compoundsPerYear >= 12) {
    const periodsPerMonth = compoundsPerYear / 12;
    if (period % periodsPerMonth === 0) {
      return effectiveMonthlyContribution;
    }
  } else {
    // For less frequent compounding (quarterly, semi-annual, annual)
    // Distribute contributions proportionally
    return effectiveMonthlyContribution * (12 / compoundsPerYear);
  }

  return 0;
}

function calculateContinuousCompounding(
  inputs: CompoundInterestInputs,
  totalYears: number
): CompoundInterestResults {
  const {
    initialInvestment,
    interestRate,
    monthlyContribution,
    annualContribution,
    taxRate,
    inflationRate,
  } = inputs;

  const annualRate = interestRate / 100;
  const taxRateDecimal = taxRate / 100;
  const inflationRateDecimal = inflationRate / 100;

  // For continuous compounding: A = Pe^(rt)
  const finalAmountFromInitial =
    initialInvestment * Math.exp(annualRate * totalYears);
  const interestFromInitial =
    (finalAmountFromInitial - initialInvestment) * (1 - taxRateDecimal);
  const netFinalFromInitial = initialInvestment + interestFromInitial;

  // Handle contributions with continuous compounding
  const totalMonths = Math.floor(totalYears * 12);
  const effectiveMonthlyContribution =
    monthlyContribution + annualContribution / 12;
  let contributionBalance = 0;
  let totalContributionsAmount = 0;
  let interestFromContributions = 0;

  // Simplified approach for contributions with continuous compounding
  for (let month = 1; month <= totalMonths; month++) {
    const remainingYears = totalYears - month / 12;
    if (remainingYears > 0) {
      const contribution = effectiveMonthlyContribution;
      const futureValue = contribution * Math.exp(annualRate * remainingYears);
      const interest = (futureValue - contribution) * (1 - taxRateDecimal);
      contributionBalance += contribution + interest;
      interestFromContributions += interest;
      totalContributionsAmount += contribution;
    } else {
      totalContributionsAmount += effectiveMonthlyContribution;
      contributionBalance += effectiveMonthlyContribution;
    }
  }

  const totalBalance = netFinalFromInitial + contributionBalance;
  const totalInterestEarned = interestFromInitial + interestFromContributions;

  // Apply inflation
  const inflationFactor = Math.pow(1 + inflationRateDecimal, totalYears);
  const inflationAdjustedAmount = totalBalance / inflationFactor;

  // Generate schedule (simplified for continuous compounding)
  const schedule: ScheduleRow[] = [];
  const monthlySchedule: ScheduleRow[] = [];

  for (let year = 1; year <= Math.ceil(totalYears); year++) {
    const t = Math.min(year, totalYears);
    const balanceAtYear =
      initialInvestment * Math.exp(annualRate * t * (1 - taxRateDecimal));
    const contributionsToDate = effectiveMonthlyContribution * 12 * t;

    schedule.push({
      period: year,
      month: year * 12,
      year,
      deposit: year <= totalYears ? effectiveMonthlyContribution * 12 : 0,
      interest:
        year === 1
          ? balanceAtYear - initialInvestment
          : balanceAtYear - schedule[year - 2].balance,
      balance: balanceAtYear + contributionsToDate,
      cumulativeDeposits: initialInvestment + contributionsToDate,
      cumulativeInterest: balanceAtYear - initialInvestment,
    });
  }

  const effectiveAnnualRate =
    totalContributionsAmount + initialInvestment > 0
      ? ((totalInterestEarned /
          (totalContributionsAmount + initialInvestment)) *
          100) /
        totalYears
      : 0;

  const totalReturn =
    totalContributionsAmount + initialInvestment > 0
      ? (totalInterestEarned / (totalContributionsAmount + initialInvestment)) *
        100
      : 0;

  return {
    endingBalance: totalBalance,
    totalPrincipal: initialInvestment,
    totalContributions: totalContributionsAmount,
    totalInterest: totalInterestEarned,
    interestFromInitial,
    interestFromContributions,
    afterTaxAmount: totalBalance,
    inflationAdjustedAmount,
    effectiveAnnualRate,
    totalReturn,
    schedule,
    monthlySchedule,
  };
}
