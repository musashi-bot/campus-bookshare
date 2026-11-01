import { Book, Rental, Payout, Setting, AppSettings, RentalStatus } from "@/lib/types";
import { SEED_NOVELS, SEED_RENTALS, SEED_PAYOUTS, SEED_PROFILES, DEFAULT_SETTINGS } from "@/lib/db/seed-data";
import { createClient } from "@/lib/supabase/client";
import { calculateLateFee, calculateDueDate } from "@/lib/fees";

// Local admin state stores
let adminBooks: Book[] = [
  ...SEED_NOVELS,
  {
    id: "c-pending-01",
    owner_id: "b0000000-0000-0000-0000-000000000005", // Diya
    title: "Before the Coffee Gets Cold",
    author: "Toshikazu Kawaguchi",
    edition: "Picador 2019",
    category: "Fiction",
    condition: "Good",
    description: "In a small back alley in Tokyo, there is a cafe that has been serving carefully brewed coffee for more than one hundred years. Loved reading this during exams.",
    rent_per_week: 30,
    image_urls: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    ],
    status: "pending",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    owner: SEED_PROFILES[4],
  },
];

let adminRentals: Rental[] = [
  ...SEED_RENTALS,
  {
    id: "r-awaiting-payment-01",
    book_id: "c0000000-0000-0000-0000-000000000002", // The Silent Patient
    borrower_id: "b0000000-0000-0000-0000-000000000003", // Ananya
    lender_id: "b0000000-0000-0000-0000-000000000002", // Rahul
    weeks: 2,
    start_date: null,
    due_date: null,
    return_date: null,
    rent_amount: 80,
    platform_fee: 10,
    commission_amount: 8,
    late_fee: 0,
    payment_status: "awaiting_confirmation",
    upi_reference: "UPI/2026/ANANYA-78912",
    status: "payment_pending",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    book: SEED_NOVELS[1],
    borrower: SEED_PROFILES[2],
    lender: SEED_PROFILES[1],
  },
  {
    id: "r-overdue-sample-01",
    book_id: "c0000000-0000-0000-0000-000000000007", // The Great Gatsby
    borrower_id: "b0000000-0000-0000-0000-000000000004", // Kabir
    lender_id: "b0000000-0000-0000-0000-000000000005", // Diya
    weeks: 1,
    start_date: "2026-10-10",
    due_date: "2026-10-17",
    return_date: null,
    rent_amount: 25,
    platform_fee: 10,
    commission_amount: 2.5,
    late_fee: 28, // 14 days overdue * 2
    payment_status: "paid",
    upi_reference: "UPI/2026/GATSBY-234",
    status: "overdue",
    created_at: "2026-10-09T10:00:00Z",
    book: SEED_NOVELS[6],
    borrower: SEED_PROFILES[3],
    lender: SEED_PROFILES[4],
  },
];

let adminPayouts: Payout[] = [
  ...SEED_PAYOUTS,
  {
    id: "p-pending-01",
    lender_id: "b0000000-0000-0000-0000-000000000004", // Kabir
    rental_id: "r0000000-0000-0000-0000-000000000001",
    amount: 81, // 90 - 9 commission
    status: "pending",
    paid_at: null,
    created_at: new Date().toISOString(),
    lender: SEED_PROFILES[3],
  },
];

let adminSettings: AppSettings = { ...DEFAULT_SETTINGS };
let premiumInterestCount = 27; // seed demo count

export interface AdminMetrics {
  totalRentals: number;
  activeRentals: number;
  overdueRentals: number;
  platformEarnings: number;
  pendingPayoutsAmount: number;
  premiumInterestCount: number;
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { count: totalRentals } = await supabase.from("rentals").select("*", { count: "exact", head: true });
      const { count: activeRentals } = await supabase.from("rentals").select("*", { count: "exact", head: true }).eq("status", "active");
      const { count: overdueRentals } = await supabase.from("rentals").select("*", { count: "exact", head: true }).eq("status", "overdue");
      const { count: premiumInterest } = await supabase.from("premium_interest").select("*", { count: "exact", head: true });

