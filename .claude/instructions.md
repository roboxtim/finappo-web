# Finappo Project Instructions

## Financial Calculators Standards

### Layout Requirements
ALL financial calculators MUST use the `CalculatorLayout` component for consistency:

```tsx
import { CalculatorLayout } from '@/components/CalculatorLayout';

export default function MyCalculator() {
  return (
    <CalculatorLayout
      title="Calculator Name"
      description="Clear description of what this calculator does"
      icon={<IconComponent className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-color-600 to-color-600"
    >
      {/* Calculator content here */}
    </CalculatorLayout>
  );
}
```

**DO NOT:**
- Create custom hero sections with `<Navigation />` directly
- Use centered layouts (`className="text-center"` in hero)
- Create custom footers (handled by CalculatorLayout)
- Use `min-h-screen` wrapper divs

### Metadata Requirements
EVERY calculator MUST have a `layout.tsx` file with proper SEO metadata:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Specific Calculator Name - Description | Finappo',
  description: 'Detailed description 100-160 characters explaining what the calculator does and its benefits',
  keywords: ['keyword1', 'keyword2', 'keyword3', 'keyword4', 'keyword5', 'keyword6'],
  openGraph: {
    title: 'Calculator Name | Finappo',
    description: 'Brief description for social sharing',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

**Requirements:**
- Title: Include calculator name + brief description + "| Finappo" branding
- Description: 100-160 characters, clear value proposition
- Keywords: 6+ relevant keywords array
- OpenGraph: Required for social media sharing

### Calculator Categories
When creating or modifying calculators, ensure they are properly categorized:

**Categories:**
1. **Loan & Debt Calculators**
   - Mortgage, Auto Loan, Personal Loan, Student Loan
   - Amortization, APR Calculator, Debt Payoff

2. **Investment Calculators**
   - Investment, ROI, IRR, Payback Period
   - Average Return, Future Value, Present Value
   - Compound Interest, Simple Interest

3. **Retirement Calculators**
   - 401(k), Retirement, Pension
   - Social Security (if added)

4. **Real Estate Calculators**
   - Mortgage, Rent vs Buy, Home Equity Loan, HELOC
   - Down Payment, FHA Loan, VA Loan
   - Real Estate Investment

5. **Savings Calculators**
   - Savings, CD Calculator, Interest Calculator
   - Emergency Fund (if added)

6. **Other Financial Tools**
   - Finance (TVM), Payment Calculator
   - Bond Calculator, Cash Back vs Low Interest

### Adding Calculator to Archive Page
When creating a new calculator, it MUST be added to the main calculators archive:

**File:** `src/app/financial-calculators/page.tsx`

1. Add to appropriate category array:
```tsx
const loanCalculators = [
  // ... existing
  {
    title: 'New Calculator',
    description: 'Brief description',
    href: '/financial-calculators/new-calculator',
    icon: IconComponent,
    gradient: 'from-color-500 to-color-600',
    comingSoon: false,
  },
];
```

2. Ensure proper icon and gradient colors
3. Set `comingSoon: false` when calculator is ready
4. Keep alphabetical order within category

### File Structure
```
src/app/financial-calculators/
├── calculator-name/
│   ├── page.tsx          # Main calculator component (use CalculatorLayout!)
│   ├── layout.tsx        # Metadata (REQUIRED!)
│   └── utils/
│       └── calculations.ts # Calculation logic
```

### Scroll Behavior
- Avoid `max-h-[600px] overflow-y-auto` on content containers
- Let content expand naturally
- Use available vertical space efficiently

### Common Mistakes to Avoid
1. ❌ Forgetting to add calculator to archive page
2. ❌ Missing metadata in layout.tsx
3. ❌ Using custom hero instead of CalculatorLayout
4. ❌ Incorrect category placement
5. ❌ Missing or generic keywords
6. ❌ Description too short (<100 chars) or too long (>170 chars)
7. ❌ Adding unnecessary scroll containers

## General Code Standards
- Use TypeScript strictly
- Follow existing code patterns
- Run `npm run lint` before committing
- Ensure all calculators pass build process
- Test responsiveness on mobile/tablet/desktop
