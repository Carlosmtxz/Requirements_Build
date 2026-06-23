-- Run this in your Supabase SQL editor

create table submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  company text,
  contact text,
  phone text,
  email text,
  location text,
  sales_rep text,
  floor_length numeric,
  floor_width numeric,
  ceiling_height numeric,
  infeed_direction text,
  discharge_direction text,
  layout_notes text,
  machine_config jsonb,
  commodity_type text,
  commodity_condition text,
  piece_size_min numeric,
  piece_size_max numeric,
  handling_notes text,
  bag_sizes jsonb,
  voltage text,
  special_requirements text,
  photos jsonb
);

-- Allow public inserts (salespeople submitting forms)
alter table submissions enable row level security;

create policy "Allow public inserts" on submissions
  for insert with check (true);

create policy "Allow public reads" on submissions
  for select using (true);

-- Storage bucket for photos
insert into storage.buckets (id, name, public)
values ('submission-photos', 'submission-photos', true);

create policy "Allow public uploads" on storage.objects
  for insert with check (bucket_id = 'submission-photos');

create policy "Allow public reads" on storage.objects
  for select using (bucket_id = 'submission-photos');
