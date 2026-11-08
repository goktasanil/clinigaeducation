-- Synthetic catalog-compatible fixture: no production rows or account identity.
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
grant usage on schema public,auth to anon,authenticated,service_role;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
create type public.app_role as enum('admin','user');
create table public.user_roles(user_id uuid not null,role public.app_role not null,unique(user_id,role));
grant select,insert,update,delete on public.user_roles to anon,authenticated,service_role;
alter table public.user_roles enable row level security;
create policy "Users can read their own roles" on public.user_roles for select to authenticated using(user_id=auth.uid());
insert into public.user_roles values
 ('00000000-0000-4000-8000-000000000001','admin'),
 ('00000000-0000-4000-8000-000000000002','user'),
 ('00000000-0000-4000-8000-000000000003','admin');

create function public.has_role(_user_id uuid,_role public.app_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role);
$$;
revoke all on function public.has_role(uuid,public.app_role) from public,anon,authenticated;
grant execute on function public.has_role(uuid,public.app_role) to service_role;

create table public.leads(marker text,appointment_at timestamptz,status text);
insert into public.leads values('synthetic-lead',null,'new');
grant select on public.leads to anon,authenticated,service_role;
alter table public.leads enable row level security;
create policy "Admins can read leads" on public.leads for select to authenticated using(exists(
 select 1 from public.user_roles where user_id=auth.uid() and role='admin'::public.app_role
));
create function public.get_booked_slots() returns table(appointment_at timestamptz)
language sql stable security definer set search_path=public as $$
 select appointment_at from public.leads where appointment_at is not null and appointment_at>=now() and status<>'cancelled';
$$;
revoke all on function public.get_booked_slots() from public,anon,authenticated;
grant execute on function public.get_booked_slots() to service_role;

create table public.gsc_url_snapshots(marker text);
create table public.gsc_perf_snapshots(marker text);
create table public.sanitize_audit_events(marker text);
create table public.sanitize_alerts(marker text);
insert into public.gsc_url_snapshots values('synthetic-admin-report');
insert into public.gsc_perf_snapshots values('synthetic-admin-report');
insert into public.sanitize_audit_events values('synthetic-admin-report');
insert into public.sanitize_alerts values('synthetic-admin-report');
grant select on public.gsc_url_snapshots,public.gsc_perf_snapshots,public.sanitize_audit_events,public.sanitize_alerts to anon,authenticated,service_role;
alter table public.gsc_url_snapshots enable row level security;
alter table public.gsc_perf_snapshots enable row level security;
alter table public.sanitize_audit_events enable row level security;
alter table public.sanitize_alerts enable row level security;
create policy "Admins can view url snapshots" on public.gsc_url_snapshots for select to authenticated using(public.has_role(auth.uid(),'admin'));
create policy "Admins can view perf snapshots" on public.gsc_perf_snapshots for select to authenticated using(public.has_role(auth.uid(),'admin'));
create policy "Admins can view sanitize audit events" on public.sanitize_audit_events for select to authenticated using(public.has_role(auth.uid(),'admin'));
create policy "Admins can view sanitize alerts" on public.sanitize_alerts for select to authenticated using(public.has_role(auth.uid(),'admin'));
