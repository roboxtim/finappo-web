import { calculateAutoLease, AutoLeaseInputs } from '../utils/calculations';

describe('Auto Lease Calculator', () => {
  describe('Basic Lease Calculations', () => {
    it('should calculate lease payment for standard 36-month lease', () => {
      // Reference: calculator.net example
      // MSRP: $50,000, Down: $8,000, Trade-in: $5,000, Residual: $25,000
      // Term: 36 months, APR: 6%, Sales Tax: 6%
      const inputs: AutoLeaseInputs = {
        msrp: 50000,
        negotiatedPrice: 50000,
        downPayment: 8000,
        tradeInValue: 5000,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 6.0,
        residualPercent: 50, // $25,000 residual on $50,000 MSRP
        salesTaxRate: 6.0,
        fees: 0,
      };

      const results = calculateAutoLease(inputs);

      // Expected: $517.63 monthly payment (from reference calculator)
      expect(results.monthlyPayment).toBeCloseTo(517.63, 1);
      // Total Lease Cost = (517.63 * 36) + (8000 + 0 - 5000) = 18634.68 + 3000 = 21634.68
      expect(results.totalLeaseCost).toBeCloseTo(21634.68, 0);
    });

    it('should calculate lease payment for 24-month term', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 40000,
        negotiatedPrice: 38000,
        downPayment: 3000,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 24,
        interestRate: 5.0,
        residualPercent: 55, // $22,000 residual
        salesTaxRate: 7.0,
        fees: 595,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $38,000 - $3,000 + $595 = $35,595
      // Residual Value = $40,000 * 0.55 = $22,000
      // Depreciation = ($35,595 - $22,000) / 24 = $566.46
      // Money Factor = 5.0 / 2400 = 0.00208333
      // Finance Fee = ($35,595 + $22,000) * 0.00208333 = $120.03
      // Subtotal = $566.46 + $120.03 = $686.49
      // Tax = $686.49 * 0.07 = $48.05
      // Total Monthly = $686.49 + $48.05 = $734.54
      expect(results.monthlyPayment).toBeCloseTo(734.54, 1);
      expect(results.monthlyDepreciationFee).toBeCloseTo(566.46, 1);
      expect(results.monthlyFinanceFee).toBeCloseTo(120.03, 1);
      expect(results.monthlySalesTax).toBeCloseTo(48.05, 1);
    });

    it('should calculate lease payment for 48-month term', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 60000,
        negotiatedPrice: 57000,
        downPayment: 5000,
        tradeInValue: 10000,
        amountOwedOnTradeIn: 0,
        leaseTerm: 48,
        interestRate: 4.5,
        residualPercent: 45, // $27,000 residual
        salesTaxRate: 8.0,
        fees: 1000,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $57,000 - $5,000 - $10,000 + $1,000 = $43,000
      // Residual Value = $60,000 * 0.45 = $27,000
      // Depreciation = ($43,000 - $27,000) / 48 = $333.33
      // Money Factor = 4.5 / 2400 = 0.001875
      // Finance Fee = ($43,000 + $27,000) * 0.001875 = $131.25
      // Subtotal = $333.33 + $131.25 = $464.58
      // Tax = $464.58 * 0.08 = $37.17
      // Total Monthly = $464.58 + $37.17 = $501.75
      expect(results.monthlyPayment).toBeCloseTo(501.75, 1);
      expect(results.monthlyDepreciationFee).toBeCloseTo(333.33, 1);
      expect(results.monthlyFinanceFee).toBeCloseTo(131.25, 1);
    });
  });

  describe('Trade-In Scenarios', () => {
    it('should handle positive trade-in equity', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 45000,
        negotiatedPrice: 43000,
        downPayment: 2000,
        tradeInValue: 8000,
        amountOwedOnTradeIn: 5000, // $3,000 positive equity
        leaseTerm: 36,
        interestRate: 5.5,
        residualPercent: 52,
        salesTaxRate: 6.5,
        fees: 500,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $43,000 - $2,000 - ($8,000 - $5,000) + $500 = $38,500
      // Residual Value = $45,000 * 0.52 = $23,400
      // Depreciation = ($38,500 - $23,400) / 36 = $419.44
      // Money Factor = 5.5 / 2400 = 0.00229167
      // Finance Fee = ($38,500 + $23,400) * 0.00229167 = $141.81
      // Subtotal = $419.44 + $141.81 = $561.25
      // Tax = $561.25 * 0.065 = $36.48
      // Total Monthly = $561.25 + $36.48 = $597.73
      expect(results.monthlyPayment).toBeCloseTo(597.73, 1);
      expect(results.adjustedCapCost).toBeCloseTo(38500, 1);
    });

    it('should handle negative trade-in equity (underwater)', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 35000,
        negotiatedPrice: 33000,
        downPayment: 1000,
        tradeInValue: 6000,
        amountOwedOnTradeIn: 8000, // $2,000 negative equity
        leaseTerm: 36,
        interestRate: 6.5,
        residualPercent: 50,
        salesTaxRate: 7.0,
        fees: 750,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $33,000 - $1,000 - ($6,000 - $8,000) + $750 = $34,750
      // Residual Value = $35,000 * 0.50 = $17,500
      // Depreciation = ($34,750 - $17,500) / 36 = $479.17
      // Money Factor = 6.5 / 2400 = 0.00270833
      // Finance Fee = ($34,750 + $17,500) * 0.00270833 = $141.56
      // Subtotal = $479.17 + $141.56 = $620.73
      // Tax = $620.73 * 0.07 = $43.45
      // Total Monthly = $620.73 + $43.45 = $664.18 (may be $664.12 due to rounding)
      expect(results.monthlyPayment).toBeCloseTo(664.12, 1);
    });

    it('should handle no trade-in scenario', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 30000,
        negotiatedPrice: 28500,
        downPayment: 4000,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 5.0,
        residualPercent: 55,
        salesTaxRate: 6.0,
        fees: 595,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $28,500 - $4,000 + $595 = $25,095
      // Residual Value = $30,000 * 0.55 = $16,500
      // Depreciation = ($25,095 - $16,500) / 36 = $238.75
      // Money Factor = 5.0 / 2400 = 0.00208333
      // Finance Fee = ($25,095 + $16,500) * 0.00208333 = $86.65
      // Subtotal = $238.75 + $86.65 = $325.40
      // Tax = $325.40 * 0.06 = $19.52
      // Total Monthly = $325.40 + $19.52 = $344.92
      expect(results.monthlyPayment).toBeCloseTo(344.92, 1);
    });
  });

  describe('Residual Value Variations', () => {
    it('should calculate with high residual value (60%)', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 55000,
        negotiatedPrice: 52000,
        downPayment: 5000,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 5.5,
        residualPercent: 60, // High residual
        salesTaxRate: 7.5,
        fees: 795,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $52,000 - $5,000 + $795 = $47,795
      // Residual Value = $55,000 * 0.60 = $33,000
      // Lower depreciation due to high residual
      expect(results.residualValue).toBeCloseTo(33000, 1);
      expect(results.monthlyDepreciationFee).toBeLessThan(500);
    });

    it('should calculate with low residual value (35%)', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 50000,
        negotiatedPrice: 48000,
        downPayment: 3000,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 6.0,
        residualPercent: 35, // Low residual
        salesTaxRate: 7.0,
        fees: 695,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $48,000 - $3,000 + $695 = $45,695
      // Residual Value = $50,000 * 0.35 = $17,500
      // Higher depreciation due to low residual
      expect(results.residualValue).toBeCloseTo(17500, 1);
      expect(results.monthlyDepreciationFee).toBeGreaterThan(700);
    });
  });

  describe('Interest Rate Variations', () => {
    it('should calculate with zero interest rate', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 40000,
        negotiatedPrice: 38000,
        downPayment: 5000,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 0,
        residualPercent: 50,
        salesTaxRate: 6.0,
        fees: 500,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $38,000 - $5,000 + $500 = $33,500
      // Residual Value = $40,000 * 0.50 = $20,000
      // Depreciation = ($33,500 - $20,000) / 36 = $375.00
      // Finance Fee = 0 (no interest)
      // Subtotal = $375.00
      // Tax = $375.00 * 0.06 = $22.50
      // Total Monthly = $375.00 + $22.50 = $397.50
      expect(results.monthlyFinanceFee).toBe(0);
      expect(results.monthlyPayment).toBeCloseTo(397.5, 1);
    });

    it('should calculate with high interest rate (9%)', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 45000,
        negotiatedPrice: 43000,
        downPayment: 4000,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 9.0,
        residualPercent: 48,
        salesTaxRate: 6.5,
        fees: 695,
      };

      const results = calculateAutoLease(inputs);

      // Money Factor = 9.0 / 2400 = 0.00375 (higher finance fee)
      expect(results.monthlyFinanceFee).toBeGreaterThan(200);
    });
  });

  describe('Down Payment Scenarios', () => {
    it('should calculate with zero down payment', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 35000,
        negotiatedPrice: 34000,
        downPayment: 0,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 5.5,
        residualPercent: 52,
        salesTaxRate: 7.0,
        fees: 595,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $34,000 + $595 = $34,595 (higher monthly payment)
      expect(results.adjustedCapCost).toBeCloseTo(34595, 1);
    });

    it('should calculate with large down payment', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 50000,
        negotiatedPrice: 48000,
        downPayment: 15000, // Large down payment
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 5.0,
        residualPercent: 50,
        salesTaxRate: 6.0,
        fees: 795,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost = $48,000 - $15,000 + $795 = $33,795 (lower monthly payment)
      expect(results.adjustedCapCost).toBeCloseTo(33795, 1);
      expect(results.monthlyPayment).toBeLessThan(500);
    });
  });

  describe('Sales Tax Scenarios', () => {
    it('should calculate with zero sales tax', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 40000,
        negotiatedPrice: 38000,
        downPayment: 3000,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 5.5,
        residualPercent: 50,
        salesTaxRate: 0,
        fees: 500,
      };

      const results = calculateAutoLease(inputs);

      expect(results.monthlySalesTax).toBe(0);
      // Monthly payment should equal depreciation + finance fee only
      expect(results.monthlyPayment).toBeCloseTo(
        results.monthlyDepreciationFee + results.monthlyFinanceFee,
        1
      );
    });

    it('should calculate with high sales tax (10%)', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 40000,
        negotiatedPrice: 38000,
        downPayment: 3000,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 5.5,
        residualPercent: 50,
        salesTaxRate: 10.0,
        fees: 500,
      };

      const results = calculateAutoLease(inputs);

      expect(results.monthlySalesTax).toBeGreaterThan(0);
      expect(results.salesTaxRate).toBe(10.0);
    });
  });

  describe('Negotiated Price vs MSRP', () => {
    it('should use negotiated price when lower than MSRP', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 50000,
        negotiatedPrice: 46000, // $4,000 below MSRP
        downPayment: 5000,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 36,
        interestRate: 5.5,
        residualPercent: 50, // Based on MSRP
        salesTaxRate: 6.5,
        fees: 795,
      };

      const results = calculateAutoLease(inputs);

      // Net Cap Cost based on negotiated price: $46,000 - $5,000 + $795 = $41,795
      // Residual based on MSRP: $50,000 * 0.50 = $25,000
      expect(results.adjustedCapCost).toBeCloseTo(41795, 1);
      expect(results.residualValue).toBeCloseTo(25000, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum values', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 15000,
        negotiatedPrice: 15000,
        downPayment: 0,
        tradeInValue: 0,
        amountOwedOnTradeIn: 0,
        leaseTerm: 24,
        interestRate: 3.0,
        residualPercent: 50,
        salesTaxRate: 5.0,
        fees: 0,
      };

      const results = calculateAutoLease(inputs);

      expect(results.monthlyPayment).toBeGreaterThan(0);
      expect(results.totalLeaseCost).toBeGreaterThan(0);
    });

    it('should handle luxury vehicle with high values', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 120000,
        negotiatedPrice: 115000,
        downPayment: 10000,
        tradeInValue: 15000,
        amountOwedOnTradeIn: 8000,
        leaseTerm: 36,
        interestRate: 7.5,
        residualPercent: 58,
        salesTaxRate: 9.0,
        fees: 1500,
      };

      const results = calculateAutoLease(inputs);

      expect(results.monthlyPayment).toBeGreaterThan(1000);
      expect(results.residualValue).toBeCloseTo(69600, 1); // 120000 * 0.58
    });

    it('should calculate amount at signing correctly', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 40000,
        negotiatedPrice: 38000,
        downPayment: 3000,
        tradeInValue: 2000,
        amountOwedOnTradeIn: 1000,
        leaseTerm: 36,
        interestRate: 5.5,
        residualPercent: 50,
        salesTaxRate: 6.5,
        fees: 895,
      };

      const results = calculateAutoLease(inputs);

      // Amount at signing = Down Payment + Fees - Trade-in equity
      // = $3,000 + $895 - ($2,000 - $1,000) = $2,895
      expect(results.amountAtSigning).toBeCloseTo(2895, 1);
    });
  });

  describe('Total Lease Cost', () => {
    it('should calculate total lease cost correctly', () => {
      const inputs: AutoLeaseInputs = {
        msrp: 45000,
        negotiatedPrice: 43000,
        downPayment: 4000,
        tradeInValue: 3000,
        amountOwedOnTradeIn: 2000,
        leaseTerm: 36,
        interestRate: 6.0,
        residualPercent: 52,
        salesTaxRate: 7.0,
        fees: 795,
      };

      const results = calculateAutoLease(inputs);

      // Total Lease Cost = (Monthly Payment × Term) + Amount at Signing
      const expectedTotal =
        results.monthlyPayment * inputs.leaseTerm + results.amountAtSigning;
      expect(results.totalLeaseCost).toBeCloseTo(expectedTotal, 0);
    });
  });
});
