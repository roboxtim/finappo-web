# Annuity Calculator

A comprehensive annuity accumulation calculator that helps users plan their retirement savings and investment growth.

## Features

### Input Fields
- **Starting Principal**: Initial lump sum investment
- **Annual Addition**: Yearly contribution (made as a lump sum once per year)
- **Monthly Addition**: Monthly contribution amount
- **Annual Growth Rate**: Expected annual return percentage (compounded monthly)
- **Time Period**: Investment duration in years
- **Addition Timing**: Choose between:
  - **Beginning (Annuity Due)**: Annual additions made at the start of each year (months 1, 13, 25, etc.)
  - **End (Ordinary Annuity)**: Annual additions made at the end of each year (months 12, 24, 36, etc.)

### Calculations
- **End Balance**: Total value after the specified time period
- **Total Additions**: Sum of all contributions (starting principal + all annual and monthly additions)
- **Total Interest Earned**: Investment growth (End Balance - Starting Principal - Total Additions)
- **Return on Investment**: Percentage return on total invested amount

### Visualizations
- **Progress Bar**: Visual breakdown showing:
  - Starting Principal percentage
  - Total Additions percentage
  - Interest Earned percentage
- **Accumulation Schedule**: View month-by-month or year-by-year growth
- **Monthly Schedule**: Detailed breakdown of each month's addition, interest, and balance
- **Annual Schedule**: Yearly summary of contributions and growth

## Calculation Method

The calculator uses proper compound interest formulas:

1. Interest is calculated monthly: `monthlyRate = annualRate / 12`
2. For each month:
   - Calculate interest on current balance
   - Add monthly contribution (if any)
   - Add annual contribution (if it's that month based on timing setting)
3. Balance compounds monthly throughout the entire period

### Annual Addition Timing

**Annuity Due (Beginning)**:
- Year 1: Annual addition at month 1
- Year 2: Annual addition at month 13
- Year 3: Annual addition at month 25
- And so on...

**Ordinary Annuity (End)**:
- Year 1: Annual addition at month 12
- Year 2: Annual addition at month 24
- Year 3: Annual addition at month 36
- And so on...

## Example Scenarios

### Retirement Savings
- Starting Principal: $25,000
- Monthly Addition: $500
- Annual Addition: $6,000 (annual bonus)
- Growth Rate: 7.5%
- Duration: 30 years
- Result: Significant retirement nest egg with compound growth

### Short-term Investment
- Starting Principal: $10,000
- Annual Addition: $5,000
- Growth Rate: 12%
- Duration: 1 year
- Result: Quick visualization of first-year growth

## Technical Implementation

### Files
- `page.tsx`: Main calculator component with UI and calculation logic
- `layout.tsx`: SEO metadata and page layout
- `__tests__/annuity-calculations.test.ts`: Comprehensive test suite

### Testing
10 test cases covering:
- Annual additions
- Monthly additions
- Combined monthly and annual additions
- Annuity due vs ordinary annuity comparison
- Zero interest scenarios
- Edge cases (zero principal, long-term, short-term)
- Schedule generation accuracy

### Technologies
- React with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vitest for testing
- CalculatorLayout component for consistent design

## SEO Keywords
- annuity calculator
- retirement savings calculator
- annuity payment calculator
- future value calculator
- compound interest calculator
- annuity due calculator
- ordinary annuity calculator
- investment growth calculator
- retirement planning tool

## Notes

This calculator focuses on the **accumulation phase** of an annuity, showing how investments grow over time with regular contributions and compound interest. It does not calculate annuity payouts or income distributions.

The reference calculator at calculator.net was analyzed, but we implemented standard financial mathematics formulas to ensure accuracy and reliability. The calculation method follows widely-accepted compound interest principles with monthly compounding.
