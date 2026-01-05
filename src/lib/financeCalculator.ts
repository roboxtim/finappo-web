/**
 * Time Value of Money (TVM) Calculator
 *
 * This calculator implements the standard 5-key TVM calculations similar to
 * financial calculators like BA II Plus or HP 12CP.
 *
 * It can solve for any one of the five variables:
 * - N: Number of periods
 * - I/Y: Interest rate per year (as a percentage)
 * - PV: Present Value
 * - PMT: Periodic Payment
 * - FV: Future Value
 *
 * Additional parameters:
 * - P/Y: Payments per year
 * - C/Y: Compounding periods per year
 * - PMT at beginning/end of period
 */

export type TVMSolveFor = 'N' | 'IY' | 'PV' | 'PMT' | 'FV';

export interface TVMInputs {
  solveFor: TVMSolveFor;
  N: number;      // Number of periods
  IY: number;     // Annual interest rate (as percentage, e.g., 6 for 6%)
  PV: number;     // Present Value
  PMT: number;    // Periodic Payment
  FV: number;     // Future Value
  PY: number;     // Payments per year
  CY: number;     // Compounding periods per year
  PMTatBeginning: boolean;  // Payment timing: true = beginning, false = end
}

export interface TVMResults {
  N: number;
  IY: number;
  PV: number;
  PMT: number;
  FV: number;
}

/**
 * Calculate the effective interest rate per payment period
 */
function calculateEffectiveRate(annualRate: number, PY: number, CY: number): number {
  if (annualRate === 0) return 0;

  const ratePerCompoundingPeriod = annualRate / 100 / CY;

  // If P/Y === C/Y, the effective rate is simply the rate per period
  if (PY === CY) {
    return ratePerCompoundingPeriod;
  }

  // Otherwise, we need to calculate the effective rate per payment period
  const compoundingPeriodsPerPayment = CY / PY;
  const effectiveRate = Math.pow(1 + ratePerCompoundingPeriod, compoundingPeriodsPerPayment) - 1;

  return effectiveRate;
}

/**
 * Solve for Future Value
 */
function solveFV(inputs: TVMInputs): number {
  const { N, IY, PV, PMT, PY, CY, PMTatBeginning } = inputs;

  const i = calculateEffectiveRate(IY, PY, CY);

  if (i === 0) {
    // No interest case
    return -(PV + PMT * N);
  }

  const pvFactor = Math.pow(1 + i, N);

  // FV from PV
  const fvFromPV = -PV * pvFactor;

  // FV from PMT (ordinary annuity or annuity due)
  let fvFromPMT: number;
  if (PMTatBeginning) {
    // Annuity due: payments at beginning of period
    fvFromPMT = -PMT * ((pvFactor - 1) / i) * (1 + i);
  } else {
    // Ordinary annuity: payments at end of period
    fvFromPMT = -PMT * ((pvFactor - 1) / i);
  }

  return fvFromPV + fvFromPMT;
}

/**
 * Solve for Present Value
 */
function solvePV(inputs: TVMInputs): number {
  const { N, IY, PMT, FV, PY, CY, PMTatBeginning } = inputs;

  const i = calculateEffectiveRate(IY, PY, CY);

  if (i === 0) {
    // No interest case
    return -(FV + PMT * N);
  }

  const pvFactor = Math.pow(1 + i, -N);

  // PV from FV
  const pvFromFV = -FV * pvFactor;

  // PV from PMT
  let pvFromPMT: number;
  if (PMTatBeginning) {
    // Annuity due
    pvFromPMT = -PMT * ((1 - pvFactor) / i) * (1 + i);
  } else {
    // Ordinary annuity
    pvFromPMT = -PMT * ((1 - pvFactor) / i);
  }

  return pvFromFV + pvFromPMT;
}

/**
 * Solve for Payment
 */
function solvePMT(inputs: TVMInputs): number {
  const { N, IY, PV, FV, PY, CY, PMTatBeginning } = inputs;

  const i = calculateEffectiveRate(IY, PY, CY);

  if (i === 0) {
    // No interest case
    return -(PV + FV) / N;
  }

  const pvFactor = Math.pow(1 + i, N);

  // PMT = -(PV * pvFactor + FV) / annuityFactor
  const numerator = -(PV * pvFactor + FV);

  let annuityFactor: number;
  if (PMTatBeginning) {
    // Annuity due
    annuityFactor = ((pvFactor - 1) / i) * (1 + i);
  } else {
    // Ordinary annuity
    annuityFactor = (pvFactor - 1) / i;
  }

  return numerator / annuityFactor;
}

/**
 * Solve for Number of Periods using logarithms
 */
function solveN(inputs: TVMInputs): number {
  const { IY, PV, PMT, FV, PY, CY, PMTatBeginning } = inputs;

  const i = calculateEffectiveRate(IY, PY, CY);

  if (i === 0) {
    // No interest case
    if (PMT === 0) {
      throw new Error('Cannot solve for N with zero interest and zero payment');
    }
    return -(PV + FV) / PMT;
  }

  // Adjust payment for timing
  let adjustedPMT = PMT;
  if (PMTatBeginning) {
    adjustedPMT = PMT * (1 + i);
  }

  // Formula: N = log((adjustedPMT - FV * i) / (adjustedPMT + PV * i)) / log(1 + i)
  const numerator = adjustedPMT - FV * i;
  const denominator = adjustedPMT + PV * i;

  if (denominator === 0 || numerator / denominator <= 0) {
    throw new Error('Cannot solve for N with these parameters - no solution exists');
  }

  const N = Math.log(numerator / denominator) / Math.log(1 + i);

  return N;
}

