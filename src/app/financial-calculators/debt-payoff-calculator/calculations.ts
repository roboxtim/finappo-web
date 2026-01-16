export enum PayoffStrategy {
  AVALANCHE = 'avalanche',
  SNOWBALL = 'snowball',
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
}

export interface DebtPayoffInputs {
  debts: Debt[];
  extraPayment: number;
  strategy: PayoffStrategy;
}

export interface PaymentScheduleItem {
  month: number;
  monthlyPayment: number;
  payments: Record<string, number>;
  remainingBalances: Record<string, number>;
  interestPaid: Record<string, number>;
  principalPaid: Record<string, number>;
  debtsPaidOff: string[];
}

export interface DebtPayoffResults {
  totalMonths: number;
  totalAmountPaid: number;
  totalInterestPaid: number;
  monthlyPayment: number;
  paymentSchedule: PaymentScheduleItem[];
  debtPayoffOrder: string[];
  savingsVsMinimum: {
    monthsSaved: number;
    interestSaved: number;
    totalSaved: number;
  };
}

export interface MinimumPaymentResults {
  totalMonths: number;
  totalAmountPaid: number;
  totalInterestPaid: number;
  monthlyPayment: number;
}

// Validation functions
export function validateDebtInputs(inputs: DebtPayoffInputs): string[] {
  const errors: string[] = [];

  if (inputs.debts.length === 0) {
    errors.push('Please add at least one debt');
  }

  inputs.debts.forEach((debt) => {
    if (debt.balance <= 0) {
      errors.push(`${debt.name}: Balance must be greater than 0`);
    }

    if (debt.apr < 0 || debt.apr > 100) {
      errors.push(`${debt.name}: APR must be between 0 and 100`);
    }

    if (debt.minimumPayment <= 0) {
      errors.push(`${debt.name}: Minimum payment must be greater than 0`);
    }

    // Check if minimum payment covers monthly interest
    const monthlyInterest = (debt.balance * (debt.apr / 100)) / 12;
    if (debt.minimumPayment <= monthlyInterest) {
      errors.push(
        `${debt.name}: Minimum payment ($${debt.minimumPayment.toFixed(
          2
        )}) must be greater than monthly interest ($${monthlyInterest.toFixed(2)})`
      );
    }
  });

  if (inputs.extraPayment < 0) {
    errors.push('Extra payment cannot be negative');
  }

  return errors;
}

// Calculate minimum payments only scenario
export function calculateMinimumPaymentsOnly(
  debts: Debt[]
): MinimumPaymentResults {
  const MAX_MONTHS = 600; // 50 years maximum
  let totalMonths = 0;
  let totalInterestPaid = 0;
  let totalAmountPaid = 0;

  // Copy debts to track balances
  const remainingDebts = debts.map((d) => ({
    ...d,
    currentBalance: d.balance,
  }));

  const monthlyPayment = debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  // Simulate payments month by month
  while (
    totalMonths < MAX_MONTHS &&
    remainingDebts.some((d) => d.currentBalance > 0.01)
  ) {
    totalMonths++;

    remainingDebts.forEach((debt) => {
      if (debt.currentBalance > 0.01) {
        const monthlyRate = debt.apr / 100 / 12;
        const interestCharge = debt.currentBalance * monthlyRate;
        const principalPayment = debt.minimumPayment - interestCharge;

        // Handle final payment
        const actualPayment = Math.min(
          debt.minimumPayment,
          debt.currentBalance + interestCharge
        );

        totalInterestPaid += interestCharge;
        totalAmountPaid += actualPayment;

        debt.currentBalance -= principalPayment;
        if (debt.currentBalance < 0.01) {
          debt.currentBalance = 0;
        }
      }
    });
  }

  return {
    totalMonths,
    totalAmountPaid,
    totalInterestPaid,
    monthlyPayment,
  };
}

