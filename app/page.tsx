import React from "react";
import Link from "next/link";
import { BookOpen, ShieldCheck, ArrowRight, Sparkles, RefreshCw, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { fetchBooks } from "@/lib/db/books";
import { BookCatalog } from "@/components/books/BookCatalog";

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Browse or List",
    description: "Find great stories from fellow campus readers or list books sitting on your shelf in 2 minutes.",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "Request & Connect",
    description: "Pick 1 to 4 weeks rental. Once accepted, contact details unlock for a quick campus meetup.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Meet, Pay & Read",
    description: "Pay offline via UPI or cash at campus spots. Admin confirms payment to activate your rental.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Return & Repeat",
    description: "Hand the novel back on time, leave a review, and the lender gets their payout automatically.",
    icon: RefreshCw,
  },
];

export default async function HomePage() {
  const books = await fetchBooks({ status: "available" });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-paper-warm/80 via-paper-warm/40 to-paper py-10 sm:py-16 md:py-20 border-b border-paper-border/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/15 text-ink text-xs font-bold border border-amber/30">
            <Bookmark className="w-3.5 h-3.5 text-amber shrink-0" />
            <span>Campus Peer-to-Peer Novel Club</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-ink tracking-tight leading-[1.15]">
            Rent novels from readers <br className="hidden sm:inline" />
            on your campus
          </h1>

          <p className="text-sm sm:text-base text-charcoal/80 max-w-xl mx-auto leading-relaxed px-2">
            Borrow popular paperbacks, thrillers, romances, sci-fi, and timeless classics directly from student book lovers at pocket-friendly weekly rates.
          </p>
        </div>
      </section>

      {/* Main Browse & Catalog Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <BookCatalog initialBooks={books} />
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-paper-border/60">
        <div className="text-center space-y-2 mb-8 sm:mb-12">
          <Badge variant="amber" size="sm">
            How It Works
          </Badge>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink">
            Simple, safe novel sharing
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/70 max-w-md mx-auto">
            Read more stories each semester without buying brand new books.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {HOW_IT_WORKS_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.step}
                className="p-5 sm:p-6 hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-paper-warm text-ink flex items-center justify-center border border-paper-border">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber" />
                    </div>
                    <span className="font-heading text-2xl sm:text-3xl font-extrabold text-charcoal/20">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
        <div className="bg-ink rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-white relative overflow-hidden shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber">
              Bookshelf full of finished novels?
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              Share your favourite novels with campus readers
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              List your books in 2 minutes. Earn pocket money weekly while helping fellow students discover unforgettable stories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Link href="/books/new" className="w-full sm:w-auto">
              <Button variant="accent" size="lg" className="w-full min-h-[48px] font-bold">
                Lend a Novel <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full min-h-[48px] text-white border-white/30 hover:bg-white/10 hover:border-white font-medium"
              >
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
