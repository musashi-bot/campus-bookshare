import { Rental, RentalStatus, Book, Payout } from "@/lib/types";
import { SEED_RENTALS, SEED_PAYOUTS, SEED_NOVELS, SEED_PROFILES } from "@/lib/db/seed-data";
import { createClient } from "@/lib/supabase/client";
import { calculateLateFee } from "@/lib/fees";

// Local in-memory session mutations for seamless testability
let localRentals: Rental[] = [...SEED_RENTALS];
let localPayouts: Payout[] = [...SEED_PAYOUTS];

export interface UserDashboardData {
  borrowed: Rental[];
  lent: Rental[];
  history: Rental[];
  listings: Book[];
  earnings: {
    totalEarned: number;
    pendingPayout: number;
  };
}

export async function fetchUserDashboardData(userId: string): Promise<UserDashboardData> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  let allUserRentals: Rental[] = [];
  let userListings: Book[] = [];
  let userPayouts: Payout[] = [];

  if (!isPlaceholder) {
    try {
      // 1. Fetch rentals where user is borrower OR lender
      const { data: rentalsData } = await supabase
        .from("rentals")
        .select("*, book:books(*), borrower:profiles!rentals_borrower_id_fkey(*), lender:profiles!rentals_lender_id_fkey(*)")
        .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (rentalsData) {
        allUserRentals = rentalsData as Rental[];
      }

      // 2. Fetch books listed by this user
      const { data: booksData } = await supabase
        .from("books")
        .select("*, owner:profiles(*)")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (booksData) {
        userListings = booksData as Book[];
      }

      // 3. Fetch payouts
      const { data: payoutsData } = await supabase
        .from("payouts")
        .select("*")
        .eq("lender_id", userId);

      if (payoutsData) {
        userPayouts = payoutsData as Payout[];
      }
    } catch (err) {
      console.warn("Supabase dashboard fetch fallback:", err);
    }
  }

  // Fallback to local session data if Supabase had no data or placeholder
  if (allUserRentals.length === 0) {
    allUserRentals = localRentals.filter(
      (r) => r.borrower_id === userId || r.lender_id === userId
    );

    // If still empty (e.g. newly signed up user or demo user Rahul), populate with Rahul's sample data
    if (allUserRentals.length === 0 && userId.includes("b0000000-0000-0000-0000-000000000002")) {
      allUserRentals = localRentals;
    }
  }

  if (userListings.length === 0) {
    userListings = SEED_NOVELS.filter((b) => b.owner_id === userId);
  }

  if (userPayouts.length === 0) {
    userPayouts = localPayouts.filter((p) => p.lender_id === userId);
  }

  // Update late fees automatically for active rentals if past due date
  allUserRentals = allUserRentals.map((rental) => {
    if (rental.status === "active" && rental.due_date) {
      const late = calculateLateFee(rental.due_date);
      if (late.daysOverdue > 0) {
        return {
          ...rental,
          status: "overdue" as RentalStatus,
          late_fee: late.lateFeeTotal,
        };
      }
    }
    return rental;
  });

  // Segregate into Borrowed, Lent, and History
  const activeStatusList = ["requested", "accepted", "payment_pending", "active", "overdue"];
  const historyStatusList = ["returned", "rejected", "cancelled"];

  const borrowed = allUserRentals.filter(
    (r) => r.borrower_id === userId && activeStatusList.includes(r.status)
  );

  const lent = allUserRentals.filter(
    (r) => r.lender_id === userId && activeStatusList.includes(r.status)
  );

  const history = allUserRentals.filter((r) => historyStatusList.includes(r.status));

  // Compute earnings
  const totalEarned = userPayouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingPayout = userPayouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    borrowed,
    lent,
    history,
    listings: userListings,
    earnings: {
      totalEarned,
      pendingPayout,
    },
  };
}

export async function fetchRentalById(rentalId: string): Promise<Rental | null> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { data } = await supabase
        .from("rentals")
        .select("*, book:books(*), borrower:profiles!rentals_borrower_id_fkey(*), lender:profiles!rentals_lender_id_fkey(*)")
        .eq("id", rentalId)
        .single();

      if (data) return data as Rental;
    } catch (err) {
      console.warn("Supabase rental by ID fallback:", err);
    }
  }

  const match = localRentals.find((r) => r.id === rentalId);
  return match || null;
}

export async function updateRentalStatus(
  rentalId: string,
  newStatus: RentalStatus,
  extraData: Partial<Rental> = {}
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const { error } = await supabase
        .from("rentals")
        .update({
          status: newStatus,
          ...extraData,
        })
        .eq("id", rentalId);

      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      console.warn("Update rental fallback:", err);
    }
  }

  // Update in local memory for interactive testing
  localRentals = localRentals.map((r) => {
    if (r.id === rentalId) {
      return {
        ...r,
        status: newStatus,
        ...extraData,
      };
    }
    return r;
  });

  return { success: true, error: null };
}

export async function submitUPIReference(
  rentalId: string,
  upiReference: string
): Promise<{ success: boolean; error: string | null }> {
  return updateRentalStatus(rentalId, "payment_pending", {
    upi_reference: upiReference.trim(),
    payment_status: "awaiting_confirmation",
  });
}

