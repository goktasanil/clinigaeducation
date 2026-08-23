-- Institution-specific degree programme catalogue.
-- Public clients may only read rows that have been verified against an official source.

create table if not exists public.institution_programs (
  id uuid primary key default gen_random_uuid(),
  institution_external_id text not null,
  institution_name text not null,
  country_code text not null check (char_length(country_code) = 2),
  city text,
  program_name text not null,
  degree_level text,
  language text,
  official_url text,
  source_name text not null default 'official institution website',
  source_checked_at timestamptz,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_external_id, program_name, degree_level)
);

create index if not exists institution_programs_institution_idx
  on public.institution_programs (institution_external_id, program_name);
create index if not exists institution_programs_location_idx
  on public.institution_programs (country_code, city, institution_name);

drop trigger if exists institution_programs_updated_at on public.institution_programs;
create trigger institution_programs_updated_at
before update on public.institution_programs
for each row execute function public.portal_set_updated_at();

alter table public.institution_programs enable row level security;

revoke all on table public.institution_programs from anon, authenticated;
grant select on table public.institution_programs to anon, authenticated;
grant select, insert, update, delete on table public.institution_programs to service_role;

drop policy if exists "institution_programs_read_verified" on public.institution_programs;
create policy "institution_programs_read_verified"
  on public.institution_programs for select to anon, authenticated
  using (verified = true);
