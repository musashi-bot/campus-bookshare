import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Book } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, User } from "lucide-react";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
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
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-paper-border overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-warm flex items-center justify-center">
        <img
          src={coverUrl}
          alt={book.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Condition Badge Top Left */}
        <div className="absolute top-2.5 left-2.5">
          <Badge variant={conditionVariant} size="sm" className="shadow-sm">
            {book.condition}
          </Badge>
        </div>

        {/* Status Badge Top Right if not available */}
        {book.status !== "available" && (
          <div className="absolute top-2.5 right-2.5">
            <Badge
              variant={book.status === "rented" ? "amber" : "neutral"}
              size="sm"
              className="shadow-sm font-bold uppercase"
            >
              {book.status}
            </Badge>
          </div>
        )}

        {/* Rent pill bottom right */}
        <div className="absolute bottom-2.5 right-2.5 bg-ink/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm">
          {formatINR(book.rent_per_week)} <span className="text-[10px] font-normal text-white/80">/ wk</span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber block">
            {book.category}
          </span>
          <h3 className="font-heading font-bold text-base text-ink line-clamp-1 group-hover:text-amber transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-charcoal/70 line-clamp-1 font-medium">
            by {book.author}
          </p>
        </div>

        {/* Owner Info & College */}
        <div className="pt-2 border-t border-paper-border/60 flex items-center justify-between text-[11px] text-charcoal/60">
          <div className="flex items-center gap-1.5 truncate max-w-[140px]">
            <div className="w-5 h-5 rounded-full bg-paper-warm text-ink flex items-center justify-center text-[10px] font-bold shrink-0">
              {book.owner?.name ? book.owner.name.charAt(0) : "S"}
            </div>
            <span className="truncate">{book.owner?.college || "Campus Peer"}</span>
          </div>

          {book.owner?.college_verified && (
            <span className="flex items-center gap-0.5 text-teal text-[10px] font-bold" title="College Verified Student">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Verified</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

