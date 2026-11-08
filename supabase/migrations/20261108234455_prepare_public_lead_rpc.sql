-- Phase 1: deploy this bounded public form RPC before switching the frontend.
-- Existing client INSERT stays available until the separate cutover migration.
create index if not exists leads_normalized_email_created_idx
on public.leads(lower(btrim(email)),created_at);

create or replace function public.submit_education_lead(p_payload jsonb)
returns table(confirmation_code text,appointment_at timestamptz)
language plpgsql volatile security definer set search_path=''
as $$
declare
  v_name text; v_email text; v_phone text; v_message text;
  v_key text; v_limit integer; v_answer jsonb; v_answer_key text;
  v_deadline date; v_appointment timestamptz; v_started bigint;
  v_now_ms bigint := floor(extract(epoch from clock_timestamp())*1000)::bigint;
  v_code text; v_constraint text; v_attempt integer;
begin
  if current_setting('transaction_isolation') <> 'read committed' then
    raise sqlstate 'PT503' using message='Please try again later.';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object'
     or pg_column_size(p_payload) > 65536 then
    raise sqlstate 'PT400' using message='Invalid request.';
  end if;
  if octet_length(convert_to(p_payload::text,'UTF8')) > 65536 then
    raise sqlstate 'PT400' using message='Invalid request.';
  end if;
  for v_key in select jsonb_object_keys(p_payload) loop
    if v_key not in ('name','email','phone','message','level','country','service','deadline',
      'language','appointmentAt','intent','source','quizAnswers','honeypot','startedAt') then
      raise sqlstate 'PT400' using message='Invalid request.';
    end if;
  end loop;
  foreach v_key in array array['name','email','phone','message','honeypot'] loop
    if jsonb_typeof(p_payload->v_key) is distinct from 'string' then
      raise sqlstate 'PT400' using message='Invalid request.';
    end if;
  end loop;
  v_name := btrim(p_payload->>'name');
  v_email := lower(btrim(p_payload->>'email'));
  v_phone := regexp_replace(btrim(p_payload->>'phone'),'[()[:space:]-]','','g');
  v_message := btrim(p_payload->>'message');
  if length(v_name) not between 2 and 100 or v_name ~ '[[:cntrl:]]'
     or length(v_email) not between 3 and 255
     or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
     or length(p_payload->>'phone') > 24 or v_phone !~ '^[+]?[1-9][0-9]{7,14}$'
     or length(v_message) not between 10 and 5000
     or length(p_payload->>'honeypot') > 200 or btrim(p_payload->>'honeypot') <> ''
     or jsonb_typeof(p_payload->'startedAt') is distinct from 'number'
     or coalesce(p_payload->>'startedAt','') !~ '^[0-9]{10,16}$' then
    raise sqlstate 'PT400' using message='Invalid request.';
  end if;
  v_started := (p_payload->>'startedAt')::bigint;
  if v_started > v_now_ms-2000 or v_started < v_now_ms-86400000 then
    raise sqlstate 'PT400' using message='Invalid request.';
  end if;
  foreach v_key in array array['level','country','service','deadline','language','appointmentAt','intent','source'] loop
    if p_payload ? v_key and p_payload->v_key <> 'null'::jsonb then
      v_limit := case v_key when 'service' then 200 when 'language' then 10
        when 'deadline' then 20 when 'appointmentAt' then 40 when 'intent' then 50
        when 'source' then 50 else 100 end;
      if jsonb_typeof(p_payload->v_key) <> 'string' or length(p_payload->>v_key) > v_limit then
        raise sqlstate 'PT400' using message='Invalid request.';
      end if;
    end if;
  end loop;
  if coalesce(p_payload->>'source','contact_form') not in ('contact_form','quiz') then
    raise sqlstate 'PT400' using message='Invalid request.';
  end if;
  begin
    if nullif(p_payload->>'deadline','') is not null then
      if p_payload->>'deadline' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
        raise sqlstate 'PT400' using message='Invalid request.';
      end if;
      v_deadline := (p_payload->>'deadline')::date;
      if v_deadline < current_date then raise sqlstate 'PT400' using message='Invalid request.'; end if;
    end if;
    if nullif(p_payload->>'appointmentAt','') is not null then
      if p_payload->>'appointmentAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T' then
        raise sqlstate 'PT400' using message='Invalid request.';
      end if;
      v_appointment := (p_payload->>'appointmentAt')::timestamptz;
      if v_appointment <= now()+interval '5 minutes' or v_appointment > now()+interval '45 days' then
        raise sqlstate 'PT400' using message='Invalid request.';
      end if;
    end if;
  exception when invalid_datetime_format or datetime_field_overflow then
    raise sqlstate 'PT400' using message='Invalid request.';
  end;
  if p_payload ? 'quizAnswers' and p_payload->'quizAnswers' <> 'null'::jsonb then
    if jsonb_typeof(p_payload->'quizAnswers') <> 'array' then
      raise sqlstate 'PT400' using message='Invalid request.';
    end if;
    if jsonb_array_length(p_payload->'quizAnswers') > 50 then
      raise sqlstate 'PT400' using message='Invalid request.';
    end if;
    for v_answer in select value from jsonb_array_elements(p_payload->'quizAnswers') loop
      if jsonb_typeof(v_answer) <> 'object' then raise sqlstate 'PT400' using message='Invalid request.'; end if;
      for v_answer_key in select jsonb_object_keys(v_answer) loop
        if v_answer_key not in ('step','question','answer','answerIndex','key','at') then
          raise sqlstate 'PT400' using message='Invalid request.';
        end if;
      end loop;
      if jsonb_typeof(v_answer->'step') is distinct from 'number'
         or coalesce(v_answer->>'step','') !~ '^[0-9]{1,3}$'
         or jsonb_typeof(v_answer->'question') is distinct from 'string'
         or length(v_answer->>'question') > 500
         or jsonb_typeof(v_answer->'answer') is distinct from 'string'
         or length(v_answer->>'answer') > 500 then
        raise sqlstate 'PT400' using message='Invalid request.';
      end if;
      if v_answer ? 'answerIndex' and v_answer->'answerIndex' <> 'null'::jsonb
         and (jsonb_typeof(v_answer->'answerIndex') <> 'number' or v_answer->>'answerIndex' !~ '^[0-9]{1,3}$') then
        raise sqlstate 'PT400' using message='Invalid request.';
      end if;
      foreach v_answer_key in array array['key','at'] loop
        if v_answer ? v_answer_key and v_answer->v_answer_key <> 'null'::jsonb then
          if jsonb_typeof(v_answer->v_answer_key) <> 'string'
             or length(v_answer->>v_answer_key) > (case v_answer_key when 'at' then 40 else 100 end) then
            raise sqlstate 'PT400' using message='Invalid request.';
          end if;
        end if;
      end loop;
    end loop;
  end if;
  -- Lock namespace is fixed server-side. No caller-selected user, role or IP exists.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('education-public-lead-v1',0));
  if (select count(*) from public.leads l where l.created_at >= now()-interval '1 hour') >= 60
     or (select count(*) from public.leads l where l.created_at >= now()-interval '1 hour'
         and lower(btrim(l.email))=v_email) >= 3 then
    raise sqlstate 'PT429' using message='Please try again later.';
  end if;
  for v_attempt in 1..3 loop
    begin
      insert into public.leads(name,email,phone,level,country,service,deadline,message,language,
        appointment_at,intent,source,quiz_answers)
      values(v_name,v_email,v_phone,nullif(p_payload->>'level',''),nullif(p_payload->>'country',''),
        nullif(p_payload->>'service',''),v_deadline,v_message,nullif(p_payload->>'language',''),
        v_appointment,nullif(p_payload->>'intent',''),coalesce(p_payload->>'source','contact_form'),
        case when p_payload->'quizAnswers'='null'::jsonb then null else p_payload->'quizAnswers' end)
      returning leads.confirmation_code,leads.appointment_at into v_code,v_appointment;
      return query select v_code,v_appointment;
      return;
    exception when unique_violation then
      get stacked diagnostics v_constraint=constraint_name;
      if v_constraint='uniq_leads_appointment_slot' then
        raise sqlstate 'PT409' using message='This appointment is unavailable.';
      elsif v_constraint <> 'leads_confirmation_code_key' then
        raise sqlstate 'PT503' using message='Please try again later.';
      end if;
    when others then
      raise sqlstate 'PT503' using message='Please try again later.';
    end;
  end loop;
  raise sqlstate 'PT503' using message='Please try again later.';
end;
$$;
revoke all on function public.submit_education_lead(jsonb) from public;
grant execute on function public.submit_education_lead(jsonb) to anon,authenticated,service_role;
