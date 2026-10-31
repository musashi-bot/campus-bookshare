import { Book, Profile, AppSettings, Rental, Payout } from "@/lib/types";

export const DEFAULT_SETTINGS: AppSettings = {
  platform_fee_flat: 10,
  lender_commission_percent: 10,
  late_fee_per_day: 2,
  max_rental_weeks: 4,
  late_fee_lender_split_percent: 50,
  max_active_rentals_per_borrower: 3,
};

export const SEED_PROFILES: Profile[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Admin Vikram",
    email: "admin@campusshare.internal",
    phone: "+91 9811122233",
    college: "Campus Administration",
    role: "admin",
    college_verified: true,
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    name: "Rahul Sharma",
    email: "rahul@iitb.ac.in",
    phone: "+91 9822233344",
    college: "IIT Bombay",
    role: "student",
    college_verified: true,
    created_at: "2026-09-05T00:00:00Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    name: "Ananya Roy",
    email: "ananya@du.ac.in",
    phone: "+91 9833344455",
    college: "Delhi University",
    role: "student",
    college_verified: true,
    created_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    name: "Kabir Verma",
    email: "kabir@bits-pilani.ac.in",
    phone: "+91 9844455566",
    college: "BITS Pilani",
    role: "student",
    college_verified: true,
    created_at: "2026-09-15T00:00:00Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000005",
    name: "Diya Sen",
    email: "diya@manipal.edu",
    phone: "+91 9855566677",
    college: "Manipal University",
    role: "student",
    college_verified: true,
    created_at: "2026-09-20T00:00:00Z",
  },
];

