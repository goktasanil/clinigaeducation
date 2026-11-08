create role anon;create role authenticated;create role service_role bypassrls;
create schema auth;grant usage on schema public,auth to anon,authenticated,service_role;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create table public.user_roles(user_id uuid,role text);grant select on public.user_roles to authenticated;
alter table public.user_roles enable row level security;
create policy own_roles on public.user_roles for select to authenticated using(user_id=auth.uid());
insert into public.user_roles values('00000000-0000-4000-8000-000000000001','admin');
create table public.leads(id uuid default gen_random_uuid(),confirmation_code text unique not null default('CG-'||upper(substr(md5(random()::text||clock_timestamp()::text),1,8))),
name text not null,email text not null,phone text not null,level text,country text,service text,deadline date,message text not null,language text,appointment_at timestamptz,
intent text,source text not null default 'contact_form',quiz_answers jsonb,status text not null default 'new',created_at timestamptz not null default now());
grant all on public.leads to anon,authenticated,service_role;alter table public.leads enable row level security;
create policy "Anyone can create a lead" on public.leads for insert to anon,authenticated with check(length(name) between 2 and 100 and length(email) between 3 and 255 and length(phone) between 5 and 20 and length(message) between 1 and 5000);
create policy "Admins can read leads" on public.leads for select to authenticated using(exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin'));
create policy "Admins can update leads" on public.leads for update to authenticated using(exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin')) with check(exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin'));
create unique index uniq_leads_appointment_slot on public.leads(appointment_at) where appointment_at is not null and status<>'cancelled';