/**
 * Solve for Interest Rate using Newton-Raphson method
 * This is an iterative numerical method since there's no closed-form solution
 */
function solveIY(inputs: TVMInputs): number {
  const { N, PV, PMT, FV, PY, CY, PMTatBeginning } = inputs;

  // Check for zero interest case
  if (PMT !== 0) {
    const simpleSum = PV + PMT * N + FV;
    if (Math.abs(simpleSum) < 0.01) {
      return 0;
    }
  }

  // Initial guess based on simple approximation
  let guess = 0.1; // Start with 10%

  // If we have only PV and FV (no payments), use simple compound interest formula
  if (PMT === 0 && PV !== 0 && FV !== 0) {
    const ratio = -FV / PV;
    if (ratio > 0) {
      guess = (Math.pow(ratio, 1 / N) - 1) * CY;
    }
  }

  // Newton-Raphson iteration
  const maxIterations = 100;
  const tolerance = 0.000001;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const i = calculateEffectiveRate(guess, PY, CY);

    if (i === 0) {
      guess += 0.01;
      continue;
    }

    // Calculate f(i) - the error in our current guess
    const pvFactor = Math.pow(1 + i, N);
    const pvComponent = PV * pvFactor;

    let pmtComponent: number;
    if (PMTatBeginning) {
      pmtComponent = PMT * ((pvFactor - 1) / i) * (1 + i);
    } else {
      pmtComponent = PMT * ((pvFactor - 1) / i);
    }

    const f = pvComponent + pmtComponent + FV;

    // Check if we've converged
    if (Math.abs(f) < tolerance) {
      return guess;
    }

    // Calculate f'(i) - the derivative
    const pvDerivative = PV * N * Math.pow(1 + i, N - 1);

    let pmtDerivative: number;
    if (PMTatBeginning) {
      const annuityPart = (pvFactor - 1) / i;
      const annuityDerivative = (N * pvFactor * i - pvFactor + 1) / (i * i);
      pmtDerivative = PMT * (annuityDerivative * (1 + i) + annuityPart);
    } else {
      pmtDerivative = PMT * (N * pvFactor * i - pvFactor + 1) / (i * i);
    }

    const df_di = pvDerivative + pmtDerivative;

    // Adjust for the effective rate calculation
    const di_dIY = Math.pow(1 + guess / 100 / CY, CY / PY - 1) / (100 * PY);
    const fPrime = df_di * di_dIY;

    if (Math.abs(fPrime) < 1e-10) {
      // Derivative too small, adjust guess and continue
      guess += 0.1;
      continue;
    }

    // Newton-Raphson update
    const newGuess = guess - f / fPrime;

    // Ensure guess stays reasonable
    if (newGuess < -99 || newGuess > 10000) {
      guess += (Math.random() - 0.5) * 10;
      continue;
    }

    guess = newGuess;
  }

  // If we didn't converge, return the best guess
  return guess;
}

/**
 * Main TVM calculation function
 */
export function calculateTVM(inputs: TVMInputs): TVMResults {
  const result: TVMResults = {
    N: inputs.N,
    IY: inputs.IY,
    PV: inputs.PV,
    PMT: inputs.PMT,
    FV: inputs.FV,
  };

  switch (inputs.solveFor) {
    case 'FV':
      result.FV = solveFV(inputs);
      break;
    case 'PV':
      result.PV = solvePV(inputs);
      break;
    case 'PMT':
      result.PMT = solvePMT(inputs);
      break;
    case 'N':
      result.N = solveN(inputs);
      break;
    case 'IY':
      result.IY = solveIY(inputs);
      break;
    default:
      throw new Error(`Unknown solve mode: ${inputs.solveFor}`);
  }

  return result;
}

/**
 * Generate an amortization schedule
 */
export interface AmortizationRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function generateAmortizationSchedule(
  PV: number,
  PMT: number,
  IY: number,
  N: number,
  PY: number = 12,
  CY: number = 12,
  PMTatBeginning: boolean = false
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const i = calculateEffectiveRate(IY, PY, CY);

  let balance = Math.abs(PV);

  for (let period = 1; period <= N; period++) {
    let interest: number;
    let principal: number;
    let payment: number;

    if (PMTatBeginning) {
      // Payment at beginning of period
      payment = Math.abs(PMT);
      principal = i === 0 ? payment : payment - balance * i;
      interest = i === 0 ? 0 : balance * i;
      balance = balance - principal;
    } else {
      // Payment at end of period
      interest = balance * i;
      payment = Math.abs(PMT);
      principal = payment - interest;
      balance = balance - principal;
    }

    schedule.push({
      period,
      payment,
      principal,
      interest,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}
