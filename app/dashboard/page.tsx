"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  Sparkles,
  BookMarked,
  ArrowRight,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile, Rental, Book } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { RentalCard } from "@/components/dashboard/RentalCard";
import { PremiumInterestBanner } from "@/components/dashboard/PremiumInterestBanner";
import { fetchUserDashboardData, UserDashboardData } from "@/lib/db/rentals";

type DashboardTab = "borrowed" | "lent" | "listings" | "history";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("borrowed");
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // If user is not logged in, use Rahul's demo profile for demonstration or redirect
      const userId = user ? user.id : "b0000000-0000-0000-0000-000000000002"; // Rahul Sharma default

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (prof) setProfile(prof);
      } else {
        setProfile({
          id: userId,
          name: "Rahul Sharma",
          email: "rahul@iitp.ac.in",
          phone: "+91 9822233344",
          college: "IIT Patna",
          role: "student",
          college_verified: true,
          created_at: new Date().toISOString(),
        });
      }

      const data = await fetchUserDashboardData(userId);
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6 w-full">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const borrowed = dashboardData?.borrowed || [];
  const lent = dashboardData?.lent || [];
  const listings = dashboardData?.listings || [];
  const history = dashboardData?.history || [];
  const earnings = dashboardData?.earnings || { totalEarned: 0, pendingPayout: 0 };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 w-full">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber block">
            Student Dashboard
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink">
            My Rentals & Book
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70">
            Welcome back, <span className="font-bold text-ink">{profile?.name}</span> ({profile?.college || "Campus"})
          </p>
        </div>

        <Link href="/books/new">
          <Button variant="accent" size="md" className="font-bold">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Lend Another Book
          </Button>
        </Link>
      </div>

      {/* Lender Earnings Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 flex items-center justify-between bg-white border-paper-border">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/60">
              Total Earned (Lending)
            </span>
            <div className="font-heading font-black text-2xl sm:text-3xl text-teal">
              {formatINR(earnings.totalEarned)}
            </div>
            <p className="text-[11px] text-charcoal/50">Direct offline payouts received</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal/15 text-teal flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between bg-white border-paper-border">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/60">
              Pending Payout
            </span>
            <div className="font-heading font-black text-2xl sm:text-3xl text-amber">
              {formatINR(earnings.pendingPayout)}
            </div>
            <p className="text-[11px] text-charcoal/50">Disbursed once admin confirms return</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber/15 text-amber flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between bg-white border-paper-border">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/60">
              My Listed Novels
            </span>
            <div className="font-heading font-black text-2xl sm:text-3xl text-ink">
              {listings.length}
            </div>
            <p className="text-[11px] text-charcoal/50">Books shared with campus peers</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ink/10 text-ink flex items-center justify-center shrink-0">
            <BookMarked className="w-6 h-6 text-ink" />
          </div>
        </Card>
      </div>

      {/* Campus BookShare Plus Validation Banner */}
      <PremiumInterestBanner userId={profile?.id} />

      {/* Tabs Navigation */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar border-b border-paper-border pb-1">
          <button
            onClick={() => setActiveTab("borrowed")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === "borrowed"
              ? "bg-ink text-white shadow-sm"
              : "text-charcoal/70 hover:bg-paper-warm"
              }`}
          >
            <span>Borrowed</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === "borrowed" ? "bg-amber text-ink" : "bg-paper-warm text-charcoal"
              }`}>
              {borrowed.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("lent")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === "lent"
              ? "bg-ink text-white shadow-sm"
              : "text-charcoal/70 hover:bg-paper-warm"
              }`}
          >
            <span>Lent (Requests)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === "lent" ? "bg-amber text-ink" : "bg-paper-warm text-charcoal"
              }`}>
              {lent.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === "listings"
              ? "bg-ink text-white shadow-sm"
              : "text-charcoal/70 hover:bg-paper-warm"
              }`}
          >
            <span>My Listings</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === "listings" ? "bg-amber text-ink" : "bg-paper-warm text-charcoal"
              }`}>
              {listings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === "history"
              ? "bg-ink text-white shadow-sm"
              : "text-charcoal/70 hover:bg-paper-warm"
              }`}
          >
            <span>History</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === "history" ? "bg-amber text-ink" : "bg-paper-warm text-charcoal"
              }`}>
              {history.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Borrowed */}
        {activeTab === "borrowed" && (
          <div className="space-y-3">
            {borrowed.length > 0 ? (
              borrowed.map((rental) => (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  viewMode="borrowed"
                  onStatusChange={loadData}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-border space-y-3 p-6">
                <BookOpen className="w-10 h-10 text-charcoal/30 mx-auto" />
                <h3 className="font-heading font-bold text-ink text-base">
                  No active borrowed books
                </h3>
                <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
                  Browse our campus catalog to discover bestsellers and request your next read.
                </p>
                <Link href="/">
                  <Button variant="accent" size="sm" className="font-bold">
                    Browse Campus Books
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Lent */}
        {activeTab === "lent" && (
          <div className="space-y-3">
            {lent.length > 0 ? (
              lent.map((rental) => (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  viewMode="lent"
                  onStatusChange={loadData}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-border space-y-3 p-6">
                <BookMarked className="w-10 h-10 text-charcoal/30 mx-auto" />
                <h3 className="font-heading font-bold text-ink text-base">
                  No active lending requests
                </h3>
                <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
                  When other students on campus request to rent your books, they will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Listings */}
        {activeTab === "listings" && (
          <div className="space-y-3">
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((book) => {
                  const cover =
                    book.image_urls && book.image_urls.length > 0
                      ? book.image_urls[0]
                      : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";
                  return (
                    <Card
                      key={book.id}
                      className="p-4 bg-white border-paper-border flex gap-3.5 items-center hover:shadow-card-hover transition"
                    >
                      <img
                        src={cover}
                        alt=""
                        className="w-16 h-22 object-cover rounded-xl border border-paper-border shrink-0"
                      />
                      <div className="space-y-1 flex-1 overflow-hidden">
                        <Badge
                          variant={book.status === "available" ? "teal" : book.status === "rented" ? "amber" : "neutral"}
                          size="sm"
                          className="uppercase font-bold"
                        >
                          {book.status}
                        </Badge>
                        <h4 className="font-heading font-bold text-sm text-ink truncate">
                          {book.title}
                        </h4>
                        <p className="text-xs text-charcoal/60 truncate">by {book.author}</p>
                        <p className="text-xs font-bold text-amber">
                          {formatINR(book.rent_per_week)} / wk
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-border space-y-3 p-6">
                <BookOpen className="w-10 h-10 text-charcoal/30 mx-auto" />
                <h3 className="font-heading font-bold text-ink text-base">
                  You haven't listed any books yet
                </h3>
                <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
                  Earn pocket money by sharing books already on your bookshelf.
                </p>
                <Link href="/books/new">
                  <Button variant="accent" size="sm" className="font-bold">
                    Lend Your First Book
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: History */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((rental) => (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  viewMode="history"
                  onStatusChange={loadData}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-border space-y-2 p-6">
                <History className="w-10 h-10 text-charcoal/30 mx-auto" />
                <h3 className="font-heading font-bold text-ink text-base">
                  No rental history yet
                </h3>
                <p className="text-xs text-charcoal/60">
                  Completed returns and past rentals will be archived here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

