# Interest Calculator

## Overview
A comprehensive interest calculator that supports both simple and compound interest calculations with optional regular contributions, tax considerations, and inflation adjustments.

## Features

### Core Functionality
- **Simple Interest**: Basic interest calculation on principal amount only
- **Compound Interest**: Interest calculated on principal plus accumulated interest
- **Multiple Compounding Frequencies**:
  - Annually
  - Semi-annually
  - Quarterly
  - Monthly
  - Semi-monthly
  - Bi-weekly
  - Weekly
  - Daily

### Additional Features
- **Regular Contributions**: Support for monthly and annual contributions
- **Contribution Timing**: Choose to contribute at beginning or end of period
- **Tax Calculations**: Apply tax rate to interest earnings
- **Inflation Adjustment**: See real purchasing power after inflation
- **Visual Charts**: Interactive growth chart showing investment progress
- **Amortization Schedule**: Detailed period-by-period breakdown

## Calculation Formulas

### Simple Interest
```
Interest = Principal × Rate × Time
Total = Principal + Interest
```

### Compound Interest
```
A = P(1 + r/n)^(nt)

Where:
- A = Final amount
- P = Principal
- r = Annual interest rate (decimal)
- n = Number of times interest compounds per year
- t = Time in years
```

### With Regular Contributions
For compound interest with regular contributions, the formula becomes more complex as each contribution starts earning interest from when it's added.

## Test Coverage

The calculator includes comprehensive test coverage validating:
- Simple interest calculations
- Compound interest with various frequencies
- Monthly and annual contributions
- Contribution timing (beginning vs end of period)
- Tax and inflation adjustments
- Edge cases (zero rates, very high rates, fractional years)

All tests are located in `__tests__/interest.test.ts` and can be run with:
```bash
npm test -- src/app/financial-calculators/interest/__tests__/interest.test.ts
```

## SEO Keywords

- interest calculator
- compound interest calculator
- simple interest calculator
- investment calculator
- savings calculator
- compound interest with contributions
- monthly compound interest
- daily compound interest
- interest rate calculator
- investment growth calculator
- retirement savings calculator
- compound interest formula
- simple interest formula

## User Guide

### Basic Usage
1. **Choose Interest Type**: Select between Simple or Compound interest
2. **Enter Principal**: The initial investment amount
3. **Set Interest Rate**: Annual percentage rate (APR)
4. **Choose Time Period**: Investment duration in years and months
5. **Select Compounding**: For compound interest, choose how often interest compounds

### Advanced Options
- **Regular Contributions**: Add monthly or annual contributions to accelerate growth
- **Contribution Timing**: Contribute at beginning of period for slightly higher returns
- **Tax Rate**: See after-tax returns based on your tax bracket
- **Inflation Rate**: Understand real purchasing power of future value

### Understanding Results
- **Ending Balance**: Total value at the end of investment period
- **Total Contributions**: Sum of initial investment and all regular contributions
- **Total Interest**: Amount earned from interest alone
- **Investment Breakdown**: Visual chart showing proportion of principal vs interest
- **Growth Chart**: Interactive visualization of balance over time
- **Schedule**: Detailed table showing period-by-period calculations

## Technical Implementation

### Technologies Used
- **React/Next.js**: Component framework
- **TypeScript**: Type-safe implementation
- **Framer Motion**: Smooth animations
- **Tailwind CSS**: Responsive styling
- **Lucide Icons**: Modern icon library

### Component Structure
- Main calculator component: `page.tsx`
- Calculation logic embedded in component for real-time updates
- Reusable CalculatorLayout for consistent UI
- Responsive grid layout for inputs and results

### Performance Optimizations
- useCallback hooks for memoized calculations
- Efficient re-rendering with proper React dependencies
- Optimized chart rendering with SVG
- Lazy calculation of amortization schedule

## Comparison with Reference Calculator

This implementation replicates the functionality of calculator.net's interest calculator with improvements:
- Modern, responsive UI design
- Real-time calculation updates
- Interactive visualizations
- Better mobile experience
- Clear separation of simple vs compound interest
- More intuitive contribution options

## Future Enhancements

Potential improvements for future versions:
- Export results to PDF or CSV
- Save/load calculation scenarios
- Compare multiple investment scenarios
- Add more investment types (bonds, CDs)
- Historical rate data integration
- Goal-based planning features