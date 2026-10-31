import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateLateFee } from "@/lib/fees";
import {
  sendEmail,
  templateDueIn2Days,
  templateDueToday,
  templateOverdue,
  templateLenderOverdueAlert,
} from "@/lib/email";
import { SEED_RENTALS } from "@/lib/db/seed-data";

export async function GET(request: Request) {
  // 1. Verify CRON_SECRET authorization header
  const authHeader = request.headers.get("authorization") || request.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET || "campus_share_cron_secret_2026";

  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token || token !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized: Invalid CRON_SECRET" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  let rentalsToProcess: any[] = [];
  const results = {
    processed: 0,
    sentDueIn2Days: 0,
    sentDueToday: 0,
    sentOverdue: 0,
    errors: [] as string[],
  };

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

    if (!isPlaceholder) {
      const { data, error } = await supabase
        .from("rentals")
        .select("*, book:books(*), borrower:profiles!rentals_borrower_id_fkey(*), lender:profiles!rentals_lender_id_fkey(*)")
        .in("status", ["active", "overdue"]);

      if (!error && data) {
        rentalsToProcess = data;
      }
    } else {
      // Local demo fallback
      rentalsToProcess = SEED_RENTALS.filter((r) => ["active", "overdue"].includes(r.status));
    }

    for (const rental of rentalsToProcess) {
      if (!rental.due_date) continue;

      results.processed++;
      const dueDate = new Date(rental.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const borrowerEmail = rental.borrower?.email || "student@campus.edu";
      const borrowerName = rental.borrower?.name || "Student";
      const lenderEmail = rental.lender?.email || "lender@campus.edu";
      const lenderName = rental.lender?.name || "Lender";
      const bookTitle = rental.book?.title || "Novel";

      // CASE 1: Due in 2 days
      if (diffDays === 2) {
        await sendEmail({
          to: borrowerEmail,
          subject: `Reminder: "${bookTitle}" is due in 2 days - Campus BookShare`,
          html: templateDueIn2Days(borrowerName, bookTitle, rental.due_date),
        });
        results.sentDueIn2Days++;
      }

      // CASE 2: Due today
      else if (diffDays === 0) {
        await sendEmail({
          to: borrowerEmail,
          subject: `Action Required: "${bookTitle}" is due TODAY - Campus BookShare`,
          html: templateDueToday(borrowerName, bookTitle),
        });
        results.sentDueToday++;
      }

      // CASE 3: Overdue (today > due_date)
      else if (diffDays < 0) {
        const late = calculateLateFee(rental.due_date, today);
        const totalDue =
          Number(rental.rent_amount) +
          Number(rental.platform_fee) +
          late.lateFeeTotal;

        // Send overdue reminder to borrower
        await sendEmail({
          to: borrowerEmail,
          subject: `URGENT: "${bookTitle}" is OVERDUE - Campus BookShare`,
          html: templateOverdue(borrowerName, bookTitle, late.lateFeeTotal, totalDue),
        });

        // Also send notice to lender
        await sendEmail({
          to: lenderEmail,
          subject: `Overdue Notice: Your novel "${bookTitle}" is overdue - Campus BookShare`,
          html: templateLenderOverdueAlert(lenderName, borrowerName, bookTitle),
        });

        results.sentOverdue++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

