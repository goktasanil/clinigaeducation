-- Phase 2: apply only after the RPC is prepared and the RPC frontend is live.
drop policy if exists "Anyone can create a lead" on public.leads;
revoke insert on public.leads from public,anon,authenticated;
create policy "Lead creation requires bounded RPC" on public.leads
as restrictive for insert to anon,authenticated with check(false);
