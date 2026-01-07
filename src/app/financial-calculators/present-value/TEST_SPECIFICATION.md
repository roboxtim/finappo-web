# Present Value Calculator - Test Specification

## Test Cases for Present Value Calculations

### Test Group 1: PV of Lump Sum

#### Test 1.1: Basic Lump Sum PV
**Inputs:**
- Future Value: $10,000
- Periods: 5
- Interest Rate: 6% per period

**Formula:** PV = FV / (1 + r)^n = 10000 / (1.06)^5

**Expected Outputs:**
- Present Value: $7,472.58
- Discount Factor: 0.747258
- Total Discounted: 25.27%

#### Test 1.2: High Interest Rate Lump Sum
**Inputs:**
- Future Value: $50,000
- Periods: 10
- Interest Rate: 12% per period

**Formula:** PV = 50000 / (1.12)^10

**Expected Outputs:**
- Present Value: $16,105.95
- Discount Factor: 0.322119
- Total Discounted: 67.79%

#### Test 1.3: Zero Interest Rate
**Inputs:**
- Future Value: $10,000
- Periods: 5
- Interest Rate: 0%

**Expected Outputs:**
- Present Value: $10,000.00
- Discount Factor: 1.0
- No discounting applied

---

### Test Group 2: PV of Ordinary Annuity (End of Period)

#### Test 2.1: Basic Ordinary Annuity
**Inputs:**
- Periodic Payment: $1,000
- Periods: 10
- Interest Rate: 5% per period
- Payment Timing: End of Period

**Formula:** PV = PMT × [(1 - (1 + r)^-n) / r]
PV = 1000 × [(1 - (1.05)^-10) / 0.05]

**Expected Outputs:**
- Present Value of Annuity: $7,721.73
- Total Payments: $10,000
- Discount Amount: $2,278.27

#### Test 2.2: High Rate Ordinary Annuity
**Inputs:**
- Periodic Payment: $500
- Periods: 20
- Interest Rate: 8% per period
- Payment Timing: End

**Formula:** PV = 500 × [(1 - (1.08)^-20) / 0.08]

**Expected Outputs:**
- Present Value: $4,909.14
- Total Payments: $10,000
- Discount: $5,090.86

---

### Test Group 3: PV of Annuity Due (Beginning of Period)

#### Test 3.1: Basic Annuity Due
**Inputs:**
- Periodic Payment: $1,000
- Periods: 10
- Interest Rate: 5% per period
- Payment Timing: Beginning of Period

**Formula:**
- PV_ordinary = 1000 × [(1 - (1.05)^-10) / 0.05] = 7,721.73
- PV_due = PV_ordinary × (1 + r) = 7,721.73 × 1.05

**Expected Outputs:**
- Present Value: $8,107.82
- Difference from Ordinary: $386.09
- Premium from early payment: 5%

#### Test 3.2: Annuity Due with Higher Rate
**Inputs:**
- Periodic Payment: $2,000
- Periods: 5
- Interest Rate: 10% per period
- Payment Timing: Beginning

**Formula:**
- PV_ordinary = 2000 × [(1 - (1.10)^-5) / 0.10] = 7,581.57
- PV_due = 7,581.57 × 1.10

**Expected Outputs:**
- Present Value: $8,339.73
- Ordinary Annuity PV: $7,581.57
- Additional value from early payment: $758.16

---

### Test Group 4: PV of Growing Annuity

#### Test 4.1: Basic Growing Annuity
**Inputs:**
- Initial Payment: $1,000
- Periods: 10
- Interest Rate: 8% per period
- Growth Rate: 3% per period

**Formula:** PV = PMT × [(1 - ((1 + g) / (1 + r))^n) / (r - g)]
PV = 1000 × [(1 - (1.03/1.08)^10) / (0.08 - 0.03)]

**Expected Outputs:**
- Present Value: $8,110.90
- Compared to flat annuity at 8%: $6,710.08
- Growth premium: $1,400.82

#### Test 4.2: High Growth Rate
**Inputs:**
- Initial Payment: $500
- Periods: 15
- Interest Rate: 10%
- Growth Rate: 5%

**Formula:** PV = 500 × [(1 - (1.05/1.10)^15) / (0.10 - 0.05)]

