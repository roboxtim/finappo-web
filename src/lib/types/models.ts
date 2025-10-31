import { Timestamp } from 'firebase/firestore';

// User Category
export interface UserCategory {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
  order: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  budget?: CategoryBudget;
}

// Category Budget
export interface CategoryBudget {
  amount: number;
  type: BudgetType;
  startDate: Date | Timestamp;
  recurringPeriod?: RecurringPeriod;
  resetDay?: number;
  selectedWeekdays?: number[];
  endDate?: Date | Timestamp;
  untilEndOfPeriod?: UntilEndOfPeriod;
}

export enum BudgetType {
  Recurring = 'recurring',
  OneTime = 'oneTime',
  UntilEndOf = 'untilEndOf',
}

export enum RecurringPeriod {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export enum UntilEndOfPeriod {
  Month = 'month',
  Year = 'year',
}

// Transaction
export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  date: Date | Timestamp;
  note?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Family Member
export interface FamilyMember {
  userId: string;
  name: string;
  email: string;
  emoji: string;
  joinedAt: Date | Timestamp;
}

// Computed category info (for display)
export interface CategoryComputedInfo {
  id: string;
  category: UserCategory;
  amount: number;
  budgetAmount: number;
  budgetStatus: BudgetStatus;
  percentage: number;
}

export enum BudgetStatus {
  Safe = 'safe',
  Warning = 'warning',
  Over = 'over',
  None = 'none',
}
