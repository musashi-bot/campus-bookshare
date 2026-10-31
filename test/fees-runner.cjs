// fees-runner.cjs: CommonJS version of lib/fees.ts for node --test

const DEFAULT_SETTINGS = {
  platform_fee_flat: 10,
  lender_commission_percent: 10,
  late_fee_per_day: 2,
  max_rental_weeks: 4,
  late_fee_lender_split_percent: 50,
  max_active_rentals_per_borrower: 3,
};

function calculateRentalFees(rentPerWeek, weeks, customSettings = {}) {
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

function calculateLateFee(dueDateString, currentDate = new Date(), customSettings = {}) {
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

function calculateDueDate(startDate, weeks) {
  const start = new Date(startDate);
  const due = new Date(start.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
  return due.toISOString().split("T")[0];
}

function canBorrowerRent(currentActiveCount, maxAllowed = DEFAULT_SETTINGS.max_active_rentals_per_borrower) {
  return currentActiveCount < maxAllowed;
}

module.exports = {
  calculateRentalFees,
  calculateLateFee,
  calculateDueDate,
  canBorrowerRent,
};

