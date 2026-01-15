/**
 * Estate Tax Calculator - Tests
 *
 * Comprehensive test suite validating estate tax calculations
 * against reference calculator and IRS tax law
 */

import {
  calculateEstateTax,
  validateEstateTaxInputs,
  ESTATE_TAX_2025,
  type EstateTaxInputs,
} from '../calculations';

describe('Estate Tax Calculator', () => {
  describe('validateEstateTaxInputs', () => {
    it('should accept valid inputs', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 20000000,
        totalDebts: 1000000,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const errors = validateEstateTaxInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should reject negative assets', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: -1000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const errors = validateEstateTaxInputs(inputs);
      expect(errors).toContain('Total assets cannot be negative');
    });

    it('should reject debts exceeding assets', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 1000000,
        totalDebts: 2000000,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const errors = validateEstateTaxInputs(inputs);
      expect(errors).toContain('Total debts cannot exceed total assets');
    });
  });

  describe('Estate Below Federal Exemption', () => {
    it('should have no federal tax for estate under exemption (single)', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 10000000, // $10M
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.grossEstate).toBe(10000000);
      expect(results.adjustedGrossEstate).toBe(10000000);
      expect(results.taxableEstate).toBe(10000000);
      expect(results.federalExemption).toBe(
        ESTATE_TAX_2025.FEDERAL_EXEMPTION_SINGLE
      );
      expect(results.federalTaxableAmount).toBe(0);
      expect(results.federalEstateTax).toBe(0);
      expect(results.totalEstateTax).toBe(0);
      expect(results.netToHeirs).toBe(10000000);
    });

    it('should have no federal tax for estate under exemption (married)', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 25000000, // $25M
        totalDebts: 0,
        maritalStatus: 'married',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.grossEstate).toBe(25000000);
      expect(results.federalExemption).toBe(
        ESTATE_TAX_2025.FEDERAL_EXEMPTION_MARRIED
      );
      expect(results.federalTaxableAmount).toBe(0);
      expect(results.federalEstateTax).toBe(0);
      expect(results.netToHeirs).toBe(25000000);
    });
  });

  describe('Estate Above Federal Exemption', () => {
    it('should calculate federal tax for $20M estate (single)', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 20000000, // $20M
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.grossEstate).toBe(20000000);
      expect(results.adjustedGrossEstate).toBe(20000000);
      expect(results.taxableEstate).toBe(20000000);
      expect(results.federalExemption).toBe(13990000);
      expect(results.federalTaxableAmount).toBe(6010000); // $20M - $13.99M

      // Federal tax on $6.01M should be significant (40% rate applies)
      expect(results.federalEstateTax).toBeGreaterThan(2000000);
      expect(results.marginalTaxRate).toBe(40); // Top bracket
      expect(results.netToHeirs).toBeLessThan(20000000);
    });

    it('should calculate federal tax for $30M estate (married)', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 30000000, // $30M
        totalDebts: 0,
        maritalStatus: 'married',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.grossEstate).toBe(30000000);
      expect(results.federalExemption).toBe(27980000); // Married exemption
      expect(results.federalTaxableAmount).toBe(2020000); // $30M - $27.98M

      // Federal tax on $2.02M (40% marginal rate)
      expect(results.federalEstateTax).toBeGreaterThan(700000);
      expect(results.marginalTaxRate).toBe(40);
    });

    it('should calculate tax for $50M estate (single)', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 50000000, // $50M
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      const taxableAmount = 50000000 - 13990000; // $36.01M
      expect(results.federalTaxableAmount).toBe(taxableAmount);

      // Substantial tax owed on $36M+ taxable amount
      expect(results.federalEstateTax).toBeGreaterThan(14000000);
      expect(results.marginalTaxRate).toBe(40);
      expect(results.effectiveTaxRate).toBeGreaterThan(28); // >28% effective
    });
  });

  describe('Deductions and Debts', () => {
    it('should deduct debts from gross estate', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 20000000,
        totalDebts: 2000000, // $2M debt
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.grossEstate).toBe(20000000);
      expect(results.totalDeductions).toBe(2000000);
      expect(results.adjustedGrossEstate).toBe(18000000);
      expect(results.taxableEstate).toBe(18000000);
    });

    it('should deduct charitable contributions', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 20000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 3000000, // $3M charity
      };

      const results = calculateEstateTax(inputs);

      expect(results.grossEstate).toBe(20000000);
      expect(results.totalDeductions).toBe(3000000);
      expect(results.adjustedGrossEstate).toBe(17000000);
      expect(results.taxableEstate).toBe(17000000);
    });

    it('should handle both debts and charitable deductions', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 25000000,
        totalDebts: 1500000,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 2500000,
      };

      const results = calculateEstateTax(inputs);

      expect(results.grossEstate).toBe(25000000);
      expect(results.totalDeductions).toBe(4000000); // $1.5M + $2.5M
      expect(results.adjustedGrossEstate).toBe(21000000);
    });
  });

  describe('Lifetime Gifts', () => {
    it('should add lifetime gifts to taxable estate', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 15000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 3000000, // $3M gifted
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.adjustedGrossEstate).toBe(15000000);
      expect(results.taxableEstate).toBe(18000000); // $15M + $3M gifts
      expect(results.federalTaxableAmount).toBe(4010000); // $18M - $13.99M
      expect(results.federalEstateTax).toBeGreaterThan(0);
    });

    it('should push estate over exemption with lifetime gifts', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 12000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 5000000, // $5M gifted
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.taxableEstate).toBe(17000000); // $12M + $5M
      expect(results.federalTaxableAmount).toBe(3010000); // Over exemption
      expect(results.federalEstateTax).toBeGreaterThan(1000000);
    });
  });

  describe('State Estate Tax', () => {
    it('should calculate Oregon state tax (low exemption)', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 5000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'OR',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.stateName).toBe('Oregon');
      expect(results.stateExemption).toBe(1000000);
      expect(results.stateEstateTax).toBeGreaterThan(0);
      expect(results.federalEstateTax).toBe(0); // Below federal exemption
      expect(results.totalEstateTax).toBe(results.stateEstateTax);
    });

    it('should calculate Massachusetts state tax', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 10000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'MA',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.stateName).toBe('Massachusetts');
      expect(results.stateExemption).toBe(2000000);
      expect(results.stateEstateTax).toBeGreaterThan(0);
    });

    it('should combine federal and state taxes (NY)', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 20000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'NY',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.stateName).toBe('New York');
      expect(results.federalEstateTax).toBeGreaterThan(0);
      expect(results.stateEstateTax).toBeGreaterThan(0);
      expect(results.totalEstateTax).toBe(
        results.federalEstateTax + results.stateEstateTax
      );
    });

    it('should have no state tax for states without estate tax', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 20000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.stateEstateTax).toBe(0);
      expect(results.stateName).toBe('No State Estate Tax');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle large estate with all factors', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 100000000, // $100M
        totalDebts: 5000000, // $5M debts
        maritalStatus: 'married',
        state: 'CT',
        giftsGivenLifetime: 10000000, // $10M gifted
        charitableDeductions: 15000000, // $15M charity
      };

      const results = calculateEstateTax(inputs);

      expect(results.grossEstate).toBe(100000000);
      expect(results.totalDeductions).toBe(20000000); // $5M + $15M
      expect(results.adjustedGrossEstate).toBe(80000000);
      expect(results.taxableEstate).toBe(90000000); // $80M + $10M gifts
      expect(results.federalExemption).toBe(27980000);
      expect(results.federalTaxableAmount).toBe(62020000);
      expect(results.federalEstateTax).toBeGreaterThan(24000000);
      expect(results.totalEstateTax).toBeGreaterThan(24000000);
    });

    it('should handle edge case at exact exemption amount', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 13990000, // Exactly at exemption
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.federalTaxableAmount).toBe(0);
      expect(results.federalEstateTax).toBe(0);
      expect(results.netToHeirs).toBe(13990000);
    });

    it('should handle $100 over exemption', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 13990100, // $100 over exemption
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.federalTaxableAmount).toBe(100);
      expect(results.federalEstateTax).toBeGreaterThan(0);
      expect(results.federalEstateTax).toBeLessThan(100); // Should be ~$18
    });
  });

  describe('Effective Tax Rate Calculations', () => {
    it('should calculate effective tax rate correctly', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 20000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      const expectedEffectiveRate =
        (results.totalEstateTax / results.adjustedGrossEstate) * 100;
      expect(results.effectiveTaxRate).toBeCloseTo(expectedEffectiveRate, 2);
      expect(results.effectiveTaxRate).toBeLessThan(results.marginalTaxRate);
    });

    it('should have 0% effective rate when no tax owed', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 10000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.effectiveTaxRate).toBe(0);
      expect(results.marginalTaxRate).toBe(0);
    });
  });

  describe('Net to Heirs Calculations', () => {
    it('should calculate net to heirs correctly', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 30000000,
        totalDebts: 2000000,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 1000000,
      };

      const results = calculateEstateTax(inputs);

      const expectedNet = results.adjustedGrossEstate - results.totalEstateTax;
      expect(results.netToHeirs).toBe(expectedNet);
      expect(results.netToHeirs).toBeGreaterThan(0);
      expect(results.netToHeirs).toBeLessThan(results.adjustedGrossEstate);
    });

    it('should handle case where entire estate goes to heirs', () => {
      const inputs: EstateTaxInputs = {
        totalAssets: 5000000,
        totalDebts: 0,
        maritalStatus: 'single',
        state: 'none',
        giftsGivenLifetime: 0,
        charitableDeductions: 0,
      };

      const results = calculateEstateTax(inputs);

      expect(results.netToHeirs).toBe(results.adjustedGrossEstate);
      expect(results.netToHeirs).toBe(5000000);
    });
  });
});
