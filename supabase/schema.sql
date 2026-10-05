-- AutoPrime car dealer schema. Run in Supabase SQL editor.
-- Auth is handled by Supabase Auth (enable Google provider).

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  year int not null,
  price_kobo bigint not null, -- store in kobo (NGN * 100). e.g. 450000000 = ₦4,500,000
  mileage_km int default 0,
  fuel text default 'Petrol', -- Petrol | Diesel | Hybrid | Electric
  transmission text default 'Automatic',
  body_type text default 'Sedan', -- Sedan | SUV | Hatchback | Pickup | Coupe
  color text default 'Black',
  image_url text,
  stock int default 1,
  featured boolean default false,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email text not null,
  items jsonb not null, -- [{vehicle_id, make, model, year, price_kobo, qty}]
  amount_kobo bigint not null,
  paystack_ref text unique,
  status text default 'pending', -- pending | paid | failed | verified
  created_at timestamptz default now()
);

create table if not exists public.test_drives (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  phone text not null,
  preferred_date date not null,
  status text default 'requested',
  created_at timestamptz default now()
);

-- Open read access for catalog; writes locked to authenticated / service role
alter table public.vehicles enable row level security;
alter table public.orders enable row level security;
alter table public.test_drives enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "vehicles readable" on public.vehicles;
create policy "vehicles readable" on public.vehicles for select using (true);

drop policy if exists "admin manage vehicles" on public.vehicles;
create policy "admin manage vehicles" on public.vehicles
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- Tighten the above in production: check admin flag on profiles.

drop policy if exists "users own orders" on public.orders;
create policy "users own orders" on public.orders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users own test drives" on public.test_drives;
create policy "users own test drives" on public.test_drives
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users own profile" on public.profiles;
create policy "users own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Seed inventory (prices in kobo)
insert into public.vehicles (make, model, year, price_kobo, mileage_km, fuel, transmission, body_type, color, image_url, featured, description) values
('Toyota', 'Camry 2.5LE', 2022, 1850000000, 32000, 'Petrol', 'Automatic', 'Sedan', 'Silver', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', true, 'One owner, full service history, reverse camera.'),
('Honda', 'CR-V EX', 2023, 2400000000, 15000, 'Petrol', 'Automatic', 'SUV', 'White', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800', true, 'Balance of factory warranty, leather interior.'),
('Mercedes-Benz', 'C300', 2021, 3200000000, 45000, 'Petrol', 'Automatic', 'Sedan', 'Black', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', true, 'AMG line, sunroof, accident-free.'),
('Toyota', 'Hilux 2.8', 2023, 2850000000, 10000, 'Diesel', 'Manual', 'Pickup', 'Red', 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800', false, '4x4 double cab, ready for work.'),
('Tesla', 'Model 3', 2023, 3500000000, 8000, 'Electric', 'Automatic', 'Sedan', 'Blue', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800', true, 'Long Range, autopilot included.'),
('Kia', 'Sportage', 2022, 1650000000, 28000, 'Hybrid', 'Automatic', 'SUV', 'Grey', 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800', false, 'Fuel efficient hybrid, family SUV.');
