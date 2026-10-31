import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchBookById } from "@/lib/db/books";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CollegeBadge } from "@/components/auth/CollegeBadge";
import { RentalRequestBox } from "@/components/books/RentalRequestBox";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
} from "lucide-react";

interface BookDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function BookDetailsPage({ params }: BookDetailsPageProps) {
  const book = await fetchBookById(params.id);

  if (!book) {
    notFound();
  }

  // Get current user session if available
  let currentUserId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) currentUserId = user.id;
  } catch {
    // ignore
  }

  const coverUrl =
    book.image_urls && book.image_urls.length > 0
      ? book.image_urls[0]
      : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";

  const conditionVariant =
    book.condition === "New"
      ? "teal"
      : book.condition === "Good"
      ? "neutral"
      : "amber";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 w-full">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-charcoal/70">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 hover:text-ink font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
        <span className="text-charcoal/30">/</span>
        <span className="text-charcoal/60 truncate max-w-[200px]">{book.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cover Image & Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-3xl overflow-hidden bg-paper-warm border border-paper-border shadow-soft">
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-3 left-3">
              <Badge variant={conditionVariant} size="md" className="shadow-sm">
                Condition: {book.condition}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Badge
                variant={book.status === "available" ? "teal" : "amber"}
                size="md"
                className="shadow-sm uppercase font-bold"
              >
                {book.status}
              </Badge>
            </div>
          </div>

          {/* Multiple Photos Thumbnails (if any) */}
          {book.image_urls && book.image_urls.length > 1 && (
            <div className="flex items-center gap-2 justify-center max-w-md mx-auto">
              {book.image_urls.map((img, idx) => (
                <div
                  key={idx}
                  className="w-16 h-20 rounded-xl overflow-hidden border-2 border-amber shadow-sm cursor-pointer"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Handover Safety Checklist */}
          <div className="max-w-md mx-auto p-4 bg-paper-warm/70 rounded-2xl border border-paper-border space-y-2 text-xs">
            <span className="font-bold text-ink flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal" /> Campus Handover Guarantee
            </span>
            <ul className="space-y-1 text-charcoal/70 list-disc list-inside">
              <li>Inspect condition before confirming handover</li>
              <li>Lenders never hand books to strangers without admin confirmation</li>
              <li>Returns are tracked and verified by admin</li>
            </ul>
          </div>
        </div>

        {/* Center & Right Column: Book Info & Rental Box (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Info */}
          <div className="space-y-2 pb-5 border-b border-paper-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber">
                {book.category}
              </span>
              {book.edition && (
                <>
                  <span className="text-charcoal/30">•</span>
                  <span className="text-xs text-charcoal/60 font-medium">
                    {book.edition}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-ink leading-tight">
              {book.title}
            </h1>
            <p className="text-sm sm:text-base text-charcoal/80 font-medium">
              by <span className="text-ink font-bold">{book.author}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Details Block (7 cols) */}
            <div className="md:col-span-7 space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
                  Lender's Note & Synopsis
                </h3>
                <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
                  {book.description || "No specific lender notes provided for this copy."}
                </p>
              </div>

              {/* Book Specs Card */}
              <div className="p-4 bg-white rounded-2xl border border-paper-border grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-charcoal/50 block text-[11px] uppercase font-bold">
                    Genre
                  </span>
                  <span className="font-bold text-ink">{book.category}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[11px] uppercase font-bold">
                    Physical State
                  </span>
                  <span className="font-bold text-ink">{book.condition} Condition</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[11px] uppercase font-bold">
                    Edition / Publisher
                  </span>
                  <span className="font-bold text-ink">{book.edition || "Standard"}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[11px] uppercase font-bold">
                    Max Duration
                  </span>
                  <span className="font-bold text-ink">4 Weeks Max</span>
                </div>
              </div>

              {/* Lender Profile Card */}
              <div className="p-4 bg-white rounded-2xl border border-paper-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                    Lender Details
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber text-amber" />
                    <span>4.9</span>
                    <span className="text-charcoal/40 text-[10px] font-normal">(12 reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ink text-amber flex items-center justify-center font-bold text-sm">
                    {book.owner?.name ? book.owner.name.charAt(0) : "S"}
                  </div>
                  <div>
                    <h4 className="font-bold text-ink text-sm">
                      {book.owner?.name || "Campus Student"}
                    </h4>
                    <p className="text-xs text-charcoal/60">
                      {book.owner?.college || "Local College Campus"}
                    </p>
                  </div>
                </div>

                {book.owner?.college_verified && (
                  <div className="pt-2 border-t border-paper-border/60">
                    <CollegeBadge collegeName={book.owner.college} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Action Block: Rental Request Box (5 cols) */}
            <div className="md:col-span-5">
              <RentalRequestBox book={book} currentUserId={currentUserId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

