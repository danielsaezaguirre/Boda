create table if not exists public.wedding_rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(trim(guest_name)) between 1 and 120),
  guest_email text not null check (char_length(trim(guest_email)) between 3 and 254),
  attending boolean not null,
  companions integer not null default 0 check (companions between 0 and 20),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

alter table public.wedding_rsvps
  add column if not exists companions integer not null default 0 check (companions between 0 and 20);

alter table public.wedding_rsvps enable row level security;

revoke all on table public.wedding_rsvps from public, anon, authenticated;
grant insert on table public.wedding_rsvps to anon, authenticated;
grant select on table public.wedding_rsvps to authenticated;

drop policy if exists "Guests can submit an RSVP" on public.wedding_rsvps;
create policy "Guests can submit an RSVP"
  on public.wedding_rsvps
  for insert
  to anon, authenticated
  with check (true);

create table if not exists public.wedding_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.wedding_admins enable row level security;

revoke all on table public.wedding_admins from public, anon, authenticated;
grant select on table public.wedding_admins to authenticated;

drop policy if exists "Admins can read their own access" on public.wedding_admins;
create policy "Admins can read their own access"
  on public.wedding_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Admins can read RSVPs" on public.wedding_rsvps;
create policy "Admins can read RSVPs"
  on public.wedding_rsvps
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.wedding_admins
      where user_id = (select auth.uid())
    )
  );
