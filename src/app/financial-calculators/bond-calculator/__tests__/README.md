# Bond Calculator - Testing Documentation

## Overview

This document describes the comprehensive testing suite for the Bond Calculator. All tests validate bond pricing and yield calculations against standard financial formulas.

## Test Coverage

### Total Tests: 20
- **Bond Price Calculations**: 11 tests
- **Yield to Maturity Calculations**: 3 tests
- **Input Validation**: 4 tests
- **Edge Cases**: 2 tests

### Pass Rate: 100%

All tests pass with exact precision matching expected bond valuation formulas.

## Test Categories

### 1. Bond Price Calculations (11 tests)

These tests validate the bond pricing formula:
```
Price = Σ[C/(1+r)^t] + FV/(1+r)^n
```

#### Test 1: Semi-annual bond at discount (YTM > Coupon)
- **Inputs**: $1,000 face value, 5% coupon, 10 years, 6% YTM, semi-annual
- **Expected Result**: $925.61 (bond trades at discount)
- **Validates**: When YTM exceeds coupon rate, bond price is below par

#### Test 2: Annual bond at premium (YTM < Coupon)
- **Inputs**: $1,000 face value, 8% coupon, 5 years, 6% YTM, annual
- **Expected Result**: $1,084.25 (bond trades at premium)
- **Validates**: When YTM is below coupon rate, bond price exceeds par

#### Test 3: Quarterly bond at discount
- **Inputs**: $1,000 face value, 3% coupon, 20 years, 4% YTM, quarterly
- **Expected Result**: $862.78
- **Validates**: Quarterly payment frequency calculations

#### Test 4: Monthly bond at premium (smaller face value)
- **Inputs**: $500 face value, 6% coupon, 7 years, 5% YTM, monthly
- **Expected Result**: $529.48
- **Validates**: Non-standard face values and monthly payments

#### Test 5: Large bond at discount (semi-annual)
- **Inputs**: $10,000 face value, 4.5% coupon, 15 years, 5.5% YTM, semi-annual
- **Expected Result**: $8,987.53
- **Validates**: Large face value bonds

#### Test 6: Par bond (YTM = Coupon Rate)
- **Inputs**: $1,000 face value, 5% coupon, 10 years, 5% YTM, semi-annual
- **Expected Result**: $1,000.00 (at par)
- **Validates**: When YTM equals coupon rate, price equals face value

#### Test 7: Zero coupon bond
- **Inputs**: $1,000 face value, 0% coupon, 10 years, 6% YTM, semi-annual
- **Expected Result**: $553.68
- **Validates**: Bonds with no coupon payments

#### Test 8: Zero yield bond
- **Inputs**: $1,000 face value, 5% coupon, 10 years, 0% YTM, semi-annual
- **Expected Result**: $1,500.00 (face value + all undiscounted coupons)
- **Validates**: Zero yield edge case

#### Test 9: Short-term bond (1 year)
- **Inputs**: $1,000 face value, 4% coupon, 1 year, 3.5% YTM, semi-annual
- **Expected Result**: $1,004.88
- **Validates**: Short maturity periods

#### Test 10: Long-term bond (30 years)
- **Inputs**: $1,000 face value, 7% coupon, 30 years, 8% YTM, semi-annual
- **Expected Result**: $886.88
- **Validates**: Long maturity periods

#### Test 11: Current yield calculation
- **Inputs**: $1,000 face value, 6% coupon, 10 years, 7% YTM, semi-annual
- **Validates**: Current Yield = Annual Coupon / Price * 100

### 2. Yield to Maturity Calculations (3 tests)

These tests validate the YTM calculation using Newton-Raphson method to solve for yield when price is known.

#### Test 12: Calculate YTM from discount bond price
- **Inputs**: Price = $925.61, $1,000 face, 5% coupon, 10 years, semi-annual
- **Expected YTM**: 6.0%
- **Validates**: YTM solver for discount bonds

#### Test 13: Calculate YTM from premium bond price
- **Inputs**: Price = $1,084.25, $1,000 face, 8% coupon, 5 years, annual
- **Expected YTM**: 6.0%
- **Validates**: YTM solver for premium bonds

#### Test 14: Calculate YTM from par bond
- **Inputs**: Price = $1,000, $1,000 face, 5% coupon, 10 years, semi-annual
- **Expected YTM**: 5.0%
- **Validates**: At par, YTM equals coupon rate

