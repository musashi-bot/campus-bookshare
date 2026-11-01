"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Book, BookCategory } from "@/lib/types";
import { BookCard } from "@/components/books/BookCard";
import { Search, SlidersHorizontal, RotateCcw, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchBooks } from "@/lib/db/books";

interface BookCatalogProps {
  initialBooks: Book[];
}

const CATEGORIES: string[] = [
  "All Novels",
  "Fiction",
  "Mystery & Thriller",
  "Sci-Fi & Fantasy",
  "Romance",
  "Classics",
  "Young Adult",
  "Non-Fiction & Memoir",
];

const CONDITIONS = [
  { label: "All Conditions", value: "all" },
  { label: "New / Like New", value: "New" },
  { label: "Good Condition", value: "Good" },
  { label: "Fair / Well Read", value: "Fair" },
];

export function BookCatalog({ initialBooks }: BookCatalogProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Novels");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [maxRent, setMaxRent] = useState<number>(60);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  useEffect(() => {
    async function loadLiveBooks() {
      try {
        const live = await fetchBooks({ status: "available" });
        if (live) {
          setBooks(live);
        }
      } catch (err) {
        console.warn("Failed to load live books:", err);
      }
    }
    loadLiveBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Category filter
      if (
        selectedCategory !== "All Novels" &&
        book.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Condition filter
      if (selectedCondition !== "all" && book.condition !== selectedCondition) {
        return false;
      }

      // Max rent filter
      if (book.rent_per_week > maxRent) {
        return false;
      }

      // Search query (title, author, genre, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesCategory = book.category.toLowerCase().includes(q);
        const matchesDesc = book.description?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesAuthor && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [initialBooks, searchQuery, selectedCategory, selectedCondition, maxRent]);

  const hasActiveFilters =
    selectedCategory !== "All Novels" ||
    selectedCondition !== "all" ||
    maxRent < 60 ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Novels");
    setSelectedCondition("all");
    setMaxRent(60);
  };

  return (
    <div className="w-full space-y-8">
      {/* Search Bar & Controls Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl mx-auto">
          <div className="relative flex items-center flex-1 bg-white rounded-2xl shadow-soft border border-paper-border px-3 py-2.5 focus-within:ring-2 focus-within:ring-amber">
            <Search className="w-4 h-4 text-charcoal/40 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or keywords..."
              className="w-full text-sm sm:text-base text-charcoal bg-transparent placeholder:text-charcoal/40 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-charcoal/50 hover:text-charcoal px-1.5 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFiltersModal(!showFiltersModal)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold min-h-[44px] transition ${
              showFiltersModal || selectedCondition !== "all" || maxRent < 60
                ? "bg-ink text-white border-ink shadow-sm"
                : "bg-white text-ink border-paper-border hover:bg-paper-warm"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {(selectedCondition !== "all" || maxRent < 60) && (
              <span className="w-2 h-2 rounded-full bg-amber" />
            )}
          </button>
        </div>

        {/* Collapsible Extended Filters Box */}
        {showFiltersModal && (
          <div className="max-w-2xl mx-auto p-4 sm:p-5 bg-white rounded-2xl border border-paper-border shadow-soft space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-paper-border/60">
              <span className="font-heading font-bold text-ink text-sm sm:text-base">
                Refine Novel Search
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs text-amber font-bold hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Condition Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
                  Book Condition
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-paper-border bg-paper-warm/50 text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-amber"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Rent Filter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal/80">
                  <span className="uppercase tracking-wider">Max Weekly Rent</span>
                  <span className="text-ink font-bold">₹{maxRent} / week</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={maxRent}
                  onChange={(e) => setMaxRent(Number(e.target.value))}
                  className="w-full accent-amber h-2 bg-paper-warm rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-charcoal/50">
                  <span>₹20</span>
                  <span>₹40</span>
                  <span>₹60</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 sm:px-0 sm:flex-wrap sm:justify-center -mx-4 sm:mx-0 px-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[38px] flex items-center ${
                  isSelected
                    ? "bg-ink text-white shadow-sm scale-105"
                    : "bg-white text-charcoal/80 hover:bg-paper-warm border border-paper-border active:scale-95"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-ink">
            {selectedCategory === "All Novels" ? "Recently Added Novels" : `${selectedCategory} Novels`}
          </h2>
          <p className="text-xs text-charcoal/60">
            Showing {filteredBooks.length} available {filteredBooks.length === 1 ? "novel" : "novels"}
          </p>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs text-charcoal/70 hover:text-ink"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Novels Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-paper-border shadow-soft max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber/15 text-amber mx-auto flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-ink">
              No novels found
            </h3>
            <p className="text-xs sm:text-sm text-charcoal/70 max-w-sm mx-auto">
              We couldn't find any novels matching your active filters. Try searching with different terms or reset your filters.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Search Filters
          </Button>
        </div>
      )}
    </div>
  );
}

