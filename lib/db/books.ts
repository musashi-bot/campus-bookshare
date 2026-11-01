import { Book, BookCategory, BookCondition, BookStatus } from "@/lib/types";
import { SEED_NOVELS, SEED_PROFILES } from "@/lib/db/seed-data";
import { createClient } from "@/lib/supabase/client";

// In-memory store for newly added books during demo / local testing session
let localAddedBooks: Book[] = [];

export interface BookFilterOptions {
  query?: string;
  category?: string;
  condition?: string;
  maxRent?: number;
  status?: BookStatus | "all";
}

export async function fetchBooks(options: BookFilterOptions = {}): Promise<Book[]> {
  const { query, category, condition, maxRent, status = "available" } = options;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

    if (!isPlaceholder) {
      const supabase = createClient();
      let dbQuery = supabase
        .from("books")
        .select("*, owner:profiles(*)")
        .order("created_at", { ascending: false });

      if (status !== "all") {
        dbQuery = dbQuery.eq("status", status);
      }

      if (category && category !== "All Novels") {
        dbQuery = dbQuery.eq("category", category);
      }

      if (condition && condition !== "all") {
        dbQuery = dbQuery.eq("condition", condition);
      }

      if (maxRent && maxRent > 0) {
        dbQuery = dbQuery.lte("rent_per_week", maxRent);
      }

      if (query && query.trim()) {
        const q = query.trim();
        dbQuery = dbQuery.or(`title.ilike.%${q}%,author.ilike.%${q}%,description.ilike.%${q}%`);
      }

      const { data, error } = await dbQuery;

      if (!error && data) {
        return data as Book[];
      }
    }
  } catch (err) {
    console.warn("Falling back to local seed novels data:", err);
  }

  // Fallback to seed data combined with locally added novels
  let allNovels = [...localAddedBooks, ...SEED_NOVELS];

  if (status !== "all") {
    allNovels = allNovels.filter((b) => b.status === status);
  }

  if (category && category !== "All Novels") {
    allNovels = allNovels.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }

  if (condition && condition !== "all") {
    allNovels = allNovels.filter((b) => b.condition === condition);
  }

  if (maxRent && maxRent > 0) {
    allNovels = allNovels.filter((b) => b.rent_per_week <= maxRent);
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    allNovels = allNovels.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  }

  return allNovels;
}

export async function fetchBookById(id: string): Promise<Book | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

    if (!isPlaceholder) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("books")
        .select("*, owner:profiles(*)")
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as Book;
      }
      if (error && (error.code === "PGRST116" || error.message.includes("0 rows"))) {
        return null;
      }
    }
  } catch (err) {
    console.warn("Book lookup from Supabase fallback:", err);
  }

  // Check local books and seed data
  const localMatch = localAddedBooks.find((b) => b.id === id);
  if (localMatch) return localMatch;

  const seedMatch = SEED_NOVELS.find((b) => b.id === id);
  return seedMatch || null;
}

export async function createNovelListing(novelData: {
  title: string;
  author: string;
  edition?: string;
  category: BookCategory;
  condition: BookCondition;
  rent_per_week: number;
  description: string;
  image_urls: string[];
}): Promise<{ data: Book | null; error: string | null }> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  let ownerId = "b0000000-0000-0000-0000-000000000002"; // Rahul Sharma default
  let ownerProfile = SEED_PROFILES[1];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      ownerId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) ownerProfile = profile;
    }
  } catch {
    // ignore
  }

  const newBook: Book = {
    id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    owner_id: ownerId,
    title: novelData.title.trim(),
    author: novelData.author.trim(),
    edition: novelData.edition?.trim() || null,
    category: novelData.category,
    condition: novelData.condition,
    description: novelData.description.trim() || null,
    rent_per_week: Number(novelData.rent_per_week),
    image_urls: novelData.image_urls.length > 0 ? novelData.image_urls : [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    ],
    // "New listings start as status 'pending' until the admin approves them"
    status: "pending",
    created_at: new Date().toISOString(),
    owner: ownerProfile,
  };

  if (!isPlaceholder) {
    try {
      const { data, error } = await supabase
        .from("books")
        .insert({
          owner_id: newBook.owner_id,
          title: newBook.title,
          author: newBook.author,
          edition: newBook.edition,
          category: newBook.category,
          condition: newBook.condition,
          description: newBook.description,
          rent_per_week: newBook.rent_per_week,
          image_urls: newBook.image_urls,
          status: "pending",
        })
        .select("*, owner:profiles(*)")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        localAddedBooks.unshift(newBook);
        return { data: newBook, error: null };
      }

      return { data: data as Book, error: null };
    } catch (err: any) {
      localAddedBooks.unshift(newBook);
      return { data: newBook, error: null };
    }
  }

  localAddedBooks.unshift(newBook);
  return { data: newBook, error: null };
}

export async function uploadBookCover(file: File): Promise<string> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany");

  if (!isPlaceholder) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("book-covers")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (!uploadError) {
        const { data } = supabase.storage.from("book-covers").getPublicUrl(filePath);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch (err) {
      console.warn("Storage upload fallback:", err);
    }
  }

  // Fallback data URL for instant client-side preview
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

export async function deleteNovelListing(bookId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    // Delete any linked reviews or rentals first
    await supabase.from("rentals").delete().eq("book_id", bookId);
    await supabase.from("reviews").delete().eq("book_id", bookId);
    const { error } = await supabase.from("books").delete().eq("id", bookId);
    if (error) {
      return { success: false, error: error.message };
    }
    localAddedBooks = localAddedBooks.filter((b) => b.id !== bookId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete novel" };
  }
}


