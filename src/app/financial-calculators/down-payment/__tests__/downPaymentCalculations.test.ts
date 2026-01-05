import {
  calculateDownPaymentFromPrice,
  calculateMonthlyPayment,
  calculateTotalCashNeeded,
  calculateLoanDetails,
  DownPaymentCalculation,
} from '../utils/calculations';

describe('Down Payment Calculator', () => {
  describe('calculateDownPaymentFromPrice', () => {
    it('should calculate 20% down payment correctly', () => {
      const result = calculateDownPaymentFromPrice(300000, 20);
      expect(result).toBe(60000);
    });

    it('should calculate 10% down payment correctly', () => {
      const result = calculateDownPaymentFromPrice(500000, 10);
      expect(result).toBe(50000);
    });

    it('should calculate 3.5% down payment (FHA minimum) correctly', () => {
      const result = calculateDownPaymentFromPrice(200000, 3.5);
      expect(result).toBe(7000);
    });

    it('should handle 0% down payment', () => {
      const result = calculateDownPaymentFromPrice(250000, 0);
      expect(result).toBe(0);
    });

    it('should handle 100% down payment (cash purchase)', () => {
      const result = calculateDownPaymentFromPrice(400000, 100);
      expect(result).toBe(400000);
    });
  });

  describe('calculateMonthlyPayment', () => {
    it('should calculate monthly payment for 30-year mortgage at 6.5% APR', () => {
      const principal = 240000; // $300k home with 20% down
      const annualRate = 6.5;
      const years = 30;

      const result = calculateMonthlyPayment(principal, annualRate, years);

      // Expected: $1,516.96 (standard mortgage calculation)
      expect(result).toBeCloseTo(1516.96, 1);
    });

    it('should calculate monthly payment for 15-year mortgage at 5.5% APR', () => {
      const principal = 200000;
      const annualRate = 5.5;
      const years = 15;

      const result = calculateMonthlyPayment(principal, annualRate, years);

      // Expected: $1,634.17
      expect(result).toBeCloseTo(1634.17, 1);
    });

    it('should calculate monthly payment for 30-year mortgage at 7% APR', () => {
      const principal = 350000;
      const annualRate = 7.0;
      const years = 30;

      const result = calculateMonthlyPayment(principal, annualRate, years);

      // Expected: $2,328.56
      expect(result).toBeCloseTo(2328.56, 1);
    });

    it('should handle 0% interest rate', () => {
      const principal = 120000;
      const annualRate = 0;
      const years = 10;

      const result = calculateMonthlyPayment(principal, annualRate, years);

      // With 0% interest, payment = principal / months
      expect(result).toBeCloseTo(120000 / (10 * 12), 2);
    });

    it('should calculate monthly payment for shorter 10-year term', () => {
      const principal = 150000;
      const annualRate = 4.5;
      const years = 10;

      const result = calculateMonthlyPayment(principal, annualRate, years);

      // Expected: $1,554.58
      expect(result).toBeCloseTo(1554.58, 1);
    });
  });

  describe('calculateTotalCashNeeded', () => {
    it('should calculate total cash needed with 3% closing costs', () => {
      const homePrice = 300000;
      const downPayment = 60000;
      const closingCostPercent = 3;

      const result = calculateTotalCashNeeded(
        homePrice,
        downPayment,
        closingCostPercent
      );

      expect(result.closingCosts).toBe(9000); // 3% of 300k
      expect(result.totalCashNeeded).toBe(69000); // 60k + 9k
    });

    it('should calculate total cash needed with 2% closing costs', () => {
      const homePrice = 500000;
      const downPayment = 100000;
      const closingCostPercent = 2;

      const result = calculateTotalCashNeeded(
        homePrice,
        downPayment,
        closingCostPercent
      );

      expect(result.closingCosts).toBe(10000); // 2% of 500k
      expect(result.totalCashNeeded).toBe(110000); // 100k + 10k
    });

    it('should calculate total cash needed with 0% closing costs', () => {
      const homePrice = 250000;
      const downPayment = 50000;
      const closingCostPercent = 0;

      const result = calculateTotalCashNeeded(
        homePrice,
        downPayment,
        closingCostPercent
      );

      expect(result.closingCosts).toBe(0);
      expect(result.totalCashNeeded).toBe(50000);
    });

    it('should handle FHA loan with 3.5% closing costs', () => {
      const homePrice = 200000;
      const downPayment = 7000; // 3.5% FHA minimum
      const closingCostPercent = 3.5;

      const result = calculateTotalCashNeeded(
        homePrice,
        downPayment,
        closingCostPercent
      );

      expect(result.closingCosts).toBe(7000);
      expect(result.totalCashNeeded).toBe(14000);
    });
  });

  describe('calculateLoanDetails - Complete Calculator', () => {
    it('should calculate complete loan details for typical home purchase', () => {
      const homePrice = 300000;
      const downPaymentPercent = 20;
      const closingCostPercent = 3;
      const interestRate = 6.5;
      const loanTermYears = 30;

      const result: DownPaymentCalculation = calculateLoanDetails(
        homePrice,
        downPaymentPercent,
        closingCostPercent,
        interestRate,
        loanTermYears
      );

      // Verify down payment
      expect(result.downPayment).toBe(60000);
      expect(result.downPaymentPercent).toBe(20);

      // Verify loan amount
      expect(result.loanAmount).toBe(240000);

      // Verify closing costs
      expect(result.closingCosts).toBe(9000);
      expect(result.totalCashNeeded).toBe(69000);

      // Verify monthly payment
      expect(result.monthlyPayment).toBeCloseTo(1516.96, 1);

      // Verify PMI requirement
      expect(result.requiresPMI).toBe(false); // 20% down = no PMI
    });

    it('should flag PMI requirement when down payment is less than 20%', () => {
      const homePrice = 250000;
      const downPaymentPercent = 10;
      const closingCostPercent = 3;
      const interestRate = 7.0;
      const loanTermYears = 30;

      const result = calculateLoanDetails(
        homePrice,
        downPaymentPercent,
        closingCostPercent,
        interestRate,
        loanTermYears
      );

      expect(result.downPayment).toBe(25000);
      expect(result.loanAmount).toBe(225000);
      expect(result.requiresPMI).toBe(true); // Less than 20% down
    });

    it('should calculate FHA loan scenario correctly', () => {
      const homePrice = 200000;
      const downPaymentPercent = 3.5; // FHA minimum
      const closingCostPercent = 3;
      const interestRate = 6.0;
      const loanTermYears = 30;

      const result = calculateLoanDetails(
        homePrice,
        downPaymentPercent,
        closingCostPercent,
        interestRate,
        loanTermYears
      );

      expect(result.downPayment).toBe(7000);
      expect(result.loanAmount).toBe(193000);
      expect(result.closingCosts).toBe(6000);
      expect(result.totalCashNeeded).toBe(13000);
      expect(result.requiresPMI).toBe(true);
      expect(result.monthlyPayment).toBeCloseTo(1157.13, 1);
    });

    it('should calculate conventional 5% down loan', () => {
      const homePrice = 400000;
      const downPaymentPercent = 5;
      const closingCostPercent = 2.5;
      const interestRate = 6.75;
      const loanTermYears = 30;

      const result = calculateLoanDetails(
        homePrice,
        downPaymentPercent,
        closingCostPercent,
        interestRate,
        loanTermYears
      );

      expect(result.downPayment).toBe(20000);
      expect(result.loanAmount).toBe(380000);
      expect(result.closingCosts).toBe(10000);
      expect(result.totalCashNeeded).toBe(30000);
      expect(result.requiresPMI).toBe(true);
      expect(result.monthlyPayment).toBeCloseTo(2464.67, 1);
    });

    it('should calculate 15-year mortgage with 25% down', () => {
      const homePrice = 350000;
      const downPaymentPercent = 25;
      const closingCostPercent = 2;
      const interestRate = 5.5;
      const loanTermYears = 15;

      const result = calculateLoanDetails(
        homePrice,
        downPaymentPercent,
        closingCostPercent,
        interestRate,
        loanTermYears
      );

      expect(result.downPayment).toBe(87500);
      expect(result.loanAmount).toBe(262500);
      expect(result.closingCosts).toBe(7000);
      expect(result.totalCashNeeded).toBe(94500);
      expect(result.requiresPMI).toBe(false); // 25% down
      expect(result.monthlyPayment).toBeCloseTo(2144.87, 1);
    });

    it('should handle cash purchase (100% down payment)', () => {
      const homePrice = 250000;
      const downPaymentPercent = 100;
      const closingCostPercent = 1; // Minimal closing costs for cash
      const interestRate = 0;
      const loanTermYears = 30;

      const result = calculateLoanDetails(
        homePrice,
        downPaymentPercent,
        closingCostPercent,
        interestRate,
        loanTermYears
      );

      expect(result.downPayment).toBe(250000);
      expect(result.loanAmount).toBe(0);
      expect(result.closingCosts).toBe(2500);
      expect(result.totalCashNeeded).toBe(252500);
      expect(result.requiresPMI).toBe(false);
      expect(result.monthlyPayment).toBe(0);
    });

    it('should calculate high-value property with jumbo loan', () => {
      const homePrice = 1000000;
      const downPaymentPercent = 20;
      const closingCostPercent = 2;
      const interestRate = 7.25;
      const loanTermYears = 30;

      const result = calculateLoanDetails(
        homePrice,
        downPaymentPercent,
        closingCostPercent,
        interestRate,
        loanTermYears
      );

      expect(result.downPayment).toBe(200000);
      expect(result.loanAmount).toBe(800000);
      expect(result.closingCosts).toBe(20000);
      expect(result.totalCashNeeded).toBe(220000);
      expect(result.requiresPMI).toBe(false);
      expect(result.monthlyPayment).toBeCloseTo(5457.41, 1);
    });

    it('should handle edge case with minimal down payment', () => {
      const homePrice = 150000;
      const downPaymentPercent = 3; // VA or special program minimum
      const closingCostPercent = 3;
      const interestRate = 6.25;
      const loanTermYears = 30;

      const result = calculateLoanDetails(
        homePrice,
        downPaymentPercent,
        closingCostPercent,
        interestRate,
        loanTermYears
      );

      expect(result.downPayment).toBe(4500);
      expect(result.loanAmount).toBe(145500);
      expect(result.closingCosts).toBe(4500);
      expect(result.totalCashNeeded).toBe(9000);
      expect(result.requiresPMI).toBe(true);
      expect(result.monthlyPayment).toBeCloseTo(895.87, 1);
    });
  });

  describe('Edge Cases and Validations', () => {
    it('should handle very small home prices', () => {
      const result = calculateLoanDetails(50000, 20, 3, 6.0, 30);

      expect(result.downPayment).toBe(10000);
      expect(result.loanAmount).toBe(40000);
      expect(result.closingCosts).toBe(1500);
    });

    it('should handle very high interest rates', () => {
      const result = calculateLoanDetails(200000, 20, 3, 15.0, 30);

      expect(result.monthlyPayment).toBeCloseTo(2023.11, 1);
    });

    it('should handle 10-year loan term', () => {
      const result = calculateLoanDetails(300000, 20, 3, 6.0, 10);

      expect(result.monthlyPayment).toBeCloseTo(2664.49, 1);
    });

    it('should calculate correctly with decimal percentages', () => {
      const result = calculateLoanDetails(275000, 12.5, 2.75, 6.375, 30);

      expect(result.downPayment).toBe(34375);
      expect(result.loanAmount).toBe(240625);
      expect(result.closingCosts).toBe(7562.5);
      expect(result.totalCashNeeded).toBe(41937.5);
    });
  });
});
