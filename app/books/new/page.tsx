"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Upload, X, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { BookCategory, BookCondition } from "@/lib/types";
import { createNovelListing, uploadBookCover } from "@/lib/db/books";

const novelSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  author: z.string().min(2, "Author name must be at least 2 characters long"),
  edition: z.string().optional(),
  category: z.enum([
    "Fiction",
    "Mystery & Thriller",
    "Sci-Fi & Fantasy",
    "Romance",
    "Classics",
    "Young Adult",
    "Non-Fiction & Memoir",
  ] as const, {
    errorMap: () => ({ message: "Please select a valid genre" }),
  }),
  condition: z.enum(["New", "Good", "Fair"] as const, {
    errorMap: () => ({ message: "Please choose book condition" }),
  }),
  rent_per_week: z
    .number({ invalid_type_error: "Enter a valid rent amount" })
    .min(10, "Minimum weekly rent is ₹10")
    .max(200, "Maximum weekly rent is ₹200"),
  description: z
    .string()
    .min(10, "Please provide a brief description (at least 10 characters)"),
});

const CATEGORIES: BookCategory[] = [
  "Fiction",
  "Mystery & Thriller",
  "Sci-Fi & Fantasy",
  "Romance",
  "Classics",
  "Young Adult",
  "Non-Fiction & Memoir",
];

const CONDITIONS: { label: string; value: BookCondition; desc: string }[] = [
  { label: "New", value: "New", desc: "Unread or like-new condition, no markings" },
  { label: "Good", value: "Good", desc: "Gently read, intact cover and clean pages" },
  { label: "Fair", value: "Fair", desc: "Noticeable wear, yellowed pages, or annotations" },
];

export default function NewBookPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [edition, setEdition] = useState("");
  const [category, setCategory] = useState<BookCategory>("Fiction");
  const [condition, setCondition] = useState<BookCondition>("Good");
  const [rentPerWeek, setRentPerWeek] = useState<string>("35");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    if (imageFiles.length + selected.length > 3) {
      toast.error("You can upload a maximum of 3 cover photos.");
      return;
    }

    const updatedFiles = [...imageFiles, ...selected].slice(0, 3);
    setImageFiles(updatedFiles);

    const newPreviews = updatedFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(newPreviews);
  };

  const removeImage = (index: number) => {
    const updatedFiles = imageFiles.filter((_, idx) => idx !== index);
    setImageFiles(updatedFiles);

    const updatedPreviews = previewUrls.filter((_, idx) => idx !== index);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedRent = Number(rentPerWeek);
    const validationResult = novelSchema.safeParse({
      title,
      author,
      edition: edition || undefined,
      category,
      condition,
      rent_per_week: parsedRent,
      description,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please resolve form errors before submitting");
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      setUploadProgress(true);
      const uploadedUrls: string[] = [];

      // Upload photos (if any)
      for (const file of imageFiles) {
        const url = await uploadBookCover(file);
        uploadedUrls.push(url);
      }

      // Default stock cover if none uploaded
      if (uploadedUrls.length === 0) {
        uploadedUrls.push(
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80"
        );
      }

      const { data, error } = await createNovelListing({
        title,
        author,
        edition,
        category,
        condition,
        rent_per_week: parsedRent,
        description,
        image_urls: uploadedUrls,
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(
        "Novel listed! It will be visible on campus once approved by the admin."
      );
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to list book");
    } finally {
      setSubmitting(false);
      setUploadProgress(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12 w-full space-y-6">
      {/* Breadcrumb / Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-charcoal/70 hover:text-ink transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Browse</span>
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-ink">
          Lend a Novel
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70">
          List your finished book so fellow students on campus can rent and enjoy it.
        </p>
      </div>

      {/* Moderation Notice Banner */}
      <div className="p-4 rounded-2xl bg-paper-warm border border-paper-border flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5 text-charcoal/80">
          <p className="font-bold text-ink">Admin Moderation Notice</p>
          <p className="leading-relaxed">
            All newly listed books start in <span className="font-semibold text-amber">"Pending"</span> status until verified by the campus admin to ensure authentic book copies and safe student exchanges.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="p-5 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Book Title *"
              placeholder="e.g. Norwegian Wood, Dune..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />

            <Input
              label="Author *"
              placeholder="e.g. Haruki Murakami"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              error={errors.author}
              required
            />
          </div>

          {/* Edition & Weekly Rent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Edition / Publisher (Optional)"
              placeholder="e.g. Vintage Classics, 2021 Paperback"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              error={errors.edition}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80">
                Rent per Week (₹) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-bold text-charcoal/50">
                  ₹
                </span>
                <input
                  type="number"
                  min="10"
                  max="200"
                  step="5"
                  value={rentPerWeek}
                  onChange={(e) => setRentPerWeek(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-paper-border bg-white text-charcoal text-base sm:text-sm font-semibold focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-none"
                  required
                />
              </div>
              {errors.rent_per_week && (
                <p className="text-xs text-terracotta font-medium">
                  {errors.rent_per_week}
                </p>
              )}
              <p className="text-[11px] text-charcoal/60">
                Lenders earn weekly rent minus a 10% platform commission upon return.
              </p>
            </div>
          </div>

          {/* Genre Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80">
              Genre / Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BookCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-paper-border bg-white text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-amber"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-terracotta font-medium">
                {errors.category}
              </p>
            )}
          </div>

          {/* Condition Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80">
              Physical Condition *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCondition(c.value)}
                  className={`p-3 rounded-xl border text-left transition ${
                    condition === c.value
                      ? "border-ink bg-ink text-white shadow-sm"
                      : "border-paper-border bg-paper-warm/50 text-charcoal hover:bg-paper-warm"
                  }`}
                >
                  <p className="text-sm font-bold">{c.label}</p>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      condition === c.value ? "text-white/80" : "text-charcoal/60"
                    }`}
                  >
                    {c.desc}
                  </p>
                </button>
              ))}
            </div>
            {errors.condition && (
              <p className="text-xs text-terracotta font-medium">
                {errors.condition}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80">
              Book Description & Notes *
            </label>
            <textarea
              rows={4}
              placeholder="Tell readers about this copy (e.g. loved this book, pages are clean, only minor spine wear)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-paper-border bg-white text-charcoal text-sm leading-relaxed focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-none placeholder:text-charcoal/40"
              required
            />
            {errors.description && (
              <p className="text-xs text-terracotta font-medium">
                {errors.description}
              </p>
            )}
          </div>

          {/* Photo Upload (Max 3) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80">
              Cover Photos (Max 3)
            </label>

            <div className="flex flex-wrap items-center gap-3">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-28 rounded-xl overflow-hidden border border-paper-border shadow-sm group"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-ink/80 text-white rounded-full hover:bg-terracotta transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {imageFiles.length < 3 && (
                <label className="w-20 h-28 rounded-xl border-2 border-dashed border-paper-border hover:border-amber flex flex-col items-center justify-center text-charcoal/60 hover:text-amber cursor-pointer bg-paper-warm/50 hover:bg-paper-warm transition">
                  <ImagePlus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-charcoal/60">
              Clear photos of the front cover and spine help other students verify condition.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-paper-border flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="ghost" size="md" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full sm:w-auto min-h-[48px] font-bold"
              isLoading={submitting || uploadProgress}
            >
              Submit Novel for Approval
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