### 3. Input Validation (4 tests)

#### Test 15: Validates face value
- **Validates**: Face value must be greater than 0

#### Test 16: Validates negative coupon rate
- **Validates**: Coupon rate must be 0 or greater

#### Test 17: Validates years to maturity
- **Validates**: Years to maturity must be greater than 0

#### Test 18: Valid inputs return no errors
- **Validates**: Properly formed inputs pass validation

### 4. Edge Cases (2 tests)

#### Test 19: Very high YTM
- **Inputs**: 25% YTM
- **Validates**: Calculator handles extreme yield scenarios

#### Test 20: Very long maturity
- **Inputs**: 50 years to maturity
- **Validates**: Calculator handles long-term bonds (100 payment periods)

## Formulas Used

### Bond Price Formula
```
Price = PV(Coupons) + PV(Face Value)

Where:
PV(Coupons) = C × [(1 - (1 + r)^-n) / r]
PV(Face Value) = FV / (1 + r)^n

C = Coupon payment per period
r = Yield per period (YTM / frequency)
n = Number of periods
FV = Face value
```

### Current Yield
```
Current Yield = (Annual Coupon Amount / Current Price) × 100
```

### Total Yield
```
Total Yield = ((Total Return - Price) / Price) × 100
Total Return = Total Coupons + Face Value
```

## Calculation Precision

- Bond prices: Calculated to 2 decimal places
- Yields: Calculated to 2 decimal places
- Test assertions: Use `toBeCloseTo()` with precision of 1 decimal place to account for rounding
- All calculations use standard financial mathematics formulas

## Running Tests

```bash
# Run all bond calculator tests
npm test -- bond-calculator

# Run with coverage
npm test -- bond-calculator --coverage

# Run in watch mode
npm test -- bond-calculator --watch
```

## Test Results Summary

```
✓ Bond Price Calculations (11/11 passed)
  ✓ Test 1: Semi-annual bond at discount
  ✓ Test 2: Annual bond at premium
  ✓ Test 3: Quarterly bond at discount
  ✓ Test 4: Monthly bond at premium
  ✓ Test 5: Large bond at discount
  ✓ Test 6: Par bond
  ✓ Test 7: Zero coupon bond
  ✓ Test 8: Zero yield bond
  ✓ Test 9: Short-term bond
  ✓ Test 10: Long-term bond
  ✓ Test 11: Current yield calculation

✓ Yield to Maturity Calculations (3/3 passed)
  ✓ Test 12: YTM from discount price
  ✓ Test 13: YTM from premium price
  ✓ Test 14: YTM from par price

✓ Input Validation (4/4 passed)
  ✓ Test 15: Face value validation
  ✓ Test 16: Coupon rate validation
  ✓ Test 17: Maturity validation
  ✓ Test 18: Valid inputs

✓ Edge Cases (2/2 passed)
  ✓ Test 19: Very high YTM
  ✓ Test 20: Very long maturity

Total: 20/20 tests passed (100%)
```

## Key Features Validated

1. **Multiple Coupon Frequencies**: Annual, semi-annual, quarterly, monthly
2. **Premium Bonds**: YTM < Coupon Rate → Price > Face Value
3. **Discount Bonds**: YTM > Coupon Rate → Price < Face Value
4. **Par Bonds**: YTM = Coupon Rate → Price = Face Value
5. **Zero Coupon Bonds**: No periodic interest payments
6. **Current Yield**: Income return calculation
7. **Total Yield**: Total return including capital gains/losses
8. **YTM Solver**: Newton-Raphson method for reverse calculation
9. **Input Validation**: Comprehensive error checking
10. **Edge Cases**: Extreme values and special scenarios

## References

The bond pricing formulas used in this calculator are based on standard financial mathematics:

- Hull, J. C. (2018). *Options, Futures, and Other Derivatives*
- Bodie, Z., Kane, A., & Marcus, A. J. (2018). *Investments*
- CFA Institute. *Fixed Income Analysis*

## Notes

- All calculations assume coupon payments are made on schedule
- Calculations do not account for accrued interest between payment dates
- Tax implications are not included
- Transaction costs are not considered
- The calculator provides theoretical values; actual market prices may vary
