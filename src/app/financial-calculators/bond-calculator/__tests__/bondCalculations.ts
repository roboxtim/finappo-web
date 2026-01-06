/**
 * Bond Calculator - Calculation Logic and Types
 *
 * This module implements bond pricing and yield calculations based on standard
 * financial formulas. It supports various coupon frequencies and calculation modes.
 */

export interface BondInputs {
  faceValue: number; // Par value of the bond
  couponRate: number; // Annual coupon rate as percentage
  yearsToMaturity: number; // Time to maturity in years
  yieldToMaturity: number; // Yield to maturity as percentage
  couponFrequency: number; // Payments per year (1=annual, 2=semi-annual, 4=quarterly, 12=monthly)
  price?: number; // Bond price (for solving for YTM)
}

export interface BondResults {
  price: number; // Bond price (clean price)
  couponPayment: number; // Coupon payment per period
  numberOfPayments: number; // Total number of coupon payments
  totalCouponPayments: number; // Total of all coupon payments
  totalReturn: number; // Total return (coupons + face value)
  currentYield: number; // Current yield percentage
  totalYield: number; // Total yield (gain/loss) as percentage
  annualCouponAmount: number; // Total annual coupon amount
}

/**
 * Calculate bond price given yield
 * Uses the present value formula for bonds:
 * Price = Σ[C/(1+r)^t] + FV/(1+r)^n
 * Where:
 * C = coupon payment per period
 * r = yield per period
 * t = period number
 * FV = face value
 * n = total number of periods
 */
export function calculateBondPrice(inputs: BondInputs): BondResults {
  const {
    faceValue,
    couponRate,
    yearsToMaturity,
    yieldToMaturity,
    couponFrequency,
  } = inputs;

  // Calculate derived values
  const numberOfPayments = yearsToMaturity * couponFrequency;
  const couponPayment = (faceValue * (couponRate / 100)) / couponFrequency;
  const yieldPerPeriod = yieldToMaturity / 100 / couponFrequency;

  let price = 0;

  // Special case: zero coupon bond or zero yield
  if (yieldPerPeriod === 0) {
    // When yield is 0%, price = all future cash flows undiscounted
    price = couponPayment * numberOfPayments + faceValue;
  } else {
    // Present value of coupon payments (annuity formula)
    const pvCoupons =
      couponPayment *
      ((1 - Math.pow(1 + yieldPerPeriod, -numberOfPayments)) / yieldPerPeriod);

    // Present value of face value (single payment)
    const pvFaceValue =
      faceValue / Math.pow(1 + yieldPerPeriod, numberOfPayments);

    price = pvCoupons + pvFaceValue;
  }

  // Calculate other metrics
  const totalCouponPayments = couponPayment * numberOfPayments;
  const totalReturn = totalCouponPayments + faceValue;
  const annualCouponAmount = faceValue * (couponRate / 100);

  // Current yield = Annual coupon / Current price
  const currentYield = price > 0 ? (annualCouponAmount / price) * 100 : 0;

  // Total yield = (Total return - Price) / Price * 100
  const totalYield = price > 0 ? ((totalReturn - price) / price) * 100 : 0;

  return {
    price,
    couponPayment,
    numberOfPayments,
    totalCouponPayments,
    totalReturn,
    currentYield,
    totalYield,
    annualCouponAmount,
  };
}

/**
 * Calculate yield to maturity given price
 * Uses Newton-Raphson method to solve for yield
 * This is an iterative approximation since there's no closed-form solution
 */
export function calculateYieldToMaturity(inputs: BondInputs): number {
  const { faceValue, couponRate, yearsToMaturity, couponFrequency, price } =
    inputs;

  if (!price || price <= 0) {
    return 0;
  }

  const numberOfPayments = yearsToMaturity * couponFrequency;
  const couponPayment = (faceValue * (couponRate / 100)) / couponFrequency;

  // Initial guess: approximate YTM
  const annualCoupon = faceValue * (couponRate / 100);
  let ytm =
    ((annualCoupon + (faceValue - price) / yearsToMaturity) /
      ((faceValue + price) / 2)) *
    100;

  // Newton-Raphson iteration
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    const yieldPerPeriod = ytm / 100 / couponFrequency;

    // Calculate bond price with current YTM guess
    let calculatedPrice: number;
    let priceDerivative: number;

    if (yieldPerPeriod === 0) {
      calculatedPrice = couponPayment * numberOfPayments + faceValue;
      priceDerivative = 0;
    } else {
      const pvCoupons =
        couponPayment *
        ((1 - Math.pow(1 + yieldPerPeriod, -numberOfPayments)) /
          yieldPerPeriod);
      const pvFaceValue =
        faceValue / Math.pow(1 + yieldPerPeriod, numberOfPayments);
      calculatedPrice = pvCoupons + pvFaceValue;

      // Calculate derivative for Newton-Raphson
      // d(Price)/d(yield) = -Σ[t * C / (1+r)^(t+1)] - n * FV / (1+r)^(n+1)
      let derivative = 0;
      for (let t = 1; t <= numberOfPayments; t++) {
        derivative +=
          (-t * couponPayment) / Math.pow(1 + yieldPerPeriod, t + 1);
      }
      derivative +=
        (-numberOfPayments * faceValue) /
        Math.pow(1 + yieldPerPeriod, numberOfPayments + 1);

      // Convert to annual yield derivative
      priceDerivative = derivative / couponFrequency / 100;
    }

    // Check convergence
    const priceDifference = calculatedPrice - price;
    if (Math.abs(priceDifference) < tolerance) {
      return ytm;
    }

    // Update YTM using Newton-Raphson
    if (priceDerivative !== 0) {
      ytm = ytm - priceDifference / priceDerivative;
    } else {
      // Fallback to bisection if derivative is zero
      if (calculatedPrice > price) {
        ytm += 0.1;
      } else {
        ytm -= 0.1;
      }
    }

    // Keep YTM in reasonable range
    ytm = Math.max(-50, Math.min(100, ytm));
  }

  return ytm;
}

/**
 * Validate bond inputs
 */
export function validateBondInputs(inputs: Partial<BondInputs>): string[] {
  const errors: string[] = [];

  if (!inputs.faceValue || inputs.faceValue <= 0) {
    errors.push('Face value must be greater than 0');
  }

  if (inputs.couponRate === undefined || inputs.couponRate < 0) {
    errors.push('Coupon rate must be 0 or greater');
  }

  if (!inputs.yearsToMaturity || inputs.yearsToMaturity <= 0) {
    errors.push('Years to maturity must be greater than 0');
  }

  if (
    inputs.yieldToMaturity === undefined ||
    inputs.yieldToMaturity < -50 ||
    inputs.yieldToMaturity > 100
  ) {
    errors.push('Yield to maturity must be between -50% and 100%');
  }

  if (!inputs.couponFrequency || inputs.couponFrequency <= 0) {
    errors.push('Coupon frequency must be selected');
  }

  return errors;
}
