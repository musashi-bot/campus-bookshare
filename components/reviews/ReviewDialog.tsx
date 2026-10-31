"use client";

import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface ReviewDialogProps {
  rentalId: string;
  bookTitle: string;
  revieweeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ReviewDialog({
  rentalId,
  bookTitle,
  revieweeName,
  isOpen,
  onClose,
  onSubmitted,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabase = createClient();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

      if (!isPlaceholder) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("reviews").insert({
            rental_id: rentalId,
            reviewer_id: user.id,
            rating,
            comment: comment.trim(),
          });
        }
      }

      toast.success("Thank you! Your review has been published.");
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 space-y-5 bg-white shadow-soft-lg animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-paper-border">
          <div>
            <h3 className="font-heading font-black text-lg text-ink">
              Leave a Campus Review
            </h3>
            <p className="text-xs text-charcoal/60">
              For "{bookTitle}" returned to {revieweeName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal/40 hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star selector */}
          <div className="space-y-1.5 text-center py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70 block">
              Rate your exchange experience
            </span>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-amber text-amber"
                        : "text-paper-border"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber">
              {rating === 5
                ? "5 Stars - Excellent condition & smooth exchange!"
                : rating === 4
                ? "4 Stars - Great book and prompt handover"
                : rating === 3
                ? "3 Stars - Good, as expected"
                : "Fair experience"}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80">
              Written Comments (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="How was the book condition? Was the handover easy to coordinate on campus?..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-paper-border bg-white text-charcoal text-xs sm:text-sm focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-paper-border">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="md"
              type="submit"
              isLoading={submitting}
              className="font-bold"
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

