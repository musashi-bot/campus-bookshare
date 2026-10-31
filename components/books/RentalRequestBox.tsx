"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Book } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Calendar, ShieldCheck, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface RentalRequestBoxProps {
  book: Book;
  currentUserId?: string | null;
}

export function RentalRequestBox({ book, currentUserId }: RentalRequestBoxProps) {
  const router = useRouter();
  const [weeks, setWeeks] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const rentPerWeek = Number(book.rent_per_week);
  const platformFee = 10; // Flat INR 10
  const rentAmount = rentPerWeek * weeks;
  const totalAmount = rentAmount + platformFee;

  const isOwner = currentUserId && currentUserId === book.owner_id;
  const isAvailable = book.status === "available";

  const handleRequestRental = async () => {
    if (!currentUserId) {
      toast.info("Please log in to request this novel");
      router.push(`/login?redirect=/books/${book.id}`);
      return;
    }

    if (isOwner) {
      toast.error("You cannot rent your own novel!");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

      if (!isPlaceholder) {
        const { error } = await supabase.from("rentals").insert({
          book_id: book.id,
          borrower_id: currentUserId,
          lender_id: book.owner_id,
          weeks,
          rent_amount: rentAmount,
          platform_fee: platformFee,
          commission_amount: rentAmount * 0.1,
          status: "requested",
          payment_status: "unpaid",
        });

        if (error) {
          toast.error(error.message);
          return;
        }
      }

      toast.success(`Rental requested for ${weeks} week${weeks > 1 ? "s" : ""}!`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit rental request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6 space-y-5 bg-white border-paper-border shadow-soft sticky top-24">
      {/* Price Header */}
      <div className="flex items-baseline justify-between pb-4 border-b border-paper-border/70">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
            Weekly Rent
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-heading font-black text-2xl sm:text-3xl text-ink">
              {formatINR(rentPerWeek)}
            </span>
            <span className="text-xs text-charcoal/60 font-semibold">/ week</span>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
            isAvailable
              ? "bg-teal/15 text-teal border border-teal/20"
              : "bg-amber/20 text-[#A66E1D] border border-amber/30"
          }`}
        >
          {book.status}
        </span>
      </div>

      {/* Select Rental Duration */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-charcoal/80 flex items-center justify-between">
          <span>Rental Duration</span>
          <span className="text-amber font-bold">{weeks * 7} Days</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeeks(w)}
              className={`py-2 rounded-xl text-xs font-bold transition min-h-[40px] ${
                weeks === w
                  ? "bg-ink text-white shadow-sm"
                  : "bg-paper-warm hover:bg-paper-border/40 text-charcoal border border-paper-border"
              }`}
            >
              {w} {w === 1 ? "Wk" : "Wks"}
            </button>
          ))}
        </div>
      </div>

      {/* Price Breakdown Box */}
      <div className="p-3.5 bg-paper-warm/80 rounded-xl border border-paper-border space-y-2 text-xs">
        <div className="flex justify-between text-charcoal/80">
          <span>Rent ({weeks} {weeks === 1 ? "week" : "weeks"} × {formatINR(rentPerWeek)})</span>
          <span className="font-semibold text-ink">{formatINR(rentAmount)}</span>
        </div>
        <div className="flex justify-between text-charcoal/80">
          <span className="flex items-center gap-1">
            <span>Platform fee</span>
            <Info className="w-3 h-3 text-charcoal/40" />
          </span>
          <span className="font-semibold text-ink">{formatINR(platformFee)}</span>
        </div>
        <div className="pt-2 border-t border-paper-border flex justify-between font-bold text-sm text-ink">
          <span>Total Payable</span>
          <span className="text-amber font-heading font-black text-base">
            {formatINR(totalAmount)}
          </span>
        </div>
      </div>

      {/* Handover & Offline Note */}
      <div className="p-3 bg-amber/10 border border-amber/20 rounded-xl text-[11px] text-ink space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber shrink-0" />
          <span>Pay Offline via UPI or Cash</span>
        </p>
        <p className="text-charcoal/70 leading-relaxed">
          Pay at campus meetup. Admin confirms payment once verified.
        </p>
      </div>

      {/* Action Button */}
      {isOwner ? (
        <div className="p-3 bg-paper-warm border border-paper-border rounded-xl text-center space-y-1">
          <p className="text-xs font-bold text-ink flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber" />
            <span>This is your listing</span>
          </p>
          <p className="text-[11px] text-charcoal/60">
            You cannot borrow your own novel. Manage it from your rentals dashboard.
          </p>
        </div>
      ) : !isAvailable ? (
        <Button disabled variant="outline" size="lg" className="w-full min-h-[48px] opacity-60">
          Currently Rented Out
        </Button>
      ) : (
        <Button
          onClick={handleRequestRental}
          variant="accent"
          size="lg"
          className="w-full min-h-[48px] font-bold text-ink"
          isLoading={submitting}
        >
          Request to Rent ({formatINR(totalAmount)})
        </Button>
      )}
    </Card>
  );
}

