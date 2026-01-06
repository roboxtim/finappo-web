# Interest Rate Calculator

A comprehensive reverse calculator that solves for the interest rate when you know the loan amount, term, and monthly payment.

## Overview

This calculator helps users determine the actual interest rate (APR) on a loan when they have:
- Loan amount (principal)
- Loan term (in months)
- Monthly payment amount

This is particularly useful when dealers or lenders only provide monthly payment information without clearly stating the interest rate.

## Features Implemented

### Core Functionality
- ✅ **Reverse Rate Calculation**: Uses Newton-Raphson numerical method to find the interest rate
- ✅ **Accurate Results**: Precision to 3 decimal places (e.g., 5.065%)
- ✅ **Comprehensive Validation**: Checks for invalid inputs and insufficient payments
- ✅ **Real-time Calculation**: Updates results as you type

### UI Components
- ✅ **Standard Structure**: Navigation + main content (NO CalculatorLayout)
- ✅ **40/60 Split Layout**: Left column for inputs, right column for results
- ✅ **Gradient Header Card**: Purple gradient showing the calculated APR
- ✅ **Payment Breakdown Chart**: Visual representation of principal vs. interest
- ✅ **Error Handling**: Clear error messages for invalid inputs
- ✅ **Educational Content**: Comprehensive explanation of how the calculator works

### Design Elements
- ✅ **Responsive Design**: Works on all device sizes
- ✅ **Framer Motion Animations**: Smooth fade-in and slide animations
- ✅ **Tailwind CSS Styling**: Modern, clean design
- ✅ **Purple Theme**: Consistent purple/violet color scheme
- ✅ **Accessibility**: Semantic HTML and proper ARIA labels

### SEO & Metadata
- ✅ **Complete SEO Metadata**: Title, description, keywords
- ✅ **Open Graph Tags**: Social media sharing optimized
- ✅ **Twitter Card**: Proper Twitter sharing
- ✅ **Canonical URL**: Proper SEO structure

## Test Suite

### Test Coverage (11 Tests - All Passing ✅)

1. **Standard Auto Loan**: $10,000 over 12 months with $850 payment → 3.67% APR
2. **Personal Loan**: $25,000 over 60 months with $475 payment → 5.28% APR
3. **Long-term Loan**: $50,000 over 120 months with $555 payment → 5.99% APR
4. **Short-term Loan**: $5,000 over 24 months with $220 payment → 5.29% APR
5. **Mortgage Simulation**: $100,000 over 360 months with $600 payment → 6.01% APR
6. **Zero Interest**: $12,000 over 12 months with $1,000 payment → 0% APR
7. **High Interest**: $10,000 over 24 months with $500 payment → 18.16% APR
8. **Reference Match**: $32,000 over 36 months → Matches calculator.net example (5.065% APR)
9. **Error: Low Payment**: Throws error when payment is insufficient
10. **Error: Invalid Inputs**: Throws error for negative or zero values
11. **Precision Test**: Verifies calculated rates produce exact payment amounts

### Test Results
```
✓ src/app/financial-calculators/interest-rate/__tests__/interestRateCalculations.test.ts (11 tests) 3ms

Test Files  1 passed (1)
Tests  11 passed (11)
```

## Calculation Logic

### Newton-Raphson Method

The calculator uses the Newton-Raphson numerical method to find the interest rate that satisfies the loan payment formula:

```
M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
```

Where:
- **M** = Monthly payment (known)
- **P** = Principal loan amount (known)
- **r** = Monthly interest rate (solving for this)
- **n** = Number of months (known)

### Algorithm Steps

1. **Initial Guess**: Calculate an approximate rate based on total interest
2. **Iteration**: Use Newton-Raphson method with finite difference for derivative
3. **Convergence**: Continue until the calculated payment matches the target within tolerance
4. **Conversion**: Convert monthly rate to annual percentage rate (APR)

### Validation

- Ensures all inputs are positive numbers
- Verifies monthly payment is sufficient to pay off the loan
- Returns precise results that verify correctly

## File Structure

```
/financial-calculators/interest-rate/
├── page.tsx                          # Main calculator component
├── layout.tsx                        # SEO metadata and layout
├── README.md                         # This file
└── __tests__/
    ├── interestRateCalculations.ts   # Calculation logic
    └── interestRateCalculations.test.ts  # Test suite
```

## Usage Example

```typescript
const inputs: InterestRateInputs = {
  loanAmount: 32000,
  loanTermMonths: 36,
  monthlyPayment: 960,
};

const results = calculateInterestRate(inputs);
// results.annualInterestRate = 5.065
// results.totalPayment = 34560
// results.totalInterest = 2560
```

## Reference Calculator

Based on: https://www.calculator.net/interest-rate-calculator.html

The implementation matches the reference calculator's results, as verified in test case 8.

## Technical Details

- **Framework**: Next.js 14 with App Router
- **TypeScript**: Strict mode enabled
- **Testing**: Vitest
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Initial load: ~153 kB
- Client-side rendering for instant updates
- No external API calls
- Calculations complete in <1ms

## Future Enhancements

Potential improvements (not currently implemented):
- APY (Annual Percentage Yield) calculation
- Comparison with target rate
- Export results to PDF
- Save calculation history
- Chart showing interest over time
