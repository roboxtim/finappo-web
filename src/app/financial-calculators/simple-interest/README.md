# Simple Interest Calculator

A comprehensive simple interest calculator based on the reference calculator at [calculator.net](https://www.calculator.net/simple-interest-calculator.html).

## Features Implemented

### Core Functionality
- **Simple Interest Calculation**: Calculate interest using the formula I = P × r × t
- **Principal Amount Input**: Support for any principal amount with formatted display
- **Interest Rate Input**: Annual percentage rate with decimal support
- **Time Period Input**: Years and additional months for precise time calculations
- **Real-time Calculations**: Automatic updates as inputs change

### Results Display
- **Total Interest Earned**: Prominently displayed total interest
- **End Balance**: Final balance after interest accumulation
- **Principal Breakdown**: Visual percentage breakdown of principal vs interest
- **Formula Explanation**: Interactive formula display with actual values
- **Yearly Schedule**: Detailed year-by-year breakdown of interest accumulation

### Visual Features
- **Responsive Design**: Optimized for all device sizes
- **Framer Motion Animations**: Smooth transitions and entrance animations
- **Color-coded Charts**: Easy-to-understand visual breakdown
- **Tailwind CSS Styling**: Modern, clean interface
- **Accordion Schedule**: Expandable yearly interest schedule

### Educational Content
- **What is Simple Interest**: Comprehensive explanation
- **Simple vs Compound Interest**: Detailed comparison table
- **Common Use Cases**: When simple interest is typically used
- **Example Calculations**: Step-by-step calculation examples
- **Advantages**: Key benefits of simple interest
- **Important Considerations**: Things to keep in mind

## Test Suite

### Test Coverage: 17 Comprehensive Tests

#### Basic Calculations (5 tests)
1. ✅ $10,000 at 5% for 5 years → $2,500 interest
2. ✅ $20,000 at 3% for 10 years → $6,000 interest (Reference Example)
3. ✅ $50,000 at 4.5% for 3 years → $6,750 interest
4. ✅ $100,000 at 6.25% for 7 years → $43,750 interest
5. ✅ $5,000 at 2.5% for 2 years → $250 interest

#### Calculations with Months (4 tests)
6. ✅ $10,000 at 5% for 6 months → $250 interest
7. ✅ $15,000 at 4% for 2 years 3 months → $1,350 interest
8. ✅ $25,000 at 3.5% for 18 months → $1,312.50 interest
9. ✅ $8,000 at 7% for 5 years 9 months → $3,220 interest

#### Edge Cases (5 tests)
10. ✅ Zero interest rate → $0 interest
11. ✅ Zero time period → $0 interest
12. ✅ Very high interest rate (25%) → Correct calculation
13. ✅ Large principal ($1,000,000) → Accurate handling
14. ✅ Small principal with decimals → Precise calculation

#### Schedule Generation (2 tests)
15. ✅ Yearly schedule for 5 years → Correct yearly breakdown
16. ✅ Partial year handling → Correct partial year interest

#### Percentage Calculations (1 test)
17. ✅ Interest percentage calculation → Correct proportions

All tests validate against the reference calculator at calculator.net to ensure 100% accuracy.

## Formulas Used

### Simple Interest Formula
```
I = P × r × t

Where:
- I = Interest earned
- P = Principal amount
- r = Annual interest rate (as decimal, e.g., 0.05 for 5%)
- t = Time in years
```

### End Balance Formula
```
End Balance = P + I
```

### Time Conversion
```
Total Time (years) = Years + (Months / 12)
```

### Percentage Calculation
```
Interest Percentage = (Total Interest / End Balance) × 100
Principal Percentage = (Principal / End Balance) × 100
```

## File Structure

```
simple-interest/
├── page.tsx                          # Main calculator component
├── layout.tsx                        # SEO metadata and layout
├── simpleInterestCalculations.ts     # Calculation logic
├── __tests__/
│   └── simpleInterestCalculations.test.ts  # Comprehensive test suite
└── README.md                         # This file
```

## Implementation Details

### Technology Stack
- **React**: Component-based UI
- **TypeScript**: Full type safety
- **Framer Motion**: Smooth animations
- **Tailwind CSS**: Responsive styling
- **Vitest**: Testing framework

### Key Components
1. **Input Form**: Left column with principal, rate, and time inputs
2. **Results Display**: Right column with prominent results
3. **Breakdown Chart**: Visual representation of principal vs interest
4. **Formula Explanation**: Interactive formula with actual values
5. **Yearly Schedule**: Detailed year-by-year breakdown
6. **Educational Section**: Comprehensive explanations and examples

### Design Principles
- **40/60 Layout**: 40% inputs, 60% results (standard template)
- **No CalculatorLayout Component**: Uses Navigation and standard structure
- **No Sticky Positioning**: Clean, scrollable layout
- **Accessibility**: Proper labels, semantic HTML
- **Performance**: Optimized calculations with useCallback

## SEO Optimization

### Keywords Targeted
- Simple interest calculator
- Interest calculator
- Simple interest formula
- Calculate simple interest
- Investment interest
- Loan interest calculator
- Auto loan interest
- Simple vs compound interest

### Metadata
- Comprehensive title and description
- Open Graph tags for social sharing
- Twitter card support
- Canonical URL
- Keyword-rich content

## Usage Example

```typescript
import { calculateSimpleInterest } from './simpleInterestCalculations';

const inputs = {
  principal: 10000,
  interestRate: 5,
  years: 5,
  months: 0,
};

const results = calculateSimpleInterest(inputs);
// results.totalInterest: 2500
// results.endBalance: 12500
// results.schedule: Array of yearly breakdown
```

## Testing

Run tests with:
```bash
npm test -- simple-interest
```

All 17 tests should pass, validating:
- Basic interest calculations
- Time period handling (years + months)
- Edge cases (zero values, large amounts)
- Schedule generation
- Percentage calculations

## Comparison to Reference Calculator

This implementation matches the reference calculator (calculator.net) in:
- ✅ Formula accuracy (I = P × r × t)
- ✅ Time period handling (years and months)
- ✅ Yearly schedule generation
- ✅ Result precision
- ✅ Visual breakdown presentation

Additional features:
- ✅ Modern, responsive design
- ✅ Smooth animations
- ✅ Interactive formula display
- ✅ Comprehensive educational content
- ✅ Mobile-optimized interface

## Browser Compatibility

Tested and working on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential additions:
- [ ] Graph visualization of interest growth
- [ ] Comparison with compound interest
- [ ] Export schedule to CSV/PDF
- [ ] Save/share calculations
- [ ] Multiple currency support
- [ ] Print-friendly view

## License

Part of the Finappo financial calculators suite.
