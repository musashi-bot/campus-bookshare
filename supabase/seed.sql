-- ==========================================================
-- Campus BookShare: Seed Data (1 Admin, 4 Students, 15 Novels, Settings)
-- ==========================================================

-- 1. INITIAL SYSTEM SETTINGS
INSERT INTO public.settings (key, value) VALUES
  ('platform_fee_flat', '10'),
  ('lender_commission_percent', '10'),
  ('late_fee_per_day', '2'),
  ('max_rental_weeks', '4'),
  ('late_fee_lender_split_percent', '50'),
  ('max_active_rentals_per_borrower', '3')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. SEED PROFILES (Fixed UUIDs for consistent testing)
-- Note: When running in Supabase, also create matching auth.users or use these IDs
INSERT INTO public.profiles (id, name, email, phone, college, role, college_verified) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Admin Vikram', 'admin@campusshare.internal', '+91 9811122233', 'Campus Admin Office', 'admin', true),
  ('b0000000-0000-0000-0000-000000000002', 'Rahul Sharma', 'rahul@iitb.ac.in', '+91 9822233344', 'IIT Bombay', 'student', true),
  ('b0000000-0000-0000-0000-000000000003', 'Ananya Roy', 'ananya@du.ac.in', '+91 9833344455', 'Delhi University', 'student', true),
  ('b0000000-0000-0000-0000-000000000004', 'Kabir Verma', 'kabir@bits-pilani.ac.in', '+91 9844455566', 'BITS Pilani', 'student', true),
  ('b0000000-0000-0000-0000-000000000005', 'Diya Sen', 'diya@manipal.edu', '+91 9855566677', 'Manipal University', 'student', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  college_verified = EXCLUDED.college_verified;

-- 3. SEED 15 POPULAR NOVELS ACROSS GENRES
INSERT INTO public.books (id, owner_id, title, author, edition, category, condition, description, rent_per_week, image_urls, status) VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Norwegian Wood',
    'Haruki Murakami',
    'Vintage International Edition',
    'Fiction',
    'Good',
    'A magnificent coming-of-age story about nostalgia, young love, and loss set in 1960s Tokyo. Pages are crisp with minor pencil markings.',
    35.00,
    ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'The Silent Patient',
    'Alex Michaelides',
    '1st Paperback Edition',
    'Mystery & Thriller',
    'New',
    'A shocking psychological thriller about a woman who shoots her husband and never speaks another word. Read once, completely pristine condition.',
    40.00,
    ARRAY['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000004',
    'Dune',
    'Frank Herbert',
    'Ace Deluxe Paperback',
    'Sci-Fi & Fantasy',
    'Good',
    'The iconic sci-fi epic set on the desert planet Arrakis. Frank Herbert''s timeless masterpiece of politics, religion, and ecology.',
    45.00,
    ARRAY['https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000005',
    'Normal People',
    'Sally Rooney',
    'Faber & Faber 2019',
    'Romance',
    'New',
    'The global bestseller exploring mutual fascination, friendship, and first love between Marianne and Connell through school and Trinity College.',
    30.00,
    ARRAY['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000002',
    '1984',
    'George Orwell',
    'Signet Classics',
    'Classics',
    'Fair',
    'Orwell''s terrifying vision of a totalitarian future ruled by Big Brother. Readable paperback with vintage yellowed pages.',
    25.00,
    ARRAY['https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000003',
    'Project Hail Mary',
    'Andy Weir',
    'Ballantine Books 2021',
    'Sci-Fi & Fantasy',
    'Good',
    'A lone astronaut must save the Earth from an extinction-level disaster. Fast-paced, heartwarming, and brilliant scientific ingenuity.',
    45.00,
    ARRAY['https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000004',
    'The Great Gatsby',
    'F. Scott Fitzgerald',
    'Scribner Trade Edition',
    'Classics',
    'Good',
    'The quintessential Jazz Age novel of passion, wealth, and the elusive American dream on Long Island.',
    25.00,
    ARRAY['https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000005',
    'A Good Girl''s Guide to Murder',
    'Holly Jackson',
    'Electric Monkey Edition',
    'Young Adult',
    'Good',
    'Pip Fitz-Amobi reopens an unsolved local murder-suicide case for her school project and uncovers dangerous town secrets.',
    35.00,
    ARRAY['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000009',
    'b0000000-0000-0000-0000-000000000002',
    'The Midnight Library',
    'Matt Haig',
    'Viking Canongate',
    'Fiction',
    'New',
    'Between life and death there is a library where every book offers a chance to try another life you could have lived. Deeply comforting read.',
    35.00,
    ARRAY['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000010',
    'b0000000-0000-0000-0000-000000000003',
    'Gone Girl',
    'Gillian Flynn',
    'Crown Publishing',
    'Mystery & Thriller',
    'Good',
    'On their fifth wedding anniversary, Amy Dunne disappears. A darkly gripping masterclass in deceit and marriage.',
    35.00,
    ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000011',
    'b0000000-0000-0000-0000-000000000004',
    'Atomic Habits',
    'James Clear',
    'Penguin Random House',
    'Non-Fiction & Memoir',
    'New',
    'The practical guide on how tiny changes lead to remarkable results. Great condition, highlighted only chapter summaries.',
    40.00,
    ARRAY['https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000012',
    'b0000000-0000-0000-0000-000000000005',
    'It Ends with Us',
    'Colleen Hoover',
    'Atria Books 2016',
    'Romance',
    'Good',
    'A brave and deeply personal novel about breaking the cycle of abuse and finding the courage to make the hardest choices.',
    30.00,
    ARRAY['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000013',
    'b0000000-0000-0000-0000-000000000002',
    'The Kite Runner',
    'Khaled Hosseini',
    'Riverhead Books',
    'Fiction',
    'Good',
    'An unforgettable, heartbreaking story of the unlikely friendship between a wealthy boy and the son of his father''s servant in Kabul.',
    30.00,
    ARRAY['https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000014',
    'b0000000-0000-0000-0000-000000000003',
    'The Song of Achilles',
    'Madeline Miller',
    'Ecco HarperCollins',
    'Fiction',
    'New',
    'A breathtaking retelling of the Trojan War and Homer''s Iliad told through the perspective of Patroclus. Winner of the Women''s Prize for Fiction.',
    40.00,
    ARRAY['https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=600&q=80'],
    'available'
  ),
  (
    'c0000000-0000-0000-0000-000000000015',
    'b0000000-0000-0000-0000-000000000004',
    'Educated',
    'Tara Westover',
    'Random House',
    'Non-Fiction & Memoir',
    'Good',
    'A gripping memoir about a girl who, kept out of school by survivalist parents in rural Idaho, teaches herself enough mathematics and grammar to enter university.',
    35.00,
    ARRAY['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'],
    'available'
  )
ON CONFLICT (id) DO NOTHING;

