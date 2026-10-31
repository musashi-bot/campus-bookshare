"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Rental } from "@/lib/types";
import { fetchRentalById, submitUPIReference } from "@/lib/db/rentals";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PaymentInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const rentalId = params.id as string;

  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [upiRef, setUpiRef] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "campusshare@oksbi";

  useEffect(() => {
    async function loadRental() {
      try {
        const data = await fetchRentalById(rentalId);
        if (data) {
          setRental(data);
          if (data.upi_reference) setUpiRef(data.upi_reference);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRental();
  }, [rentalId]);

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiRef.trim()) {
      toast.error("Please enter your UPI transaction reference ID / UTR number");
      return;
    }

    setSubmitting(true);
    try {
      const { success, error } = await submitUPIReference(rentalId, upiRef);
      if (success) {
        toast.success("UPI reference submitted! Admin will confirm your payment.");
        router.push("/dashboard");
      } else {
        toast.error(error || "Failed to submit reference");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit reference");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-ink">Rental Not Found</h2>
        <Link href="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const totalPayable =
    Number(rental.rent_amount) +
    Number(rental.platform_fee) +
    Number(rental.late_fee || 0);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-12 w-full space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-charcoal/70 hover:text-ink transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Rentals</span>
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/15 text-amber text-xs font-bold border border-amber/30">
          <Clock className="w-3.5 h-3.5" />
          <span>Payment Required</span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink">
          Offline Payment Instructions
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70">
          Your rental request for <span className="font-bold text-ink">"{rental.book?.title}"</span> has been accepted by the lender.
        </p>
      </div>

      <Card className="p-5 sm:p-8 space-y-6">
        {/* Total Amount Box */}
        <div className="p-4 bg-paper-warm rounded-2xl border border-paper-border flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/60">
              Total Amount Due
            </span>
            <p className="text-xs text-charcoal/70">
              {rental.weeks} {rental.weeks === 1 ? "Week" : "Weeks"} Rental + Platform Fee
            </p>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-ink">
            {formatINR(totalPayable)}
          </span>
        </div>

        {/* UPI QR & ID */}
        <div className="text-center space-y-4 py-2">
          <div className="w-48 h-48 mx-auto p-2 bg-white rounded-2xl border-2 border-paper-border shadow-soft flex items-center justify-center">
            <img
              src="/upi-qr.png"
              alt="Campus UPI QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-2 max-w-xs mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70 block">
              Platform UPI ID
            </span>
            <div className="flex items-center justify-between p-2.5 bg-paper-warm rounded-xl border border-paper-border text-xs">
              <span className="font-mono font-bold text-ink">{upiId}</span>
              <button
                type="button"
                onClick={copyUpiId}
                className="p-1 text-charcoal/60 hover:text-ink transition"
                title="Copy UPI ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-teal" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Official Instruction Text */}
        <div className="p-4 rounded-2xl bg-teal/10 border border-teal/20 space-y-1.5 text-xs text-charcoal/80">
          <div className="flex items-center gap-1.5 font-bold text-teal">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Campus Handover Guarantee</span>
          </div>
          <p className="leading-relaxed">
            "Pay via UPI or cash at the campus handover point. Your pickup unlocks once the admin confirms payment."
          </p>
        </div>

        {/* Submit Reference Form */}
        <form onSubmit={handleSubmitReference} className="space-y-3 pt-2 border-t border-paper-border">
          <Input
            label="UPI Transaction Reference / UTR Number"
            placeholder="e.g. 234589123456 or last 6 digits"
            value={upiRef}
            onChange={(e) => setUpiRef(e.target.value)}
            helperText="Entering your reference ID speeds up manual admin verification."
            required
          />

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full min-h-[48px] font-bold"
            isLoading={submitting}
          >
            Submit Payment Reference
          </Button>
        </form>

        {/* Lender Contact Preview */}
        {rental.lender && (
          <div className="p-3.5 bg-paper-warm/60 rounded-xl border border-paper-border text-xs text-charcoal/70 space-y-1">
            <span className="font-bold text-ink block">Lender Contact Coordination</span>
            <p>
              Lender: <span className="font-semibold text-ink">{rental.lender.name}</span> ({rental.lender.college || "Campus"})
            </p>
            {rental.lender.phone && (
              <p>
                Phone: <span className="font-semibold text-ink">{rental.lender.phone}</span>
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

