# Real Estate Calculator

A comprehensive real estate investment calculator that helps users analyze the complete financial picture of home ownership, including mortgage payments, equity buildup, property appreciation, tax deductions, and total cost of ownership over time.

## Features

### Core Calculations
- **Monthly Mortgage Payment (P&I)**: Using standard amortization formula
- **PMI Calculation**: Automatic PMI calculation when down payment < 20%
- **Total Monthly Payment**: Including all costs (mortgage, property tax, insurance, PMI, HOA, maintenance)
- **Home Equity Growth**: Tracking down payment, principal paydown, and appreciation
- **Property Appreciation**: Compound annual growth of home value
- **Tax Deductions**: Mortgage interest tax savings based on income tax rate
- **Net Investment Cost**: Total cost minus home value and tax savings

### Input Options
1. **Purchase Details**
   - Home purchase price
   - Down payment (switchable between % and $)
   - Loan term (10, 15, 20, 25, 30 years)
   - Interest rate (APR)

2. **Annual Costs**
   - Property tax (annual)
   - Home insurance (annual)
   - HOA fees (monthly)
   - Maintenance costs (annual)

3. **Growth & Tax Rates**
   - Home appreciation rate
   - Property tax increase rate
   - Insurance increase rate
   - Income tax rate (for interest deduction)
   - Analysis period (5-30 years)

### Visualizations
1. **Equity & Home Value Growth Chart**: Interactive SVG chart showing:
   - Home value growth over time
   - Equity buildup
   - Loan balance reduction
   - Hover tooltips with detailed information

2. **Monthly Cost Breakdown**: Visual breakdown of all monthly costs

3. **Investment Summary Cards**: Key metrics including:
   - Home value after N years
   - Total equity built
   - Total interest paid
   - Tax savings
   - Net cost

4. **Year-by-Year Breakdown**: Expandable table showing:
   - Home value by year
   - Equity by year
   - Loan balance
   - Annual costs
   - Tax savings

## Design Features
- Clean, modern UI with blue-to-indigo gradient theme
- Smooth animations using Framer Motion
- Fully responsive design
- NO sticky positioning (all content scrolls naturally)
- Interactive charts with hover states
- Real-time calculations as inputs change

## Test Coverage

Comprehensive test suite with 7 test cases covering:

1. **Standard 30-year mortgage**: $400k home, 20% down, 7% interest
2. **First-time homebuyer**: $300k home, 10% down with PMI
3. **High-value property**: $800k home, 15-year term
4. **Minimal down payment**: 5% down with PMI
5. **Condo scenario**: High HOA fees, lower maintenance
6. **Edge case**: Zero interest rate
7. **Investment property**: Higher interest rate

All tests validate:
- Loan amount calculations
- Monthly mortgage payment accuracy
- PMI calculations
- Down payment conversions
- Edge cases and rounding

## Calculation Formulas

### Monthly Mortgage Payment
```
M = P × [r(1+r)^n] / [(1+r)^n-1]
```
Where:
- M = Monthly payment
- P = Principal loan amount
- r = Monthly interest rate (annual / 12)
- n = Number of payments (years × 12)

### PMI (Private Mortgage Insurance)
- Required when down payment < 20%
- Typically 0.5% of loan amount annually
- Removed when equity reaches 20%

### Home Value After N Years
```
Value = Initial Price × (1 + appreciation rate)^years
```

### Total Equity
```
Equity = Down Payment + Principal Paid + (Current Value - Purchase Price)
```

### Annual Tax Savings
```
Savings = Mortgage Interest Paid × Income Tax Rate
```

## SEO Optimization

The calculator includes comprehensive SEO metadata:

**Title**: Real Estate Calculator - Home Investment Analysis | Finappo

**Keywords**:
- real estate calculator
- home investment calculator
- property calculator
- mortgage calculator
- home equity calculator
- property appreciation
- home buying calculator
- real estate investment
- home affordability
- PMI calculator
- property tax calculator
- home ownership costs
- mortgage interest deduction
- home value calculator

**Description**: Comprehensive real estate calculator to analyze home purchase costs, mortgage payments, equity buildup, property appreciation, tax deductions, and total investment returns over time.

## Educational Content

The calculator includes extensive educational sections explaining:
- How home ownership costs are calculated
- Building home equity (three components)
- Tax benefits of homeownership
- Understanding PMI
- Home appreciation rates
- Important considerations
- Detailed calculation formulas

## File Structure

```
/src/app/financial-calculators/real-estate/
├── layout.tsx           # SEO metadata and layout wrapper
├── page.tsx            # Main calculator component
├── README.md           # This file
└── __tests__/
    └── realEstateCalculator.test.ts  # Comprehensive test suite
```

## Usage Example

```typescript
// Default values for a typical home purchase
Home Price: $400,000
Down Payment: 20% ($80,000)
Loan Term: 30 years
Interest Rate: 7.0%
Property Tax: $4,800/year
Home Insurance: $1,500/year
HOA: $0/month
Maintenance: $4,000/year
Appreciation: 3.0%
Tax Rate: 22%

Results:
- Monthly Mortgage: $2,128.97
- Total Monthly Payment: $2,987.30
- Home Value After 30 Years: $971,226
- Total Equity Built: $971,226
- Tax Savings: ~$105,000
```

## Integration

The calculator has been added to:
- `/calculators` page in the Financial Calculators category
- Accessible at `/financial-calculators/real-estate`
- Listed alongside other financial calculators

## Testing

Run tests with:
```bash
npm test src/app/financial-calculators/real-estate/__tests__/realEstateCalculator.test.ts
```

All 7 test cases pass with accurate calculations validated against standard mortgage formulas.

## Future Enhancements

Potential additions:
- Comparison mode (rent vs buy)
- Additional closing costs
- Refinancing scenarios
- Extra payment scheduling
- Multiple property comparison
- Investment property cash flow analysis
- Rental income calculations
