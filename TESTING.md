# Testing Guide

## Running Tests

We use [Vitest](https://vitest.dev/) for unit testing.

### Commands

```bash
# Run tests in watch mode (for development)
npm test

# Run tests once and exit
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Coverage

### Auto Loan Calculator Tests

Location: `src/lib/autoLoanCalculator.test.ts`

**Test Cases:**

1. **Basic calculations without tax/fees in loan**
   - $40k car with $5k down, $10k trade-in, 5% APR, 60 months
   - $50k car with $10k down, $0 trade-in, 5% APR, 60 months (default)
   - 0% interest rate handling
   - 36 month loan term
   - 72 month loan term

2. **Calculations with tax/fees included in loan**
   - Including sales tax and fees in loan amount
   - Trade-in with tax/fees in loan

3. **Edge cases**
   - Very high interest rates (15%)
   - Large down payment
   - Trade-in equal to price minus down payment (zero loan)

**Tests passing:** 10/10 ✅

### Personal Loan Calculator Tests

Location: `src/lib/personalLoanCalculator.test.ts`

**Test Cases:**

1. **Basic calculations**
   - $10k loan, 6% APR, 36 months
   - $20k loan, 5% APR, 60 months
   - $100k loan, 7% APR, 120 months
   - 0% interest rate handling

2. **Different loan terms**
   - 12 month loan
   - 24 month loan
   - 84 month loan

3. **Different interest rates**
   - Low interest rate (3%)
   - High interest rate (15%)
   - Very low rate (1.5%)

4. **Edge cases**
   - Large loan amounts ($500k)
   - Small loan amounts ($1k)
   - Very short term (6 months)

**Tests passing:** 13/13 ✅

### Total Test Coverage

**All tests passing:** 23/23 ✅

## Test Data Sources

Test cases were validated against:
- [Calculator.net Auto Loan Calculator](https://www.calculator.net/auto-loan-calculator.html)
- Standard amortization formula: `M = P × [r(1 + r)^n] / [(1 + r)^n - 1]`

## Writing New Tests

When adding new calculator features, follow this pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateAutoLoan, AutoLoanInputs } from './autoLoanCalculator';

describe('Feature Name', () => {
  it('should do something specific', () => {
    const inputs: AutoLoanInputs = {
      // your test data
    };

    const result = calculateAutoLoan(inputs);

    expect(result.monthlyPayment).toBeCloseTo(expectedValue, 2);
  });
});
```

## CI/CD Integration

Tests run automatically on:
- Pre-commit (via Husky)
- Pull requests
- Before deployment

To skip pre-commit hooks (not recommended):
```bash
git commit --no-verify
```
