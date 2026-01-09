import {
  calculateIdealClaimAge,
  compareTwoClaimAges,
  calculateMonthlyBenefit,
  calculateBreakEvenAge,
  calculateLifetimeValue,
  validateSocialSecurityInputs,
  type IdealAgeInputs,
  type CompareAgesInputs,
} from '../socialSecurityCalculations';

describe('Social Security Calculator', () => {
  describe('validateSocialSecurityInputs', () => {
    it('should validate ideal age inputs correctly', () => {
      const validInputs: IdealAgeInputs = {
        birthYear: 1960,
        lifeExpectancy: 85,
        investmentReturn: 5,
        cola: 2,
      };
      expect(validateSocialSecurityInputs(validInputs, 'ideal')).toEqual([]);
    });

    it('should return errors for invalid ideal age inputs', () => {
      const invalidInputs: IdealAgeInputs = {
        birthYear: 1900,
        lifeExpectancy: 120,
        investmentReturn: -5,
        cola: 15,
      };
      const errors = validateSocialSecurityInputs(invalidInputs, 'ideal');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Birth year must be between 1940 and 2010');
    });

    it('should validate compare ages inputs correctly', () => {
      const validInputs: CompareAgesInputs = {
        claimAge1: 62,
        monthlyPayment1: 2000,
        claimAge2: 67,
        monthlyPayment2: 3000,
        investmentReturn: 6,
        cola: 2.5,
      };
      expect(validateSocialSecurityInputs(validInputs, 'compare')).toEqual([]);
    });

    it('should return errors for invalid compare ages inputs', () => {
      const invalidInputs: CompareAgesInputs = {
        claimAge1: 60,
        monthlyPayment1: -100,
        claimAge2: 75,
        monthlyPayment2: 0,
        investmentReturn: 20,
        cola: -1,
      };
      const errors = validateSocialSecurityInputs(invalidInputs, 'compare');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Claim age must be between 62 and 70');
    });
  });

  describe('calculateMonthlyBenefit', () => {
    it('should calculate reduced benefit for early claiming at 62', () => {
      const fullRetirementAge = 67;
      const fullBenefit = 3000;
      const claimAge = 62;
      const benefit = calculateMonthlyBenefit(
        fullBenefit,
        claimAge,
        fullRetirementAge
      );
      // Early claiming at 62 when FRA is 67 reduces benefit by 30%
      expect(benefit).toBeCloseTo(2100, 0);
    });

    it('should calculate full benefit at full retirement age', () => {
      const fullRetirementAge = 67;
      const fullBenefit = 3000;
      const claimAge = 67;
      const benefit = calculateMonthlyBenefit(
        fullBenefit,
        claimAge,
        fullRetirementAge
      );
      expect(benefit).toBe(3000);
    });

    it('should calculate delayed retirement credits for claiming at 70', () => {
      const fullRetirementAge = 67;
      const fullBenefit = 3000;
      const claimAge = 70;
      const benefit = calculateMonthlyBenefit(
        fullBenefit,
        claimAge,
        fullRetirementAge
      );
      // Delayed retirement credits: 8% per year from FRA to 70 (3 years = 24%)
      expect(benefit).toBeCloseTo(3720, 0);
    });

    it('should handle FRA of 66', () => {
      const fullRetirementAge = 66;
      const fullBenefit = 2500;
      const claimAge = 62;
      const benefit = calculateMonthlyBenefit(
        fullBenefit,
        claimAge,
        fullRetirementAge
      );
      // Early claiming at 62 when FRA is 66 reduces benefit by 25%
      expect(benefit).toBeCloseTo(1875, 0);
    });
  });

  describe('calculateLifetimeValue', () => {
    it('should calculate lifetime value with COLA adjustments', () => {
      const monthlyBenefit = 2000;
      const claimAge = 62;
      const lifeExpectancy = 85;
      const cola = 2;
      const investmentReturn = 5;

      const lifetimeValue = calculateLifetimeValue(
        monthlyBenefit,
        claimAge,
        lifeExpectancy,
        cola,
        investmentReturn
      );

      // Should receive benefits for 23 years (85 - 62)
      // With COLA and investment return considerations
      // Present value discounting reduces the nominal total
      expect(lifetimeValue).toBeGreaterThan(400000);
      expect(lifetimeValue).toBeLessThan(600000);
    });

    it('should handle zero COLA', () => {
      const monthlyBenefit = 2000;
      const claimAge = 67;
      const lifeExpectancy = 85;
      const cola = 0;
      const investmentReturn = 5;

      const lifetimeValue = calculateLifetimeValue(
        monthlyBenefit,
        claimAge,
        lifeExpectancy,
        cola,
        investmentReturn
      );

      // 18 years of benefits at $2000/month = $432,000 nominal
      // Present value should be less due to discounting
      expect(lifetimeValue).toBeGreaterThan(290000);
      expect(lifetimeValue).toBeLessThan(432000);
    });

    it('should handle zero investment return', () => {
      const monthlyBenefit = 3000;
      const claimAge = 70;
      const lifeExpectancy = 85;
      const cola = 2;
      const investmentReturn = 0;

      const lifetimeValue = calculateLifetimeValue(
        monthlyBenefit,
        claimAge,
        lifeExpectancy,
        cola,
        investmentReturn
      );

      // 15 years of benefits with 2% COLA growth
      expect(lifetimeValue).toBeGreaterThan(540000);
      expect(lifetimeValue).toBeLessThan(700000);
    });
  });

  describe('calculateBreakEvenAge', () => {
    it('should calculate break-even age between early and delayed claiming', () => {
      const earlyAge = 62;
      const earlyBenefit = 2100;
      const laterAge = 67;
      const laterBenefit = 3000;
      const cola = 2;

      const breakEvenAge = calculateBreakEvenAge(
        earlyAge,
        earlyBenefit,
        laterAge,
        laterBenefit,
        cola
      );

      // Break-even should typically be in late 70s to early 80s
      expect(breakEvenAge).toBeGreaterThan(75);
      expect(breakEvenAge).toBeLessThan(85);
    });

    it('should handle same benefit amounts', () => {
      const earlyAge = 62;
      const earlyBenefit = 2500;
      const laterAge = 67;
      const laterBenefit = 2500;
      const cola = 2;

      const breakEvenAge = calculateBreakEvenAge(
        earlyAge,
        earlyBenefit,
        laterAge,
        laterBenefit,
        cola
      );

      // If benefits are the same, early claiming always wins
      expect(breakEvenAge).toBe(Infinity);
    });
  });

  describe('calculateIdealClaimAge', () => {
    it('should calculate ideal claim age for person born in 1960', () => {
      const inputs: IdealAgeInputs = {
        birthYear: 1960,
        lifeExpectancy: 85,
        investmentReturn: 5,
        cola: 2,
      };

      const results = calculateIdealClaimAge(inputs);

      expect(results.fullRetirementAge).toBe(67);
      expect(results.idealClaimAge).toBeGreaterThanOrEqual(62);
      expect(results.idealClaimAge).toBeLessThanOrEqual(70);
      expect(results.monthlyBenefitAtIdealAge).toBeGreaterThan(0);
      expect(results.lifetimeValueAtIdealAge).toBeGreaterThan(0);
      expect(results.ageAnalysis).toHaveLength(9); // Ages 62-70
    });

    it('should recommend early claiming for shorter life expectancy', () => {
      const inputs: IdealAgeInputs = {
        birthYear: 1970,
        lifeExpectancy: 75,
        investmentReturn: 5,
        cola: 2,
      };

      const results = calculateIdealClaimAge(inputs);

      // With shorter life expectancy, should recommend earlier claiming
      expect(results.idealClaimAge).toBeLessThanOrEqual(65);
      expect(results.recommendation).toContain('earlier');
    });

    it('should recommend delayed claiming for longer life expectancy', () => {
      const inputs: IdealAgeInputs = {
        birthYear: 1970,
        lifeExpectancy: 95,
        investmentReturn: 3,
        cola: 2.5,
      };

      const results = calculateIdealClaimAge(inputs);

      // With longer life expectancy and lower returns, should recommend later claiming
      expect(results.idealClaimAge).toBeGreaterThanOrEqual(67);
      expect(results.recommendation).toContain('delay');
    });

    it('should handle high investment return scenarios', () => {
      const inputs: IdealAgeInputs = {
        birthYear: 1965,
        lifeExpectancy: 85,
        investmentReturn: 8,
        cola: 2,
      };

      const results = calculateIdealClaimAge(inputs);

      // High investment returns favor early claiming to invest the money
      expect(results.idealClaimAge).toBeLessThanOrEqual(65);
      expect(results.ageAnalysis[0].presentValue).toBeGreaterThan(0);
    });
  });

  describe('compareTwoClaimAges', () => {
    it('should compare claiming at 62 vs 67', () => {
      const inputs: CompareAgesInputs = {
        claimAge1: 62,
        monthlyPayment1: 2000,
        claimAge2: 67,
        monthlyPayment2: 3000,
        investmentReturn: 6,
        cola: 2.5,
      };

      const results = compareTwoClaimAges(inputs);

      expect(results.option1.claimAge).toBe(62);
      expect(results.option1.monthlyBenefit).toBe(2000);
      expect(results.option2.claimAge).toBe(67);
      expect(results.option2.monthlyBenefit).toBe(3000);
      expect(results.breakEvenAge).toBeGreaterThan(70);
      expect(results.recommendation).toBeDefined();
    });

    it('should favor early claiming with high investment returns', () => {
      const inputs: CompareAgesInputs = {
        claimAge1: 62,
        monthlyPayment1: 2100,
        claimAge2: 70,
        monthlyPayment2: 3500,
        investmentReturn: 8,
        cola: 2,
      };

      const results = compareTwoClaimAges(inputs);

      // High investment returns should favor early claiming
      expect(results.betterOption).toBe(1);
      expect(results.recommendation).toContain('Option 1');
    });

    it('should favor delayed claiming with low investment returns', () => {
      const inputs: CompareAgesInputs = {
        claimAge1: 65,
        monthlyPayment1: 2500,
        claimAge2: 70,
        monthlyPayment2: 3800,
        investmentReturn: 3,
        cola: 2,
      };

      const results = compareTwoClaimAges(inputs);

      // Low investment returns should favor delayed claiming for higher benefit
      expect(results.betterOption).toBe(2);
      expect(results.recommendation).toContain('Option 2');
    });

    it('should calculate cumulative values at different ages', () => {
      const inputs: CompareAgesInputs = {
        claimAge1: 62,
        monthlyPayment1: 2000,
        claimAge2: 67,
        monthlyPayment2: 3000,
        investmentReturn: 5,
        cola: 2,
      };

      const results = compareTwoClaimAges(inputs);

      expect(results.cumulativeComparison).toBeDefined();
      expect(results.cumulativeComparison.length).toBeGreaterThan(0);

      // Check that cumulative values increase with age
      for (let i = 1; i < results.cumulativeComparison.length; i++) {
        const prev = results.cumulativeComparison[i - 1];
        const curr = results.cumulativeComparison[i];
        expect(curr.age).toBeGreaterThan(prev.age);

        // Option 1 should have values from claim age 1
        if (curr.age > inputs.claimAge1) {
          expect(curr.option1Cumulative).toBeGreaterThanOrEqual(
            prev.option1Cumulative
          );
        }

        // Option 2 should have values from claim age 2
        if (curr.age > inputs.claimAge2) {
          expect(curr.option2Cumulative).toBeGreaterThanOrEqual(
            prev.option2Cumulative
          );
        }
      }
    });

    it('should handle equal monthly payments', () => {
      const inputs: CompareAgesInputs = {
        claimAge1: 62,
        monthlyPayment1: 2500,
        claimAge2: 67,
        monthlyPayment2: 2500,
        investmentReturn: 5,
        cola: 2,
      };

      const results = compareTwoClaimAges(inputs);

      // With equal payments, earlier claiming should always be better
      expect(results.betterOption).toBe(1);
      expect(results.breakEvenAge).toBe(Infinity);
    });
  });
});