      const { data: rentalsData } = await supabase.from("rentals").select("platform_fee, commission_amount, late_fee, status");
      let earnings = 0;
      if (rentalsData) {
        earnings = rentalsData
          .filter((r) => ["active", "returned", "overdue"].includes(r.status))
          .reduce((sum, r) => sum + Number(r.platform_fee) + Number(r.commission_amount) + (Number(r.late_fee || 0) * 0.5), 0);
      }

      const { data: payoutsData } = await supabase.from("payouts").select("amount").eq("status", "pending");
      let pendingPayouts = 0;
      if (payoutsData) {
        pendingPayouts = payoutsData.reduce((sum, p) => sum + Number(p.amount), 0);
      }

      return {
        totalRentals: totalRentals || adminRentals.length,
        activeRentals: activeRentals || 0,
        overdueRentals: overdueRentals || 0,
        platformEarnings: Math.round(earnings),
        pendingPayoutsAmount: Math.round(pendingPayouts),
        premiumInterestCount: premiumInterest || premiumInterestCount,
      };
    } catch (err) {
      console.warn("Supabase admin metrics fallback:", err);
    }
  }

  // Calculate from local data
  const totalRentals = adminRentals.length;
  const activeRentals = adminRentals.filter((r) => r.status === "active").length;
  const overdueRentals = adminRentals.filter((r) => r.status === "overdue").length;

  const platformEarnings = adminRentals
    .filter((r) => ["active", "returned", "overdue"].includes(r.status))
    .reduce((sum, r) => {
      const flatFee = Number(r.platform_fee);
      const commission = Number(r.commission_amount);
      const lateFeeShare = Number(r.late_fee || 0) * 0.5;
      return sum + flatFee + commission + lateFeeShare;
    }, 0);

  const pendingPayoutsAmount = adminPayouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    totalRentals,
    activeRentals,
    overdueRentals,
    platformEarnings: Math.round(platformEarnings),
    pendingPayoutsAmount: Math.round(pendingPayoutsAmount),
    premiumInterestCount,
  };
}

export async function fetchPendingBooks(): Promise<Book[]> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { data } = await supabase
        .from("books")
        .select("*, owner:profiles(*)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) return data as Book[];
    } catch (err) {
      console.warn(err);
    }
  }

  return adminBooks.filter((b) => b.status === "pending");
}

export async function approveBookListing(bookId: string): Promise<boolean> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { error } = await supabase.from("books").update({ status: "available" }).eq("id", bookId);
      if (error) {
        console.error("Error approving book in Supabase:", error);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  adminBooks = adminBooks.map((b) => (b.id === bookId ? { ...b, status: "available" } : b));
  return true;
}

export async function rejectBookListing(bookId: string): Promise<boolean> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      await supabase.from("books").update({ status: "removed" }).eq("id", bookId);
    } catch (err) {
      console.warn(err);
    }
  }

  adminBooks = adminBooks.map((b) => (b.id === bookId ? { ...b, status: "removed" } : b));
  return true;
}

export async function fetchAwaitingPayments(): Promise<Rental[]> {
  return adminRentals.filter((r) => r.payment_status === "awaiting_confirmation" || r.status === "payment_pending");
}