**Expected Outputs:**
- Present Value: $5,454.68
- Total payments (growing): $11,447.88
- Discount: $5,993.20

#### Test 4.3: Growth Rate Equals Interest Rate (Edge Case)
**Inputs:**
- Initial Payment: $1,000
- Periods: 10
- Interest Rate: 6%
- Growth Rate: 6%

**Special Case:** When r = g, use simplified formula:
PV = PMT × n / (1 + r) = 1000 × 10 / 1.06

**Expected Outputs:**
- Present Value: $9,433.96
- Special formula applied
- Linear growth scenario

---

### Test Group 5: Combined Calculations (Lump Sum + Annuity)

#### Test 5.1: Lump Sum + Ordinary Annuity
**Inputs:**
- Future Value: $5,000
- Periodic Payment: $500
- Periods: 8
- Interest Rate: 4% per period
- Payment Timing: End

**Calculations:**
- PV of Lump Sum: 5000 / (1.04)^8 = $3,653.83
- PV of Annuity: 500 × [(1 - (1.04)^-8) / 0.04] = $3,368.98
- Total PV: $7,022.81

**Expected Outputs:**
- Total Present Value: $7,022.81
- Lump Sum Component: $3,653.83
- Annuity Component: $3,368.98

#### Test 5.2: Lump Sum + Annuity Due
**Inputs:**
- Future Value: $10,000
- Periodic Payment: $1,000
- Periods: 5
- Interest Rate: 6%
- Payment Timing: Beginning

**Calculations:**
- PV of Lump Sum: 10000 / (1.06)^5 = $7,472.58
- PV of Ordinary: 1000 × [(1 - (1.06)^-5) / 0.06] = $4,212.36
- PV of Due: 4,212.36 × 1.06 = $4,465.11
- Total: $11,937.69

**Expected Outputs:**
- Total Present Value: $11,937.69
- Lump Sum PV: $7,472.58
- Annuity Due PV: $4,465.11

---

### Test Group 6: Different Payment Frequencies

#### Test 6.1: Monthly Payments (Annual to Monthly Conversion)
**Inputs:**
- Payment: $100 per month
- Time: 2 years (24 months)
- Annual Interest: 12%
- Payment Timing: End

**Conversion:**
- Monthly Rate: 12% / 12 = 1% = 0.01
- Total Periods: 2 × 12 = 24

**Formula:** PV = 100 × [(1 - (1.01)^-24) / 0.01]

**Expected Outputs:**
- Present Value: $2,127.54
- Total Payments: $2,400
- Discount: $272.46

#### Test 6.2: Quarterly Payments
**Inputs:**
- Payment: $1,000 per quarter
- Time: 5 years (20 quarters)
- Annual Interest: 8%
- Payment Timing: End

**Conversion:**
- Quarterly Rate: 8% / 4 = 2% = 0.02
- Total Periods: 5 × 4 = 20

**Formula:** PV = 1000 × [(1 - (1.02)^-20) / 0.02]

**Expected Outputs:**
- Present Value: $16,351.43
- Total Payments: $20,000
- Discount: $3,648.57

#### Test 6.3: Semi-Annual Payments
**Inputs:**
- Payment: $2,500 semi-annually
- Time: 10 years (20 periods)
- Annual Interest: 6%
- Payment Timing: Beginning

**Conversion:**
- Semi-annual Rate: 6% / 2 = 3% = 0.03
- Total Periods: 10 × 2 = 20

**Calculations:**
- PV_ordinary = 2500 × [(1 - (1.03)^-20) / 0.03] = $37,232.41
- PV_due = 37,232.41 × 1.03 = $38,349.38

**Expected Outputs:**
- Present Value: $38,349.38
- Payment frequency: Semi-annual
- Annuity Due adjustment applied

---

### Test Group 7: Edge Cases

#### Test 7.1: Zero Payment Amount
**Inputs:**
- Payment: $0
- Periods: 10
- Interest Rate: 5%

**Expected Outputs:**
- Present Value: $0.00
- No annuity component

#### Test 7.2: Single Period
**Inputs:**
- Payment: $1,000
- Periods: 1
- Interest Rate: 10%
- Timing: End