export const SEED_NOVELS: Book[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    owner_id: "b0000000-0000-0000-0000-000000000002",
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    edition: "Vintage International Edition",
    category: "Fiction",
    condition: "Good",
    description:
      "A magnificent coming-of-age story about nostalgia, young love, and loss set in 1960s Tokyo. Crisp pages with minor pencil markings.",
    rent_per_week: 35,
    image_urls: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-01T10:00:00Z",
    owner: SEED_PROFILES[1],
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    owner_id: "b0000000-0000-0000-0000-000000000003",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    edition: "1st Paperback Edition",
    category: "Mystery & Thriller",
    condition: "New",
    description:
      "A shocking psychological thriller about a woman who shoots her husband and never speaks another word. Read once, pristine condition.",
    rent_per_week: 40,
    image_urls: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-02T11:00:00Z",
    owner: SEED_PROFILES[2],
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    owner_id: "b0000000-0000-0000-0000-000000000004",
    title: "Dune",
    author: "Frank Herbert",
    edition: "Ace Deluxe Paperback",
    category: "Sci-Fi & Fantasy",
    condition: "Good",
    description:
      "The iconic sci-fi epic set on the desert planet Arrakis. Frank Herbert's timeless masterpiece of politics, religion, and ecology.",
    rent_per_week: 45,
    image_urls: [
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
    ],
    status: "rented",
    created_at: "2026-10-03T12:00:00Z",
    owner: SEED_PROFILES[3],
  },
  {
    id: "c0000000-0000-0000-0000-000000000004",
    owner_id: "b0000000-0000-0000-0000-000000000005",
    title: "Normal People",
    author: "Sally Rooney",
    edition: "Faber & Faber 2019",
    category: "Romance",
    condition: "New",
    description:
      "The global bestseller exploring mutual fascination, friendship, and first love between Marianne and Connell through school and Trinity College.",
    rent_per_week: 30,
    image_urls: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-04T09:30:00Z",
    owner: SEED_PROFILES[4],
  },
  {
    id: "c0000000-0000-0000-0000-000000000005",
    owner_id: "b0000000-0000-0000-0000-000000000002",
    title: "1984",
    author: "George Orwell",
    edition: "Signet Classics",
    category: "Classics",
    condition: "Fair",
    description:
      "Orwell's terrifying vision of a totalitarian future ruled by Big Brother. Readable paperback with vintage yellowed pages.",
    rent_per_week: 25,
    image_urls: [
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-05T14:15:00Z",
    owner: SEED_PROFILES[1],
  },
  {
    id: "c0000000-0000-0000-0000-000000000006",
    owner_id: "b0000000-0000-0000-0000-000000000003",
    title: "Project Hail Mary",
    author: "Andy Weir",
    edition: "Ballantine Books 2021",
    category: "Sci-Fi & Fantasy",
    condition: "Good",
    description:
      "A lone astronaut must save Earth from an extinction-level disaster. Fast-paced, heartwarming, and full of scientific ingenuity.",
    rent_per_week: 45,
    image_urls: [
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-06T15:20:00Z",
    owner: SEED_PROFILES[2],
  },
  {
    id: "c0000000-0000-0000-0000-000000000007",
    owner_id: "b0000000-0000-0000-0000-000000000004",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    edition: "Scribner Trade Edition",
    category: "Classics",
    condition: "Good",
    description:
      "The quintessential Jazz Age novel of passion, wealth, and the elusive American dream on Long Island.",
    rent_per_week: 25,
    image_urls: [
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-07T16:00:00Z",
    owner: SEED_PROFILES[3],
  },
  {
    id: "c0000000-0000-0000-0000-000000000008",
    owner_id: "b0000000-0000-0000-0000-000000000005",
    title: "A Good Girl's Guide to Murder",
    author: "Holly Jackson",
    edition: "Electric Monkey Edition",
    category: "Young Adult",
    condition: "Good",
    description:
      "Pip Fitz-Amobi reopens an unsolved local murder case for her senior school project and uncovers dangerous town secrets.",
    rent_per_week: 35,
    image_urls: [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-08T11:45:00Z",
    owner: SEED_PROFILES[4],
  },
  {
    id: "c0000000-0000-0000-0000-000000000009",
    owner_id: "b0000000-0000-0000-0000-000000000002",
    title: "The Midnight Library",
    author: "Matt Haig",
    edition: "Viking Canongate",
    category: "Fiction",
    condition: "New",
    description:
      "Between life and death there is a library where every book offers a chance to try another life you could have lived.",
    rent_per_week: 35,
    image_urls: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-09T13:30:00Z",
    owner: SEED_PROFILES[1],
  },
  {
    id: "c0000000-0000-0000-0000-000000000010",
    owner_id: "b0000000-0000-0000-0000-000000000003",
    title: "Gone Girl",
    author: "Gillian Flynn",
    edition: "Crown Publishing",
    category: "Mystery & Thriller",
    condition: "Good",
    description:
      "On their fifth wedding anniversary, Amy Dunne disappears. A darkly gripping masterclass in deceit and marriage.",
    rent_per_week: 35,
    image_urls: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-10T14:00:00Z",
    owner: SEED_PROFILES[2],
  },
  {
    id: "c0000000-0000-0000-0000-000000000011",
    owner_id: "b0000000-0000-0000-0000-000000000004",
    title: "Atomic Habits",
    author: "James Clear",
    edition: "Penguin Random House",
    category: "Non-Fiction & Memoir",
    condition: "New",
    description:
      "The practical guide on how tiny changes lead to remarkable results. Great condition, highlighted only chapter summaries.",
    rent_per_week: 40,
    image_urls: [
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-11T16:45:00Z",
    owner: SEED_PROFILES[3],
  },
  {
    id: "c0000000-0000-0000-0000-000000000012",
    owner_id: "b0000000-0000-0000-0000-000000000005",
    title: "It Ends with Us",
    author: "Colleen Hoover",
    edition: "Atria Books 2016",
    category: "Romance",
    condition: "Good",
    description:
      "A deeply personal novel about breaking generational cycles and finding the courage to make the hardest life decisions.",
    rent_per_week: 30,
    image_urls: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-12T10:15:00Z",
    owner: SEED_PROFILES[4],
  },
  {
    id: "c0000000-0000-0000-0000-000000000013",
    owner_id: "b0000000-0000-0000-0000-000000000002",
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    edition: "Riverhead Books",
    category: "Fiction",
    condition: "Good",
    description:
      "An unforgettable, heartbreaking story of the unlikely friendship between a wealthy boy and the son of his father's servant in Kabul.",
    rent_per_week: 30,
    image_urls: [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-13T12:00:00Z",
    owner: SEED_PROFILES[1],
  },
  {
    id: "c0000000-0000-0000-0000-000000000014",
    owner_id: "b0000000-0000-0000-0000-000000000003",
    title: "The Song of Achilles",
    author: "Madeline Miller",
    edition: "Ecco HarperCollins",
    category: "Fiction",
    condition: "New",
    description:
      "A breathtaking retelling of Homer's Iliad told through the perspective of Patroclus. Winner of the Women's Prize for Fiction.",
    rent_per_week: 40,
    image_urls: [
      "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-14T15:30:00Z",
    owner: SEED_PROFILES[2],
  },
  {
    id: "c0000000-0000-0000-0000-000000000015",
    owner_id: "b0000000-0000-0000-0000-000000000004",
    title: "Educated",
    author: "Tara Westover",
    edition: "Random House",
    category: "Non-Fiction & Memoir",
    condition: "Good",
    description:
      "A gripping memoir about a girl kept out of school by survivalist parents who taught herself mathematics and entered Cambridge.",
    rent_per_week: 35,
    image_urls: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    ],
    status: "available",
    created_at: "2026-10-15T18:00:00Z",
    owner: SEED_PROFILES[3],
  },
];

// Seed Rentals for rich interactive dashboard testing
export const SEED_RENTALS: Rental[] = [
  {
    id: "r0000000-0000-0000-0000-000000000001",
    book_id: "c0000000-0000-0000-0000-000000000003", // Dune
    borrower_id: "b0000000-0000-0000-0000-000000000002", // Rahul
    lender_id: "b0000000-0000-0000-0000-000000000004", // Kabir
    weeks: 2,
    start_date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Due in 3 days
    return_date: null,
    rent_amount: 90,
    platform_fee: 10,
    commission_amount: 9,
    late_fee: 0,
    payment_status: "paid",
    upi_reference: "UPI/2026/DUNE-4920",
    status: "active",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    book: SEED_NOVELS[2],
    borrower: SEED_PROFILES[1],
    lender: SEED_PROFILES[3],
  },
  {
    id: "r0000000-0000-0000-0000-000000000002",
    book_id: "c0000000-0000-0000-0000-000000000001", // Norwegian Wood
    borrower_id: "b0000000-0000-0000-0000-000000000003", // Ananya
    lender_id: "b0000000-0000-0000-0000-000000000002", // Rahul
    weeks: 1,
    start_date: null,
    due_date: null,
    return_date: null,
    rent_amount: 35,
    platform_fee: 10,
    commission_amount: 3.5,
    late_fee: 0,
    payment_status: "unpaid",
    upi_reference: null,
    status: "requested", // Awaiting Rahul's Accept/Reject decision
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    book: SEED_NOVELS[0],
    borrower: SEED_PROFILES[2],
    lender: SEED_PROFILES[1],
  },
  {
    id: "r0000000-0000-0000-0000-000000000003",
    book_id: "c0000000-0000-0000-0000-000000000005", // 1984
    borrower_id: "b0000000-0000-0000-0000-000000000005", // Diya
    lender_id: "b0000000-0000-0000-0000-000000000002", // Rahul
    weeks: 2,
    start_date: "2026-10-01",
    due_date: "2026-10-15",
    return_date: "2026-10-14",
    rent_amount: 50,
    platform_fee: 10,
    commission_amount: 5,
    late_fee: 0,
    payment_status: "paid",
    upi_reference: "UPI/2026/ORWELL-1984",
    status: "returned",
    created_at: "2026-09-29T10:00:00Z",
    book: SEED_NOVELS[4],
    borrower: SEED_PROFILES[4],
    lender: SEED_PROFILES[1],
  },
];

export const SEED_PAYOUTS: Payout[] = [
  {
    id: "p0000000-0000-0000-0000-000000000001",
    lender_id: "b0000000-0000-0000-0000-000000000002", // Rahul
    rental_id: "r0000000-0000-0000-0000-000000000003",
    amount: 45, // 50 - 5 commission
    status: "paid",
    paid_at: "2026-10-15T12:00:00Z",
    created_at: "2026-10-14T18:00:00Z",
  },
];
