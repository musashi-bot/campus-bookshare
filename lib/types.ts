export type UserRole = "student" | "admin";

export type BookCondition = "New" | "Good" | "Fair";

export type BookCategory =
  | "Fiction"
  | "Mystery & Thriller"
  | "Sci-Fi & Fantasy"
  | "Romance"
  | "Classics"
  | "Young Adult"
  | "Non-Fiction & Memoir";

export type BookStatus = "pending" | "available" | "rented" | "removed";

export type RentalStatus =
  | "requested"
  | "accepted"
  | "payment_pending"
  | "active"
  | "returned"
  | "overdue"
  | "rejected"
  | "cancelled";

export type PaymentStatus = "unpaid" | "awaiting_confirmation" | "paid";

export type ReminderType = "due_in_2_days" | "due_today" | "overdue";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  role: UserRole;
  college_verified: boolean;
  created_at: string;
}

export interface Book {
  id: string;
  owner_id: string;
  title: string;
  author: string;
  edition: string | null;
  category: BookCategory;
  condition: BookCondition;
  description: string | null;
  rent_per_week: number;
  image_urls: string[];
  status: BookStatus;
  created_at: string;
  // Join fields
  owner?: Profile;
}

export interface Rental {
  id: string;
  book_id: string;
  borrower_id: string;
  lender_id: string;
  weeks: number;
  start_date: string | null;
  due_date: string | null;
  return_date: string | null;
  rent_amount: number;
  platform_fee: number;
  commission_amount: number;
  late_fee: number;
  payment_status: PaymentStatus;
  upi_reference: string | null;
  status: RentalStatus;
  created_at: string;
  // Join fields
  book?: Book;
  borrower?: Profile;
  lender?: Profile;
}

export interface Payout {
  id: string;
  lender_id: string;
  rental_id: string;
  amount: number;
  status: "pending" | "paid";
  paid_at: string | null;
  created_at: string;
  lender?: Profile;
  rental?: Rental;
}

export interface Review {
  id: string;
  rental_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface Setting {
  key: string;
  value: string;
}

export interface AppSettings {
  platform_fee_flat: number;
  lender_commission_percent: number;
  late_fee_per_day: number;
  max_rental_weeks: number;
  late_fee_lender_split_percent: number;
  max_active_rentals_per_borrower: number;
}
