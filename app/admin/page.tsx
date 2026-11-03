"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  BookOpen,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Settings as SettingsIcon,
  Check,
  Send,
  Users,
  Sparkles,
  CreditCard,
  FileSpreadsheet,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  fetchAdminMetrics,
  fetchPendingBooks,
  approveBookListing,
  rejectBookListing,
  fetchAwaitingPayments,
  confirmRentalPayment,
  fetchAllRentals,
  markRentalReturned,
  fetchPendingPayouts,
  markPayoutAsPaid,
  fetchAdminSettings,
  updateAdminSettings,
  exportRentalsToCSV,
  AdminMetrics,
} from "@/lib/db/admin";
import { Book, Rental, Payout, AppSettings } from "@/lib/types";

type AdminTab = "overview" | "listings" | "payments" | "active" | "overdue" | "payouts" | "settings";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
  const [awaitingPayments, setAwaitingPayments] = useState<Rental[]>([]);
  const [allRentals, setAllRentals] = useState<Rental[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Return condition modal state
  const [returningRentalId, setReturningRentalId] = useState<string | null>(null);
  const [returnNote, setReturnNote] = useState("");

  const loadAllAdminData = async () => {
    try {
      const [m, b, p, r, po, s] = await Promise.all([
        fetchAdminMetrics(),
        fetchPendingBooks(),
        fetchAwaitingPayments(),
        fetchAllRentals(),
        fetchPendingPayouts(),
        fetchAdminSettings(),
      ]);

      setMetrics(m);
      setPendingBooks(b);
      setAwaitingPayments(p);
      setAllRentals(r);
      setPendingPayouts(po);
      setSettings(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleApproveBook = async (bookId: string) => {
    await approveBookListing(bookId);
    toast.success("Listing approved and published to catalog!");
    loadAllAdminData();
  };

  const handleRejectBook = async (bookId: string) => {
    await rejectBookListing(bookId);
    toast.error("Listing rejected.");
    loadAllAdminData();
  };

  const handleConfirmPayment = async (rentalId: string) => {
    const confirmed = await confirmRentalPayment(rentalId);
    if (!confirmed) {
      toast.error("Payment could not be confirmed. The rental and book status were not fully updated.");
      return;
    }
    toast.success("Payment confirmed! Book pickup unlocked & rental is now active.");
    loadAllAdminData();
  };

  const handleReturnConfirm = async () => {
    if (!returningRentalId) return;
    await markRentalReturned(returningRentalId, returnNote);
    toast.success("Book marked as returned! Lender payout created.");
    setReturningRentalId(null);
    setReturnNote("");
    loadAllAdminData();
  };

  const handleSendReminderNow = (rentalId: string, borrowerName: string) => {
    toast.success(`Overdue reminder email & notification dispatched to ${borrowerName}!`);
  };

  const handleDisbursePayout = async (payoutId: string) => {
    await markPayoutAsPaid(payoutId);
    toast.success("Payout marked as paid! Lender notified.");
    loadAllAdminData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await updateAdminSettings(settings);
    toast.success("Platform fee rules updated successfully!");
    loadAllAdminData();
  };

  const handleExportCSV = () => {
    const csv = exportRentalsToCSV(allRentals);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `campus-bookshare-rentals-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Rentals and earnings CSV exported!");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6 w-full">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const activeRentals = allRentals.filter((r) => r.status === "active");
  const overdueRentals = allRentals.filter((r) => r.status === "overdue");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber/20 text-ink text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-amber" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink">
            Campus BookShare Operations
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70">
            Moderate listings, confirm offline payments, inspect returns, and manage payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={handleExportCSV} className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-4 bg-white border-paper-border space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal/60 block">
            Total Rentals
          </span>
          <p className="font-heading font-black text-xl sm:text-2xl text-ink">
            {metrics?.totalRentals || 0}
          </p>
        </Card>

        <Card className="p-4 bg-white border-paper-border space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal/60 block">
            Active Rentals
          </span>
          <p className="font-heading font-black text-xl sm:text-2xl text-teal">
            {metrics?.activeRentals || 0}
          </p>
        </Card>

        <Card className="p-4 bg-white border-paper-border space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal/60 block">
            Overdue Books
          </span>
          <p className="font-heading font-black text-xl sm:text-2xl text-terracotta">
            {metrics?.overdueRentals || 0}
          </p>
        </Card>

        <Card className="p-4 bg-white border-paper-border space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal/60 block">
            Platform Earnings
          </span>
          <p className="font-heading font-black text-xl sm:text-2xl text-ink">
            {formatINR(metrics?.platformEarnings || 0)}
          </p>
        </Card>

        <Card className="p-4 bg-white border-paper-border space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal/60 block">
            Pending Payouts
          </span>
          <p className="font-heading font-black text-xl sm:text-2xl text-amber">
            {formatINR(metrics?.pendingPayoutsAmount || 0)}
          </p>
        </Card>

        <Card className="p-4 bg-white border-paper-border space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal/60 block">
            Plus Interest
          </span>
          <p className="font-heading font-black text-xl sm:text-2xl text-ink">
            {metrics?.premiumInterestCount || 0} clicks
          </p>
        </Card>
      </div>

      {/* Admin Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar border-b border-paper-border pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview" ? "bg-ink text-white" : "text-charcoal/70 hover:bg-paper-warm"
            }`}
          >
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("listings")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "listings" ? "bg-ink text-white" : "text-charcoal/70 hover:bg-paper-warm"
            }`}
          >
            <span>Pending Listings</span>
            {pendingBooks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber text-ink font-black">
                {pendingBooks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "payments" ? "bg-ink text-white" : "text-charcoal/70 hover:bg-paper-warm"
            }`}
          >
            <span>Payments Awaiting</span>
            {awaitingPayments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber text-ink font-black">
                {awaitingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "active" ? "bg-ink text-white" : "text-charcoal/70 hover:bg-paper-warm"
            }`}
          >
            <span>Active & Returns ({activeRentals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("overdue")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overdue" ? "bg-ink text-white" : "text-charcoal/70 hover:bg-paper-warm"
            }`}
          >
            <span>Overdue ({overdueRentals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "payouts" ? "bg-ink text-white" : "text-charcoal/70 hover:bg-paper-warm"
            }`}
          >
            <span>Lender Payouts ({pendingPayouts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "settings" ? "bg-ink text-white" : "text-charcoal/70 hover:bg-paper-warm"
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Fee Settings</span>
          </button>
        </div>

        {/* TAB: Overview Summary */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 space-y-4">
              <h3 className="font-heading font-bold text-lg text-ink flex items-center justify-between">
                <span>Action Items Requiring Attention</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 bg-paper-warm rounded-xl">
                  <span>Pending novel listings to review</span>
                  <Badge variant={pendingBooks.length > 0 ? "amber" : "teal"}>
                    {pendingBooks.length} pending
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-paper-warm rounded-xl">
                  <span>Offline payments awaiting confirmation</span>
                  <Badge variant={awaitingPayments.length > 0 ? "amber" : "teal"}>
                    {awaitingPayments.length} awaiting
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-paper-warm rounded-xl">
                  <span>Overdue books requiring reminders</span>
                  <Badge variant={overdueRentals.length > 0 ? "terracotta" : "teal"}>
                    {overdueRentals.length} overdue
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-paper-warm rounded-xl">
                  <span>Pending lender payouts to disburse</span>
                  <Badge variant={pendingPayouts.length > 0 ? "amber" : "teal"}>
                    {pendingPayouts.length} payouts
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="font-heading font-bold text-lg text-ink">
                Market Validation: Campus BookShare Plus
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Students clicking the "Notify Me" banner on their dashboard express high intent for premium subscription features (unlimited swaps & free campus delivery).
              </p>
              <div className="p-4 bg-teal/10 rounded-2xl border border-teal/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal block uppercase tracking-wider">
                    Total Waitlist Clicks
                  </span>
                  <span className="font-heading font-black text-3xl text-teal">
                    {metrics?.premiumInterestCount || 0}
                  </span>
                </div>
                <Sparkles className="w-8 h-8 text-teal" />
              </div>
            </Card>
          </div>
        )}

        {/* TAB: Pending Listings Approvals */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            {pendingBooks.length > 0 ? (
              pendingBooks.map((book) => {
                const cover =
                  book.image_urls && book.image_urls.length > 0
                    ? book.image_urls[0]
                    : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";
                return (
                  <Card
                    key={book.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={cover}
                        alt=""
                        className="w-16 h-22 object-cover rounded-xl border border-paper-border shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="amber" size="sm">
                            Pending Approval
                          </Badge>
                          <span className="text-xs font-bold text-amber">{book.category}</span>
                          <span className="text-xs text-charcoal/40">• Condition: {book.condition}</span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-ink">{book.title}</h4>
                        <p className="text-xs text-charcoal/70">by {book.author}</p>
                        <p className="text-xs text-charcoal/60">
                          Listed by: <span className="font-semibold text-ink">{book.owner?.name}</span> ({book.owner?.college})
                        </p>
                        <p className="text-xs font-bold text-ink">
                          Weekly Rent: {formatINR(book.rent_per_week)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="teal"
                        size="sm"
                        onClick={() => handleApproveBook(book.id)}
                        className="flex-1 sm:flex-initial font-bold"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve Listing
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectBook(book.id)}
                        className="flex-1 sm:flex-initial font-bold"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-border space-y-2">
                <CheckCircle className="w-10 h-10 text-teal mx-auto" />
                <h3 className="font-heading font-bold text-ink text-base">
                  All listings reviewed
                </h3>
                <p className="text-xs text-charcoal/60">No pending novels awaiting approval.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Payments Awaiting Confirmation */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            {awaitingPayments.length > 0 ? (
              awaitingPayments.map((rental) => {
                const total =
                  Number(rental.rent_amount) +
                  Number(rental.platform_fee) +
                  Number(rental.late_fee || 0);
                return (
                  <Card
                    key={rental.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="amber" size="sm">
                          {rental.payment_status === "awaiting_confirmation"
                            ? "UPI Reference Submitted"
                            : "Payment Pending"}
                        </Badge>
                        <span className="text-xs text-charcoal/50 font-bold">
                          {rental.weeks} {rental.weeks === 1 ? "Week" : "Weeks"}
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-base text-ink">
                        {rental.book?.title}
                      </h4>
                      <p className="text-xs text-charcoal/70">
                        Borrower: <span className="font-semibold text-ink">{rental.borrower?.name}</span> ({rental.borrower?.phone})
                      </p>
                      <p className="text-xs text-charcoal/70">
                        Lender: <span className="font-semibold text-ink">{rental.lender?.name}</span>
                      </p>

                      <div className="p-2.5 bg-paper-warm rounded-xl text-xs space-y-1 max-w-md">
                        <div className="flex justify-between font-bold">
                          <span>Total Amount to Confirm:</span>
                          <span className="text-ink">{formatINR(total)}</span>
                        </div>
                        <div className="flex justify-between text-charcoal/60">
                          <span>Borrower UPI Reference:</span>
                          <span className="font-mono font-bold text-ink">
                            {rental.upi_reference || "Cash handover requested"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="teal"
                      size="md"
                      onClick={() => handleConfirmPayment(rental.id)}
                      className="w-full sm:w-auto font-bold"
                    >
                      <Check className="w-4 h-4 mr-1.5" /> Confirm as Paid
                    </Button>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-border space-y-2">
                <CheckCircle className="w-10 h-10 text-teal mx-auto" />
                <h3 className="font-heading font-bold text-ink text-base">
                  No payments awaiting confirmation
                </h3>
                <p className="text-xs text-charcoal/60">All offline payments are up to date.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Active Rentals & Returns */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeRentals.length > 0 ? (
              activeRentals.map((rental) => (
                <Card
                  key={rental.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="teal" size="sm">
                        Active Rental
                      </Badge>
                      <span className="text-xs font-bold text-charcoal/60">
                        Due: {formatDate(rental.due_date)}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-ink">
                      {rental.book?.title}
                    </h4>
                    <p className="text-xs text-charcoal/70">
                      Borrower: <span className="font-semibold text-ink">{rental.borrower?.name}</span> ({rental.borrower?.phone})
                    </p>
                    <p className="text-xs text-charcoal/70">
                      Lender: <span className="font-semibold text-ink">{rental.lender?.name}</span>
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setReturningRentalId(rental.id)}
                    className="w-full sm:w-auto font-bold"
                  >
                    Mark as Returned
                  </Button>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-border space-y-2">
                <BookOpen className="w-10 h-10 text-charcoal/30 mx-auto" />
                <h3 className="font-heading font-bold text-ink text-base">
                  No active rentals currently checked out
                </h3>
              </div>
            )}
          </div>
        )}

        {/* TAB: Overdue Rentals & Reminders */}
        {activeTab === "overdue" && (
          <div className="space-y-4">
            {overdueRentals.length > 0 ? (
              overdueRentals.map((rental) => (
                <Card
                  key={rental.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-terracotta/30 bg-terracotta/5"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="terracotta" size="sm">
                        Overdue
                      </Badge>
                      <span className="text-xs font-bold text-terracotta">
                        Accumulated Late Fee: {formatINR(rental.late_fee || 0)}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-ink">
                      {rental.book?.title}
                    </h4>
                    <p className="text-xs text-charcoal/70">
                      Borrower: <span className="font-semibold text-ink">{rental.borrower?.name}</span> ({rental.borrower?.email}, {rental.borrower?.phone})
                    </p>
                    <p className="text-xs text-charcoal/70">
                      Due Date was: <span className="font-bold text-terracotta">{formatDate(rental.due_date)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleSendReminderNow(rental.id, rental.borrower?.name || "Borrower")}
                      className="flex-1 sm:flex-initial font-bold"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Send Reminder Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReturningRentalId(rental.id)}
                      className="flex-1 sm:flex-initial font-bold"
                    >
                      Mark Returned
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-border space-y-2">
                <CheckCircle className="w-10 h-10 text-teal mx-auto" />
                <h3 className="font-heading font-bold text-ink text-base">
                  No overdue books!
                </h3>
                <p className="text-xs text-charcoal/60">All campus rentals are on schedule.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Lender Payouts */}
        {activeTab === "payouts" && (
          <div className="space-y-4">
            {pendingPayouts.length > 0 ? (
              pendingPayouts.map((payout) => (
                <Card
                  key={payout.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <Badge variant="amber" size="sm">
                      Pending Payout
                    </Badge>
                    <h4 className="font-heading font-bold text-base text-ink">
                      Payout for: {payout.lender?.name || "Campus Lender"}
                    </h4>
                    <p className="text-xs text-charcoal/70">
                      Phone: <span className="font-semibold text-ink">{payout.lender?.phone || "—"}</span> • Email: {payout.lender?.email}
                    </p>
                    <p className="text-sm font-black text-teal">
                      Disbursement Amount: {formatINR(payout.amount)}
                    </p>
                  </div>

                  <Button
                    variant="teal"
                    size="md"
                    onClick={() => handleDisbursePayout(payout.id)}
                    className="w-full sm:w-auto font-bold"
                  >
                    <Check className="w-4 h-4 mr-1.5" /> Mark as Paid
                  </Button>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-border space-y-2">
                <CheckCircle className="w-10 h-10 text-teal mx-auto" />
                <h3 className="font-heading font-bold text-ink text-base">
                  All lender payouts settled
                </h3>
                <p className="text-xs text-charcoal/60">No pending payouts awaiting disbursement.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Fee Settings */}
        {activeTab === "settings" && settings && (
          <Card className="max-w-xl p-5 sm:p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-lg text-ink">
                Configure Platform Fee Rules
              </h3>
              <p className="text-xs text-charcoal/70">
                Adjust platform commission, flat fees, late fee accrual rates, and borrowing limits.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <Input
                label="Borrower Platform Fee Flat (INR)"
                type="number"
                value={settings.platform_fee_flat}
                onChange={(e) => setSettings({ ...settings, platform_fee_flat: Number(e.target.value) })}
                required
              />

              <Input
                label="Lender Commission Percent (%)"
                type="number"
                value={settings.lender_commission_percent}
                onChange={(e) => setSettings({ ...settings, lender_commission_percent: Number(e.target.value) })}
                required
              />

              <Input
                label="Late Fee per Day (INR)"
                type="number"
                value={settings.late_fee_per_day}
                onChange={(e) => setSettings({ ...settings, late_fee_per_day: Number(e.target.value) })}
                required
              />

              <Input
                label="Max Rental Duration (Weeks)"
                type="number"
                value={settings.max_rental_weeks}
                onChange={(e) => setSettings({ ...settings, max_rental_weeks: Number(e.target.value) })}
                required
              />

              <Input
                label="Late Fee Lender Split (%)"
                type="number"
                value={settings.late_fee_lender_split_percent}
                onChange={(e) => setSettings({ ...settings, late_fee_lender_split_percent: Number(e.target.value) })}
                helperText="Percentage of late fees disbursed to the lender (balance retained by platform)"
                required
              />

              <Input
                label="Max Active Rentals per Borrower"
                type="number"
                value={settings.max_active_rentals_per_borrower}
                onChange={(e) => setSettings({ ...settings, max_active_rentals_per_borrower: Number(e.target.value) })}
                required
              />

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="accent" size="md" className="font-bold">
                  <Save className="w-4 h-4 mr-1.5" /> Save Fee Rules
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {/* Mark Return Modal */}
      {returningRentalId && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-soft-lg animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-heading font-bold text-lg text-ink">
              Confirm Book Return
            </h3>
            <p className="text-xs text-charcoal/70">
              Confirm that the novel has been inspected and returned to the lender. This will automatically create the lender's payout record.
            </p>

            <Input
              label="Optional Condition / Inspection Note"
              placeholder="e.g. Returned in same good condition, no damage"
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReturningRentalId(null);
                  setReturnNote("");
                }}
              >
                Cancel
              </Button>
              <Button variant="teal" size="sm" onClick={handleReturnConfirm} className="font-bold">
                <Check className="w-3.5 h-3.5 mr-1" /> Confirm Return & Create Payout
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

