# Mortgage Calculator

A comprehensive mortgage calculator based on the reference implementation at calculator.net, with full feature parity and enhanced visualizations.

## Features

### Core Calculations
- **Monthly Payment**: Calculates principal & interest payment using standard amortization formula
- **Loan Amount**: Automatically calculated from home price and down payment
- **Total Interest**: Shows total interest paid over the life of the loan
- **Payoff Date**: Displays when the mortgage will be fully paid off

### Input Options

#### Basic Parameters
- **Home Price**: Purchase price of the property
- **Down Payment**: Initial payment (supports both dollar amount and percentage)
- **Loan Term**: Duration of the loan (10, 15, 20, or 30 years)
- **Interest Rate**: Annual percentage rate (APR)
- **Start Date**: Month and year when mortgage payments begin

#### Additional Costs
- **Property Tax**: Annual property tax amount
- **Home Insurance**: Annual home insurance premium
- **PMI**: Private Mortgage Insurance (automatically suggested when down payment < 20%)
- **HOA Fee**: Monthly homeowners association fees
- **Other Costs**: Monthly utilities, maintenance, and other expenses

#### Extra Payments
- **Extra Monthly Payment**: Additional recurring payment each month
- **Extra Yearly Payment**: Annual lump sum payment
- **One-Time Payments**: Multiple one-time payments at specific months

### Visualizations

1. **Monthly Payment Breakdown Chart**: Horizontal bar chart showing the composition of your monthly payment
2. **Loan Balance Over Time**: Interactive SVG chart showing how the loan balance decreases over time
3. **Amortization Schedule**: Detailed month-by-month or year-by-year breakdown of principal, interest, and balance

### Amortization Schedule

- **Monthly View**: Shows every payment with detailed breakdown
- **Annual View**: Consolidated yearly summary
- **Interactive**: Click to expand/collapse the schedule
- **Comprehensive Data**: Includes payment amount, principal, interest, extra payments, and remaining balance

## Implementation

### Calculation Logic

The calculator uses the standard mortgage amortization formula:

```
M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
```

Where:
- M = Monthly payment
- P = Principal loan amount
- r = Monthly interest rate (annual rate / 12)
- n = Total number of payments

### Test Coverage

The calculator includes comprehensive test coverage with 22 test cases covering:

- Basic calculations (loan amount, PMI requirements, monthly payments)
- Complete mortgage calculations with various scenarios
- Amortization schedule generation
- Extra payments (monthly, yearly, and one-time)
- Edge cases (very small/large loans, different terms)

All tests pass with 100% accuracy.

### File Structure

```
mortgage/
├── __tests__/
│   ├── mortgageCalculations.ts     # Core calculation library
│   └── mortgageCalculator.test.ts  # Comprehensive test suite
├── page.tsx                         # Main calculator UI component
└── README.md                        # This file
```

## Test Cases

### Test Scenario 1: Typical 30-Year Mortgage
- Home Price: $400,000
- Down Payment: $80,000 (20%)
- Loan Term: 30 years
- Interest Rate: 6.5%
- Monthly P&I: $2,022.62
- Total Interest: $408,142.36

### Test Scenario 2: With PMI (Less than 20% Down)
- Home Price: $300,000
- Down Payment: $30,000 (10%)
- Loan Term: 30 years
- Interest Rate: 6.75%
- Monthly P&I: $1,751.21
- Monthly PMI: $225.00

### Test Scenario 3: 15-Year Mortgage
- Home Price: $350,000
- Down Payment: $70,000 (20%)
- Loan Term: 15 years
- Interest Rate: 5.5%
- Monthly P&I: $2,287.83
- Total Payments: 180

### Test Scenario 4: Extra Payments Impact
- Extra Monthly Payment: $200
- Result: Loan paid off earlier with significantly reduced total interest

### Test Scenario 5: One-Time Payments
- One-time payments at months 12, 60, and 120
- Result: Reduces loan term and total interest paid

## Usage

### Basic Usage
1. Enter your home price
2. Set your down payment (as dollar amount or percentage)
3. Select your loan term
4. Enter your interest rate
5. Set the start date

### Including Additional Costs
1. Check "Include" for Additional Costs
2. Enter annual property tax
3. Enter annual home insurance
4. Add PMI if applicable (less than 20% down)
5. Add monthly HOA fees if applicable
6. Add other monthly costs

### Exploring Extra Payments
1. Expand the "Extra Payments" section
2. Add extra monthly payment amount
3. Specify when to start extra monthly payments
4. Add yearly extra payments
5. Add one-time payments at specific months

### Viewing Results
- Monthly payment breakdown shows all components
- Loan balance chart displays amortization visually
- Amortization schedule shows detailed month-by-month or annual data
- Toggle between monthly and annual views

## Key Features Matching Reference Calculator

✅ All input fields from calculator.net
✅ Down payment in both $ and % formats
✅ Property tax, home insurance, PMI, HOA fees
✅ Extra payment options (monthly, yearly, one-time)
✅ Multiple one-time payments support
✅ Start date selection (month/year)
✅ Monthly payment breakdown
✅ Total interest calculation
✅ Payoff date calculation
✅ Amortization schedule (monthly & annual views)
✅ Interactive visualizations
✅ Responsive design
✅ Real-time calculations

## SEO Keywords

- Mortgage calculator
- Home loan calculator
- Monthly mortgage payment calculator
- Mortgage amortization calculator
- House payment calculator
- Home loan payment calculator
- Mortgage payment estimator
- Refinance calculator
- Home affordability calculator
- PMI calculator
- Extra payment mortgage calculator
- Early payoff calculator
- Mortgage interest calculator
- 30-year mortgage calculator
- 15-year mortgage calculator

## Technical Details

### Dependencies
- React (Next.js)
- Framer Motion (animations)
- Lucide React (icons)
- TypeScript

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Touch-friendly interface

### Performance
- Real-time calculations (no delays)
- Efficient amortization schedule generation
- Smooth animations and transitions
- Optimized rendering

## Future Enhancements

Potential features for future versions:
- Biweekly payment option
- Comparison with rental costs
- Annual cost increase rates
- Tax deduction calculations
- Print/PDF export
- Save/share calculations
- Mortgage rate comparison
- Refinance analysis

## References

- Calculator.net Mortgage Calculator: https://www.calculator.net/mortgage-calculator.html
- Standard amortization formula
- PMI requirements and calculations
- Real estate industry best practices
