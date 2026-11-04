import { Book, Rental, Payout, Setting, AppSettings, RentalStatus } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/db/seed-data";
import { createClient } from "@/lib/supabase/client";
import { calculateLateFee, calculateDueDate } from "@/lib/fees";

// Fallback-only in-memory stores (used only when Supabase is NOT connected)
let adminBooks: Book[] = [];
let adminRentals: Rental[] = [];
let adminPayouts: Payout[] = [];
let adminSettings: AppSettings = { ...DEFAULT_SETTINGS };
let premiumInterestCount = 0;

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
        totalRentals: totalRentals ?? 0,
        activeRentals: activeRentals ?? 0,
        overdueRentals: overdueRentals ?? 0,
        platformEarnings: Math.round(earnings),
        pendingPayoutsAmount: Math.round(pendingPayouts),
        premiumInterestCount: premiumInterest ?? 0,
      };
    } catch (err) {
      console.warn("Supabase admin metrics error:", err);
    }
  }

  // Offline/placeholder fallback: return zeros
  return {
    totalRentals: 0,
    activeRentals: 0,
    overdueRentals: 0,
    platformEarnings: 0,
    pendingPayoutsAmount: 0,
    premiumInterestCount: 0,
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
      return (data || []) as Book[];
    } catch (err) {
      console.warn(err);
    }
  }

  return [];
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
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { data, error } = await supabase
        .from("rentals")
        .select("*, book:books(*), borrower:profiles!rentals_borrower_id_fkey(*), lender:profiles!rentals_lender_id_fkey(*)")
        .or("payment_status.eq.awaiting_confirmation,status.eq.payment_pending")
        .order("created_at", { ascending: false });

      if (!error) return (data || []) as Rental[];
      console.error("Error fetching awaiting payments from Supabase:", error);
    } catch (err) {
      console.warn("Supabase awaiting payments error:", err);
    }
    return [];
  }

  return [];
}

export async function confirmRentalPayment(rentalId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  let targetRental = adminRentals.find((r) => r.id === rentalId);

  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { data: rentalData, error: rentalFetchError } = await supabase
        .from("rentals")
        .select("book_id, weeks")
        .eq("id", rentalId)
        .single();
      if (rentalFetchError || !rentalData) {
        console.error("Error loading rental for payment confirmation:", rentalFetchError);
        return false;
      }
      targetRental = { ...(targetRental || {} as Rental), ...rentalData } as Rental;
      const dueDate = calculateDueDate(today, rentalData.weeks || 1);

      const { error: paymentUpdateError } = await supabase
        .from("rentals")
        .update({
          payment_status: "paid",
          status: "active",
          start_date: today,
          due_date: dueDate,
        })
        .eq("id", rentalId);
      if (paymentUpdateError) {
        console.error("Error confirming rental payment:", paymentUpdateError);
        return false;
      }

      if (targetRental?.book_id) {
        const { error: bookUpdateError } = await supabase
          .from("books")
          .update({ status: "rented" })
          .eq("id", targetRental.book_id);
        if (bookUpdateError) {
          console.error("Error marking book as rented:", bookUpdateError);
          return false;
        }
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    const dueDate = calculateDueDate(today, targetRental?.weeks || 1);

    // Update in local state for demo mode.
    adminRentals = adminRentals.map((r) =>
      r.id === rentalId
        ? { ...r, payment_status: "paid", status: "active", start_date: today, due_date: dueDate }
        : r
    );

    if (targetRental?.book_id) {
      adminBooks = adminBooks.map((b) =>
        b.id === targetRental?.book_id ? { ...b, status: "rented" } : b
      );
    }
    return true;
  }

  // Update in local state
  const dueDate = calculateDueDate(today, targetRental?.weeks || 1);
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
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { data } = await supabase
        .from("payouts")
        .select("*, lender:profiles(*)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return (data || []) as Payout[];
    } catch (err) {
      console.warn(err);
    }
    return [];
  }

  return adminPayouts.filter((p) => p.status === "pending");
}

export async function markPayoutAsPaid(payoutId: string): Promise<boolean> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");
  const paidAt = new Date().toISOString();

  if (!isPlaceholder) {
    try {
      await supabase.from("payouts").update({ status: "paid", paid_at: paidAt }).eq("id", payoutId);
      return true;
    } catch (err) {
      console.warn(err);
    }
  }

  adminPayouts = adminPayouts.map((p) =>
    p.id === payoutId ? { ...p, status: "paid", paid_at: paidAt } : p
  );
  return true;
}

export async function fetchAllRentals(): Promise<Rental[]> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { data } = await supabase
        .from("rentals")
        .select("*, book:books(*), borrower:profiles!rentals_borrower_id_fkey(*), lender:profiles!rentals_lender_id_fkey(*)")
        .order("created_at", { ascending: false });
      return (data || []) as Rental[];
    } catch (err) {
      console.warn(err);
    }
    return [];
  }

  return adminRentals;
}

export async function fetchAdminSettings(): Promise<AppSettings> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { data } = await supabase.from("settings").select("key, value");
      if (data && data.length > 0) {
        const settings: Partial<AppSettings> = {};
        data.forEach((row: { key: string; value: string }) => {
          (settings as any)[row.key] = Number(row.value) || row.value;
        });
        return { ...DEFAULT_SETTINGS, ...settings } as AppSettings;
      }
    } catch (err) {
      console.warn(err);
    }
  }

  return adminSettings;
}

export async function updateAdminSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
  adminSettings = { ...adminSettings, ...newSettings };

  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const upserts = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: String(value),
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("settings").upsert(upserts, { onConflict: "key" });
    } catch (err) {
      console.warn(err);
    }
  }

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

