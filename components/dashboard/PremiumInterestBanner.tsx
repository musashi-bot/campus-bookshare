"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface PremiumInterestBannerProps {
  userId?: string | null;
}

export function PremiumInterestBanner({ userId }: PremiumInterestBannerProps) {
  const [interested, setInterested] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNotifyMe = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

      if (!isPlaceholder) {
        await supabase.from("premium_interest").insert({
          user_id: userId || null,
        });
      }

      setInterested(true);
      toast.success("Thanks for your interest! We'll notify you as soon as Campus BookShare Plus launches.");
    } catch (err: any) {
      toast.error(err.message || "Failed to record interest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink via-ink-light to-ink p-5 sm:p-6 text-white shadow-soft">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber/20 text-amber text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus BookShare Plus • Coming Soon</span>
          </div>
          <h3 className="font-heading font-black text-lg sm:text-xl">
            Unlimited novel swaps & free campus delivery
          </h3>
          <p className="text-xs text-white/80 leading-relaxed">
            Get unlimited reading credits, waived platform fees, and doorstep dorm deliveries for ₹149/month.
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          {interested ? (
            <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal/20 border border-teal/40 text-teal-light text-xs font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-teal" />
              <span>You're on the priority waitlist!</span>
            </div>
          ) : (
            <Button
              onClick={handleNotifyMe}
              variant="accent"
              size="md"
              isLoading={loading}
              className="w-full sm:w-auto font-bold"
            >
              Notify Me <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

