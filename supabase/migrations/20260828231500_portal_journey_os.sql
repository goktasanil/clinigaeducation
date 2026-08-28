-- Student Journey OS: user-owned applications, tasks and document links.
-- Non-destructive migration: existing portal data remains untouched.

create table if not exists public.portal_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_id text,
  institution_name text not null,
  program_name text,
  country_code text,
  intake text,
  status text not null default 'draft'
    check (status in ('draft','documents','ready','submitted','under_review','offer','accepted','rejected','withdrawn')),
  deadline timestamptz,
  priority text not null default 'medium'
    check (priority in ('low','medium','high')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  category text not null default 'general'
    check (category in ('application','document','visa','housing','arrival','general')),
  due_at timestamptz,
  status text not null default 'todo'
    check (status in ('todo','in_progress','done','snoozed')),
  priority text not null default 'medium'
    check (priority in ('low','medium','high')),
  related_application_id uuid references public.portal_applications(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portal_documents
  add column if not exists application_id uuid references public.portal_applications(id) on delete set null,
  add column if not exists expires_at date;

create index if not exists portal_applications_user_status_idx
  on public.portal_applications(user_id, status);
create index if not exists portal_applications_user_deadline_idx
  on public.portal_applications(user_id, deadline);
create index if not exists portal_tasks_user_status_due_idx
  on public.portal_tasks(user_id, status, due_at);
create index if not exists portal_tasks_application_idx
  on public.portal_tasks(related_application_id);
create index if not exists portal_documents_application_idx
  on public.portal_documents(application_id);

alter table public.portal_applications enable row level security;
alter table public.portal_tasks enable row level security;

drop policy if exists portal_applications_select_own on public.portal_applications;
create policy portal_applications_select_own
  on public.portal_applications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists portal_applications_insert_own on public.portal_applications;
create policy portal_applications_insert_own
  on public.portal_applications for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists portal_applications_update_own on public.portal_applications;
create policy portal_applications_update_own
  on public.portal_applications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists portal_applications_delete_own on public.portal_applications;
create policy portal_applications_delete_own
  on public.portal_applications for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists portal_tasks_select_own on public.portal_tasks;
create policy portal_tasks_select_own
  on public.portal_tasks for select to authenticated
  using (user_id = auth.uid());

drop policy if exists portal_tasks_insert_own on public.portal_tasks;
create policy portal_tasks_insert_own
  on public.portal_tasks for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists portal_tasks_update_own on public.portal_tasks;
create policy portal_tasks_update_own
  on public.portal_tasks for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists portal_tasks_delete_own on public.portal_tasks;
create policy portal_tasks_delete_own
  on public.portal_tasks for delete to authenticated
  using (user_id = auth.uid());
