-- Global Student Portal: private profiles, billing state, saved items,
-- moderated listings and private messages. All user-facing tables use RLS.

create extension if not exists pgcrypto;

create or replace function public.portal_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.portal_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  country_code text check (country_code is null or char_length(country_code) = 2),
  city text,
  institution text,
  program text,
  locale text not null default 'tr',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'plus', 'pro')),
  status text not null default 'inactive'
    check (status in ('inactive', 'trialing', 'active', 'past_due', 'cancelled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('institution', 'program', 'listing', 'guide')),
  item_id text not null,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create table if not exists public.portal_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('housing', 'marketplace', 'community', 'jobs', 'services')),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 20 and 3000),
  country_code text not null check (char_length(country_code) = 2),
  city text not null,
  institution text,
  program text,
  price_amount numeric(12,2) check (price_amount is null or price_amount >= 0),
  currency text check (currency is null or char_length(currency) = 3),
  status text not null default 'review'
    check (status in ('draft', 'review', 'published', 'closed', 'rejected')),
  verified boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.portal_listings(id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create table if not exists public.portal_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes between 0 and 15728640),
  review_status text not null default 'private'
    check (review_status in ('private', 'submitted', 'reviewed', 'action_needed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_listings_location_idx
  on public.portal_listings (country_code, city, kind, status);
create index if not exists portal_listings_owner_idx
  on public.portal_listings (owner_id, created_at desc);
create index if not exists portal_messages_recipient_idx
  on public.portal_messages (recipient_id, created_at desc);
create index if not exists portal_messages_sender_idx
  on public.portal_messages (sender_id, created_at desc);
create index if not exists portal_saved_items_user_idx
  on public.portal_saved_items (user_id, created_at desc);

drop trigger if exists portal_profiles_updated_at on public.portal_profiles;
create trigger portal_profiles_updated_at
before update on public.portal_profiles
for each row execute function public.portal_set_updated_at();

drop trigger if exists portal_subscriptions_updated_at on public.portal_subscriptions;
create trigger portal_subscriptions_updated_at
before update on public.portal_subscriptions
for each row execute function public.portal_set_updated_at();

drop trigger if exists portal_listings_updated_at on public.portal_listings;
create trigger portal_listings_updated_at
before update on public.portal_listings
for each row execute function public.portal_set_updated_at();

drop trigger if exists portal_documents_updated_at on public.portal_documents;
create trigger portal_documents_updated_at
before update on public.portal_documents
for each row execute function public.portal_set_updated_at();

-- Users cannot self-verify or self-publish listings. Service-role moderation may.
create or replace function public.portal_protect_listing_moderation()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    if tg_op = 'INSERT' then
      new.verified = false;
      new.status = 'review';
    else
      new.verified = old.verified;
      new.status = old.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists portal_listing_moderation_guard on public.portal_listings;
create trigger portal_listing_moderation_guard
before insert or update on public.portal_listings
for each row execute function public.portal_protect_listing_moderation();

create or replace function public.portal_protect_message_update()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    new.sender_id = old.sender_id;
    new.recipient_id = old.recipient_id;
    new.listing_id = old.listing_id;
    new.body = old.body;
    new.created_at = old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists portal_message_immutable_guard on public.portal_messages;
create trigger portal_message_immutable_guard
before update on public.portal_messages
for each row execute function public.portal_protect_message_update();

create or replace function public.portal_protect_document_review()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' and tg_op = 'UPDATE' then
    new.review_status = old.review_status;
  end if;
  return new;
end;
$$;

drop trigger if exists portal_document_review_guard on public.portal_documents;
create trigger portal_document_review_guard
before update on public.portal_documents
for each row execute function public.portal_protect_document_review();

alter table public.portal_profiles enable row level security;
alter table public.portal_subscriptions enable row level security;
alter table public.portal_saved_items enable row level security;
alter table public.portal_listings enable row level security;
alter table public.portal_messages enable row level security;
alter table public.portal_documents enable row level security;

-- Data API access is opt-in. Grants decide which operations can reach a table;
-- RLS policies below decide which rows are visible or writable.
revoke all on table
  public.portal_profiles,
  public.portal_subscriptions,
  public.portal_saved_items,
  public.portal_listings,
  public.portal_messages,
  public.portal_documents
from anon, authenticated;

grant select on table public.portal_listings to anon;
grant select, insert, update on table public.portal_profiles to authenticated;
grant select on table public.portal_subscriptions to authenticated;
grant select, insert, update, delete on table public.portal_saved_items to authenticated;
grant select, insert, update, delete on table public.portal_listings to authenticated;
grant select, insert, update on table public.portal_messages to authenticated;
grant select, insert, update, delete on table public.portal_documents to authenticated;

grant select, insert, update, delete on table
  public.portal_profiles,
  public.portal_subscriptions,
  public.portal_saved_items,
  public.portal_listings,
  public.portal_messages,
  public.portal_documents
to service_role;

create policy "portal_profiles_select_own"
  on public.portal_profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "portal_profiles_insert_own"
  on public.portal_profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "portal_profiles_update_own"
  on public.portal_profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Billing rows are webhook/service-role controlled; users can only read their own.
create policy "portal_subscriptions_select_own"
  on public.portal_subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "portal_saved_select_own"
  on public.portal_saved_items for select to authenticated
  using (user_id = (select auth.uid()));
create policy "portal_saved_insert_own"
  on public.portal_saved_items for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "portal_saved_update_own"
  on public.portal_saved_items for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "portal_saved_delete_own"
  on public.portal_saved_items for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "portal_listings_read_published_or_own"
  on public.portal_listings for select to anon, authenticated
  using (status = 'published' or owner_id = (select auth.uid()));
create policy "portal_listings_insert_own"
  on public.portal_listings for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "portal_listings_update_own"
  on public.portal_listings for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "portal_listings_delete_own"
  on public.portal_listings for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "portal_messages_read_participant"
  on public.portal_messages for select to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy "portal_messages_send_as_self"
  on public.portal_messages for insert to authenticated
  with check (sender_id = (select auth.uid()));
create policy "portal_messages_recipient_mark_read"
  on public.portal_messages for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));

create policy "portal_documents_select_own"
  on public.portal_documents for select to authenticated
  using (user_id = (select auth.uid()));
create policy "portal_documents_insert_own"
  on public.portal_documents for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "portal_documents_update_own"
  on public.portal_documents for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "portal_documents_delete_own"
  on public.portal_documents for delete to authenticated
  using (user_id = (select auth.uid()));
