"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Rental, RentalStatus } from "@/lib/types";
import { formatINR, formatDate, getDaysRemaining } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Calendar,
  Clock,
  Phone,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CreditCard,
  Star,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { updateRentalStatus } from "@/lib/db/rentals";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";

interface RentalCardProps {
  rental: Rental;
  viewMode: "borrowed" | "lent" | "history";
  onStatusChange?: () => void;
}

export function RentalCard({ rental, viewMode, onStatusChange }: RentalCardProps) {
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const book = rental.book;
  const otherPerson = viewMode === "borrowed" ? rental.lender : rental.borrower;

  const canShowLenderDetails = rental.payment_status === "paid";

  // Due date countdown logic
  const daysRemaining = rental.due_date ? getDaysRemaining(rental.due_date) : null;
  const isOverdue = rental.status === "overdue" || (daysRemaining !== null && daysRemaining < 0);

  const getStatusBadge = (status: RentalStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="teal">Active Rental</Badge>;
      case "accepted":
      case "payment_pending":
        return <Badge variant="amber">Payment Pending</Badge>;
      case "requested":
        return <Badge variant="neutral">Request Pending</Badge>;
      case "overdue":
        return <Badge variant="terracotta">Overdue</Badge>;
      case "returned":
        return <Badge variant="teal">Returned</Badge>;
      case "rejected":
        return <Badge variant="terracotta">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleLenderAction = async (newStatus: "accepted" | "rejected") => {
    setLoading(true);
    try {
      const { success, error } = await updateRentalStatus(rental.id, newStatus, {
        payment_status: newStatus === "accepted" ? "unpaid" : rental.payment_status,
      });

      if (success) {
        toast.success(`Request ${newStatus}!`);
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(error || "Action failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const coverUrl =
    book?.image_urls && book.image_urls.length > 0
      ? book.image_urls[0]
      : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";

  return (
    <Card className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border-paper-border hover:shadow-card-hover transition-all">
      {/* Book & Main Info */}
      <div className="flex items-start gap-3.5 flex-1">
        <Link
          href={`/books/${rental.book_id}`}
          className="relative w-16 h-22 sm:w-20 sm:h-26 rounded-xl overflow-hidden bg-paper-warm shrink-0 border border-paper-border group"
        >
          <img
            src={coverUrl}
            alt={book?.title || "Novel"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </Link>

        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(rental.status)}
            <span className="text-[11px] font-bold text-charcoal/50 uppercase">
              {rental.weeks} {rental.weeks === 1 ? "Week" : "Weeks"}
            </span>
          </div>

          <Link href={`/books/${rental.book_id}`}>
            <h3 className="font-heading font-bold text-base sm:text-lg text-ink hover:text-amber transition-colors line-clamp-1">
              {book?.title || "Novel Title"}
            </h3>
          </Link>
          <p className="text-xs text-charcoal/70">by {book?.author || "Author"}</p>

          {/* Other Person Contact Info */}
          {otherPerson && (viewMode !== "borrowed" || canShowLenderDetails) && (
            <div className="pt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal/70">
              <span className="flex items-center gap-1 font-semibold text-ink">
                <User className="w-3.5 h-3.5 text-charcoal/40" />
                <span>{viewMode === "borrowed" ? "Lender:" : "Borrower:"} {otherPerson.name}</span>
              </span>

              {otherPerson.phone && (
                <span className="flex items-center gap-1 text-teal font-bold bg-teal/10 px-2 py-0.5 rounded-lg text-[11px]">
                  <Phone className="w-3 h-3" />
                  <span>{otherPerson.phone}</span>
                </span>
              )}
            </div>
          )}
          {viewMode === "borrowed" && otherPerson && !canShowLenderDetails && (
            <p className="pt-1.5 text-[10px] text-charcoal/50 italic">
              Lender details will be shared once payment is verified.
            </p>
          )}
        </div>
      </div>

      {/* Due Date & Financials & Action Buttons */}
      <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-end justify-between md:justify-center w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-paper-border/60">
        {/* Due date countdown / Overdue note */}
        <div className="text-left sm:text-right space-y-0.5">
          {rental.status === "active" && rental.due_date && (
            <div>
              {daysRemaining !== null && daysRemaining >= 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink sm:justify-end">
                  <Clock className="w-3.5 h-3.5 text-amber" />
                  <span>
                    {daysRemaining === 0
                      ? "Due Today"
                      : `Due in ${daysRemaining} day${daysRemaining > 1 ? "s" : ""}`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-black text-terracotta sm:justify-end">
                  <AlertTriangle className="w-3.5 h-3.5 text-terracotta" />
                  <span>Overdue by {Math.abs(daysRemaining || 0)} days</span>
                </div>
              )}
              <span className="text-[11px] text-charcoal/50 block">
                Due: {formatDate(rental.due_date)}
              </span>
            </div>
          )}

          {rental.status === "overdue" && (
            <div className="text-right">
              <span className="text-xs font-black text-terracotta block">
                Accumulated Late Fee: {formatINR(rental.late_fee || 0)}
              </span>
            </div>
          )}

          {rental.status === "requested" && (
            <span className="text-xs text-charcoal/60 block">
              Requested {formatDate(rental.created_at)}
            </span>
          )}

          {rental.status === "returned" && (
            <span className="text-xs text-teal font-bold flex items-center gap-1 sm:justify-end">
              <CheckCircle className="w-3.5 h-3.5" /> Returned on {formatDate(rental.return_date || rental.created_at)}
            </span>
          )}

          <div className="text-[11px] text-charcoal/60">
            Total: <span className="font-bold text-ink">{formatINR(Number(rental.rent_amount) + Number(rental.platform_fee) + Number(rental.late_fee || 0))}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Lender Actions on "requested": Accept / Reject */}
          {viewMode === "lent" && rental.status === "requested" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="teal"
                onClick={() => handleLenderAction("accepted")}
                isLoading={loading}
                className="flex-1 sm:flex-initial"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Accept
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleLenderAction("rejected")}
                isLoading={loading}
                className="flex-1 sm:flex-initial"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
            </div>
          )}

          {/* Borrower Action: View Payment Instructions */}
          {viewMode === "borrowed" &&
            (rental.status === "accepted" || rental.status === "payment_pending") && (
              <Link href={`/rentals/${rental.id}/payment`} className="w-full sm:w-auto">
                <Button size="sm" variant="accent" className="w-full font-bold">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" /> View Payment Instructions
                </Button>
              </Link>
            )}

          {/* Review action if returned */}
          {rental.status === "returned" && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber hover:underline px-2 py-1 rounded-lg hover:bg-amber/10 transition"
            >
              <Star className="w-3.5 h-3.5 fill-amber" /> Leave a Review
            </button>
          )}
        </div>
      </div>

      {showReviewModal && (
        <ReviewDialog
          rentalId={rental.id}
          bookTitle={book?.title || "Novel"}
          revieweeName={otherPerson?.name || "Campus Peer"}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={onStatusChange}
        />
      )}
    </Card>
  );
}