export async function confirmRentalPayment(rentalId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  const targetRental = adminRentals.find((r) => r.id === rentalId);
  const weeks = targetRental?.weeks || 1;
  const dueDate = calculateDueDate(today, weeks);

  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      await supabase
        .from("rentals")
        .update({
          payment_status: "paid",
          status: "active",
          start_date: today,
          due_date: dueDate,
        })
        .eq("id", rentalId);

      if (targetRental?.book_id) {
        await supabase.from("books").update({ status: "rented" }).eq("id", targetRental.book_id);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  // Update in local state
  adminRentals = adminRentals.map((r) => {
    if (r.id === rentalId) {
      return {
        ...r,
        payment_status: "paid",
        status: "active",
        start_date: today,
        due_date: dueDate,
      };
    }
    return r;
  });

  if (targetRental?.book_id) {
    adminBooks = adminBooks.map((b) =>
      b.id === targetRental.book_id ? { ...b, status: "rented" } : b
    );
  }

  return true;
}

export async function markRentalReturned(rentalId: string, conditionNote?: string): Promise<boolean> {
  const returnDate = new Date().toISOString().split("T")[0];
  const target = adminRentals.find((r) => r.id === rentalId);

  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  // Calculate lender payout: rent - commission + (late_fee * split / 100)
  const rentAmount = Number(target?.rent_amount || 0);
  const commission = Number(target?.commission_amount || 0);
  const lateFeeShare = Number(target?.late_fee || 0) * (adminSettings.late_fee_lender_split_percent / 100);
  const payoutAmount = Math.max(0, rentAmount - commission + lateFeeShare);

  if (!isPlaceholder) {
    try {
      await supabase
        .from("rentals")
        .update({
          status: "returned",
          return_date: returnDate,
        })
        .eq("id", rentalId);

      if (target?.book_id) {
        await supabase.from("books").update({ status: "available" }).eq("id", target.book_id);
      }

      if (target) {
        await supabase.from("payouts").insert({
          lender_id: target.lender_id,
          rental_id: target.id,
          amount: payoutAmount,
          status: "pending",
        });
      }
    } catch (err) {
      console.warn(err);
    }
  }

  adminRentals = adminRentals.map((r) =>
    r.id === rentalId
      ? {
          ...r,
          status: "returned",
          return_date: returnDate,
        }
      : r
  );

  if (target?.book_id) {
    adminBooks = adminBooks.map((b) =>
      b.id === target.book_id ? { ...b, status: "available" } : b
    );
  }

  if (target) {
    adminPayouts.unshift({
      id: `payout-${Date.now()}`,
      lender_id: target.lender_id,
      rental_id: target.id,
      amount: payoutAmount,
      status: "pending",
      paid_at: null,
      created_at: new Date().toISOString(),
      lender: target.lender,
      rental: target,
    });
  }

  return true;
}

export async function fetchPendingPayouts(): Promise<Payout[]> {
  return adminPayouts.filter((p) => p.status === "pending");
}

export async function markPayoutAsPaid(payoutId: string): Promise<boolean> {
  const paidAt = new Date().toISOString();
  adminPayouts = adminPayouts.map((p) =>
    p.id === payoutId ? { ...p, status: "paid", paid_at: paidAt } : p
  );
  return true;
}

export async function fetchAllRentals(): Promise<Rental[]> {
  return adminRentals;
}

export async function fetchAdminSettings(): Promise<AppSettings> {
  return adminSettings;
}

export async function updateAdminSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
  adminSettings = { ...adminSettings, ...newSettings };
  return adminSettings;
}

export function exportRentalsToCSV(rentals: Rental[]): string {
  const headers = [
    "Rental ID",
    "Book Title",
    "Borrower Name",
    "Lender Name",
    "Weeks",
    "Status",
    "Payment Status",
    "Start Date",
    "Due Date",
    "Rent Amount",
    "Platform Fee",
    "Commission",
    "Late Fee",
    "UPI Reference",
  ];

  const rows = rentals.map((r) => [
    r.id,
    `"${(r.book?.title || "").replace(/"/g, '""')}"`,
    `"${(r.borrower?.name || "").replace(/"/g, '""')}"`,
    `"${(r.lender?.name || "").replace(/"/g, '""')}"`,
    r.weeks,
    r.status,
    r.payment_status,
    r.start_date || "",
    r.due_date || "",
    r.rent_amount,
    r.platform_fee,
    r.commission_amount,
    r.late_fee || 0,
    r.upi_reference || "",
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