**Formula:** PV = 1000 / (1.10)^1

**Expected Outputs:**
- Present Value: $909.09
- Single period calculation

#### Test 7.3: Very High Interest Rate (100%)
**Inputs:**
- Future Value: $10,000
- Periods: 5
- Interest Rate: 100%

**Formula:** PV = 10000 / (2)^5

**Expected Outputs:**
- Present Value: $312.50
- Extreme discounting scenario

#### Test 7.4: Very Long Time Period
**Inputs:**
- Payment: $1,000
- Periods: 100
- Interest Rate: 5%

**Formula:** PV = 1000 × [(1 - (1.05)^-100) / 0.05]

**Expected Outputs:**
- Present Value: $19,847.85
- Long-term annuity
- Convergence to 1/r limit

---

### Test Group 8: Validation Tests

#### Test 8.1: Negative Values Validation
**Inputs:**
- Future Value: -$5,000
- Payment: $1,000
- Periods: 5
- Interest Rate: 5%

**Expected:**
- Error: "Future value must be non-negative"

#### Test 8.2: Negative Interest Rate
**Inputs:**
- Payment: $1,000
- Periods: 10
- Interest Rate: -5%

**Expected:**
- Error: "Interest rate must be non-negative"

#### Test 8.3: Zero or Negative Periods
**Inputs:**
- Payment: $1,000
- Periods: 0
- Interest Rate: 5%

**Expected:**
- Error: "Number of periods must be positive"

#### Test 8.4: Growth Rate Exceeds Interest Rate
**Inputs:**
- Payment: $1,000
- Periods: 10
- Interest Rate: 5%
- Growth Rate: 8%

**Expected:**
- Error or Warning: "Growth rate exceeds discount rate - infinite PV scenario"

---

## Calculation Formulas Reference

### 1. Present Value of Lump Sum
```
PV = FV / (1 + r)^n

Where:
- FV = Future Value
- r = Interest rate per period (as decimal)
- n = Number of periods
```

### 2. Present Value of Ordinary Annuity
```
PV = PMT × [(1 - (1 + r)^-n) / r]

Where:
- PMT = Periodic payment
- r = Interest rate per period
- n = Number of periods
```

### 3. Present Value of Annuity Due
```
PV_due = PV_ordinary × (1 + r)

Or directly:
PV_due = PMT × [(1 - (1 + r)^-n) / r] × (1 + r)
```

### 4. Present Value of Growing Annuity
```
PV = PMT × [(1 - ((1 + g) / (1 + r))^n) / (r - g)]

Special case when r = g:
PV = PMT × n / (1 + r)

Where:
- PMT = Initial payment
- g = Growth rate per period
- r = Interest rate per period
- n = Number of periods
```

### 5. Discount Factor
```
DF = 1 / (1 + r)^n
```

### 6. Total Present Value (Combined)
```
Total PV = PV_lump_sum + PV_annuity
```

---

## Implementation Notes

1. **Precision:** All currency values should be rounded to 2 decimal places
2. **Percentages:** Input as whole numbers (5 = 5%), convert to decimal for calculations
3. **Payment Timing:**
   - Ordinary Annuity: Payments at END of period
   - Annuity Due: Payments at BEGINNING of period
4. **Frequency Conversion:**
   - Annual: Use rate as-is
   - Semi-annual: Annual rate / 2, periods × 2
   - Quarterly: Annual rate / 4, periods × 4
   - Monthly: Annual rate / 12, periods × 12
   - Weekly: Annual rate / 52, periods × 52
   - Daily: Annual rate / 365, periods × 365

5. **Validation Rules:**
   - All monetary values ≥ 0
   - Interest rate ≥ 0
   - Number of periods > 0
   - Growth rate < Interest rate (for growing annuity)

---

## Test Coverage Goals

- ✓ Basic PV calculations for all types
- ✓ Edge cases (zero values, extreme values)
- ✓ Different payment frequencies
- ✓ Payment timing variations (beginning vs end)
- ✓ Combined calculations
- ✓ Input validation
- ✓ Precision and rounding
- ✓ Formula accuracy verification

Target: 100% test coverage of calculation logic
