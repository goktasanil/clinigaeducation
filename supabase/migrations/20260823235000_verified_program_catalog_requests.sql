-- Verified institution-specific programme catalogue request queue.
-- Generic academic fields are intentionally not stored as degree programmes.
begin;

create table if not exists public.portal_program_catalog_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_external_id text not null,
  institution_name text not null,
  country_code text not null check (char_length(country_code) = 2),
  city text,
  official_url text,
  status text not null default 'pending'
    check (status in ('pending', 'researching', 'completed', 'rejected')),
  reviewer_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (user_id, institution_external_id)
);

create index if not exists portal_program_catalog_requests_status_idx
  on public.portal_program_catalog_requests (status, submitted_at);

alter table public.portal_program_catalog_requests enable row level security;
revoke all on table public.portal_program_catalog_requests from anon, authenticated;
grant select, insert, update on table public.portal_program_catalog_requests to authenticated;
grant all on table public.portal_program_catalog_requests to service_role;

drop policy if exists "program_catalog_requests_own_select" on public.portal_program_catalog_requests;
create policy "program_catalog_requests_own_select"
  on public.portal_program_catalog_requests for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "program_catalog_requests_own_insert" on public.portal_program_catalog_requests;
create policy "program_catalog_requests_own_insert"
  on public.portal_program_catalog_requests for insert to authenticated
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "program_catalog_requests_own_update" on public.portal_program_catalog_requests;
create policy "program_catalog_requests_own_update"
  on public.portal_program_catalog_requests for update to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

-- Only one active verification request per account. Historical reviewed rows remain valid.
alter table public.portal_verification_requests
  drop constraint if exists portal_verification_requests_user_id_status_key;
create unique index if not exists portal_verification_requests_one_pending_idx
  on public.portal_verification_requests (user_id)
  where status = 'pending';

create or replace function public.portal_mark_verification_pending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.portal_profiles
     set verification_status = 'pending'
   where user_id = new.user_id
     and verification_status not in ('verified', 'suspended');
  return new;
end;
$$;

revoke all on function public.portal_mark_verification_pending() from public, anon, authenticated;
drop trigger if exists portal_verification_request_marks_profile on public.portal_verification_requests;
create trigger portal_verification_request_marks_profile
after insert on public.portal_verification_requests
for each row execute function public.portal_mark_verification_pending();

commit;