// Main calculation function
export function calculateDebtPayoff(
  inputs: DebtPayoffInputs
): DebtPayoffResults {
  const MAX_MONTHS = 600; // 50 years maximum

  // Initialize working copy of debts
  const workingDebts = inputs.debts.map((d) => ({
    ...d,
    currentBalance: d.balance,
    isPaidOff: false,
  }));

  // Sort debts based on strategy
  const sortDebts = (debts: typeof workingDebts) => {
    const activeDebts = debts.filter((d) => !d.isPaidOff);

    if (inputs.strategy === PayoffStrategy.AVALANCHE) {
      // Sort by APR (highest first)
      return activeDebts.sort((a, b) => b.apr - a.apr);
    } else {
      // Snowball: Sort by balance (lowest first)
      return activeDebts.sort((a, b) => a.currentBalance - b.currentBalance);
    }
  };

  // Track results
  let totalMonths = 0;
  let totalInterestPaid = 0;
  let totalAmountPaid = 0;
  const paymentSchedule: PaymentScheduleItem[] = [];
  const debtPayoffOrder: string[] = [];

  // Calculate total monthly payment
  const totalMinimumPayment = inputs.debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );
  const monthlyPayment = totalMinimumPayment + inputs.extraPayment;

  // Track available extra payment (will grow as debts are paid off)
  let rollingExtraPayment = inputs.extraPayment;

  // Simulate month by month
  while (totalMonths < MAX_MONTHS && workingDebts.some((d) => !d.isPaidOff)) {
    totalMonths++;

    const monthData: PaymentScheduleItem = {
      month: totalMonths,
      monthlyPayment: 0,
      payments: {},
      remainingBalances: {},
      interestPaid: {},
      principalPaid: {},
      debtsPaidOff: [],
    };

    // Calculate interest for all debts first
    workingDebts.forEach((debt) => {
      if (!debt.isPaidOff) {
        const monthlyRate = debt.apr / 100 / 12;
        const interestCharge = debt.currentBalance * monthlyRate;
        monthData.interestPaid[debt.name] = interestCharge;
        totalInterestPaid += interestCharge;
      } else {
        monthData.interestPaid[debt.name] = 0;
      }
    });

    // Pay minimums on all debts
    workingDebts.forEach((debt) => {
      if (!debt.isPaidOff) {
        const interestCharge = monthData.interestPaid[debt.name];

        // Handle case where debt is almost paid off
        const actualPayment = Math.min(
          debt.minimumPayment,
          debt.currentBalance + interestCharge
        );
        const actualPrincipal = actualPayment - interestCharge;

        monthData.payments[debt.name] = actualPayment;
        monthData.principalPaid[debt.name] = actualPrincipal;

        debt.currentBalance -= actualPrincipal;
        totalAmountPaid += actualPayment;
        monthData.monthlyPayment += actualPayment;
      } else {
        monthData.payments[debt.name] = 0;
        monthData.principalPaid[debt.name] = 0;
      }
    });

    // Allocate extra payment to target debt (based on strategy)
    const sortedDebts = sortDebts(workingDebts);

    if (sortedDebts.length > 0 && rollingExtraPayment > 0) {
      const targetDebt = sortedDebts[0];
      const extraPayment = Math.min(
        rollingExtraPayment,
        targetDebt.currentBalance
      );

      monthData.payments[targetDebt.name] += extraPayment;
      monthData.principalPaid[targetDebt.name] += extraPayment;
      targetDebt.currentBalance -= extraPayment;
      totalAmountPaid += extraPayment;
      monthData.monthlyPayment += extraPayment;
    }

    // Check for paid off debts and roll over their minimum payments
    workingDebts.forEach((debt) => {
      if (!debt.isPaidOff && debt.currentBalance < 0.01) {
        debt.currentBalance = 0;
        debt.isPaidOff = true;
        monthData.debtsPaidOff.push(debt.name);
        debtPayoffOrder.push(debt.name);

        // Roll over the minimum payment to extra payment for next month
        rollingExtraPayment += debt.minimumPayment;
      }

      monthData.remainingBalances[debt.name] = debt.currentBalance;
    });

    paymentSchedule.push(monthData);
  }

  // Calculate savings vs minimum payments
  const minimumOnly = calculateMinimumPaymentsOnly(inputs.debts);

  return {
    totalMonths,
    totalAmountPaid,
    totalInterestPaid,
    monthlyPayment,
    paymentSchedule,
    debtPayoffOrder,
    savingsVsMinimum: {
      monthsSaved: minimumOnly.totalMonths - totalMonths,
      interestSaved: minimumOnly.totalInterestPaid - totalInterestPaid,
      totalSaved: minimumOnly.totalAmountPaid - totalAmountPaid,
    },
  };
}

// Format functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;
  }

  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }

  const yearText = years === 1 ? '1 year' : `${years} years`;
  const monthText =
    remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;

  return `${yearText}, ${monthText}`;
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
