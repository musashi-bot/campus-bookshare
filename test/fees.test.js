const { test, describe } = require("node:test");
const assert = require("node:assert");

// Import the compiled or TS file via ts-node or simple JS mirroring for the test runner
// Let's create the unit test runner
const {
  calculateRentalFees,
  calculateLateFee,
  calculateDueDate,
  canBorrowerRent,
} = require("./fees-runner.cjs");

describe("Fees & Money Logic Unit Tests", () => {
  test("Example calculation from spec: rent 50 for 1 week", () => {
    // rent 50 for 1 week gives a borrower total of 60, a lender payout of 45, and a platform earning of 15
    const result = calculateRentalFees(50, 1);
    assert.strictEqual(result.rentAmount, 50);
    assert.strictEqual(result.platformFee, 10);
    assert.strictEqual(result.commissionAmount, 5);
    assert.strictEqual(result.borrowerTotal, 60);
    assert.strictEqual(result.lenderPayout, 45);
    assert.strictEqual(result.platformEarning, 15);
  });

  test("Multi-week calculation: rent 40 for 3 weeks", () => {
    // rent 40 for 3 weeks -> rent 120, platform fee 10, commission 12
    // borrower total: 130, lender payout: 108, platform earning: 22
    const result = calculateRentalFees(40, 3);
    assert.strictEqual(result.rentAmount, 120);
    assert.strictEqual(result.platformFee, 10);
    assert.strictEqual(result.commissionAmount, 12);
    assert.strictEqual(result.borrowerTotal, 130);
    assert.strictEqual(result.lenderPayout, 108);
    assert.strictEqual(result.platformEarning, 22);
  });

  test("Custom settings override: flat fee 15 and commission 15%", () => {
    const result = calculateRentalFees(100, 2, {
      platform_fee_flat: 15,
      lender_commission_percent: 15,
    });
    // rent 200, platform fee 15, commission 30
    // borrower total: 215, lender payout: 170, platform earning: 45
    assert.strictEqual(result.rentAmount, 200);
    assert.strictEqual(result.platformFee, 15);
    assert.strictEqual(result.commissionAmount, 30);
    assert.strictEqual(result.borrowerTotal, 215);
    assert.strictEqual(result.lenderPayout, 170);
    assert.strictEqual(result.platformEarning, 45);
  });

  test("Late fee calculation: not overdue", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const result = calculateLateFee(futureDate.toISOString());

    assert.strictEqual(result.daysOverdue, 0);
    assert.strictEqual(result.lateFeeTotal, 0);
    assert.strictEqual(result.lenderLateFeeShare, 0);
    assert.strictEqual(result.platformLateFeeShare, 0);
  });

  test("Late fee calculation: 4 days overdue at ₹2/day with 50/50 split", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 4);
    const result = calculateLateFee(pastDate.toISOString(), new Date());

    assert.strictEqual(result.daysOverdue, 4);
    assert.strictEqual(result.lateFeeTotal, 8); // 4 * 2
    assert.strictEqual(result.lenderLateFeeShare, 4); // 50%
    assert.strictEqual(result.platformLateFeeShare, 4); // 50%
  });

  test("Due date calculation: 2 weeks from start date", () => {
    const start = "2026-11-01";
    const due = calculateDueDate(start, 2);
    assert.strictEqual(due, "2026-11-15");
  });

  test("Borrower active rental limit", () => {
    assert.strictEqual(canBorrowerRent(0, 3), true);
    assert.strictEqual(canBorrowerRent(2, 3), true);
    assert.strictEqual(canBorrowerRent(3, 3), false);
    assert.strictEqual(canBorrowerRent(4, 3), false);
  });
});

