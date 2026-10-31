import React from "react";
import Link from "next/link";
import { BookOpen, Heart, ShieldCheck, Bookmark } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-paper-border bg-paper-warm/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-ink flex items-center justify-center text-amber shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-heading text-base sm:text-lg font-bold text-ink">
                Campus BookShare
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal/70 max-w-sm leading-relaxed">
              A cozy peer-to-peer novel rental club for students. Share favourite reads, discover hidden gems, and borrow paperbacks without breaking your budget.
            </p>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-charcoal/60 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0" />
              <span>Campus verified readers & in-person handovers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-charcoal/80">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-charcoal/70">
              <li>
                <Link href="/" className="hover:text-ink transition">
                  Browse Novels
                </Link>
              </li>
              <li>
                <Link href="/books/new" className="hover:text-ink transition">
                  Lend a Novel
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ink transition">
                  My Active Rentals
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-ink transition">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Offline Notice */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-charcoal/80">
              Handover Tips
            </h4>
            <div className="p-3 bg-white rounded-xl border border-paper-border text-[11px] sm:text-xs text-charcoal/80 space-y-1.5">
              <p className="flex items-center gap-1.5 font-bold text-ink">
                <Bookmark className="w-3.5 h-3.5 text-amber shrink-0" />
                <span>Meet at Campus Spots</span>
              </p>
              <p className="leading-relaxed text-charcoal/70">
                Exchange books at library lobbies or student cafes. Pay via UPI QR or cash.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-paper-border/60 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-charcoal/60 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Campus BookShare. Made for student novel lovers.</p>
          <div className="flex items-center justify-center gap-1">
            <span>Crafted for cozy campus reads</span>
            <Heart className="w-3 h-3 text-terracotta inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
