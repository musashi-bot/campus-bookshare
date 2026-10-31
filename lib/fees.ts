import { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/db/seed-data";

export interface FeeCalculationResult {
  rentAmount: number;
  platformFee: number;
  commissionAmount: number;
  borrowerTotal: number;
  lenderPayout: number;
  platformEarning: number;
}

export interface LateFeeResult {
  daysOverdue: number;
  lateFeeTotal: number;
  lenderLateFeeShare: number;
  platformLateFeeShare: number;
}

/**
 * Calculates rental fees for a book rental based on rent per week and weeks duration.
 * Example: rent 50 for 1 week -> borrower total 60, lender payout 45, platform earning 15
 */
export function calculateRentalFees(
  rentPerWeek: number,
  weeks: number,
  customSettings?: Partial<AppSettings>
): FeeCalculationResult {
  const settings = { ...DEFAULT_SETTINGS, ...customSettings };

  const rentAmount = Math.round(rentPerWeek * weeks * 100) / 100;
  const platformFee = settings.platform_fee_flat;
  const commissionPercent = settings.lender_commission_percent;

  const commissionAmount = Math.round(((rentAmount * commissionPercent) / 100) * 100) / 100;
  const borrowerTotal = Math.round((rentAmount + platformFee) * 100) / 100;
  const lenderPayout = Math.round((rentAmount - commissionAmount) * 100) / 100;
  const platformEarning = Math.round((platformFee + commissionAmount) * 100) / 100;

  return {
    rentAmount,
    platformFee,
    commissionAmount,
    borrowerTotal,
    lenderPayout,
    platformEarning,
  };
}

/**
 * Calculates late fees when today > due_date.
 * Accrues daily and splits 50/50 (or per setting) between lender and platform.
 */
export function calculateLateFee(
  dueDateString?: string | null,
  currentDate: Date = new Date(),
  customSettings?: Partial<AppSettings>
): LateFeeResult {
  if (!dueDateString) {
    return {
      daysOverdue: 0,
      lateFeeTotal: 0,
      lenderLateFeeShare: 0,
      platformLateFeeShare: 0,
    };
  }

  const settings = { ...DEFAULT_SETTINGS, ...customSettings };
  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);

  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      daysOverdue: 0,
      lateFeeTotal: 0,
      lenderLateFeeShare: 0,
      platformLateFeeShare: 0,
    };
  }

  const lateFeeTotal = diffDays * settings.late_fee_per_day;
  const splitPercent = settings.late_fee_lender_split_percent;
  const lenderLateFeeShare = Math.round(((lateFeeTotal * splitPercent) / 100) * 100) / 100;
  const platformLateFeeShare = Math.round((lateFeeTotal - lenderLateFeeShare) * 100) / 100;

  return {
    daysOverdue: diffDays,
    lateFeeTotal,
    lenderLateFeeShare,
    platformLateFeeShare,
  };
}

/**
 * Computes due date given a start date and rental duration in weeks.
 */
export function calculateDueDate(startDate: string | Date, weeks: number): string {
  const start = new Date(startDate);
  const due = new Date(start.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
  return due.toISOString().split("T")[0];
}

/**
 * Validates whether a borrower can rent another novel based on active limits.
 */
export function canBorrowerRent(
  currentActiveCount: number,
  maxAllowed: number = DEFAULT_SETTINGS.max_active_rentals_per_borrower
): boolean {
  return currentActiveCount < maxAllowed;
}

