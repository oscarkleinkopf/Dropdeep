-- Quota per Deep Research investigation (session), not per Gemini RPC call.
-- Run after 003_gemini_usage.sql

create table if not exists public.gemini_research_sessions (
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null,
  usage_date date not null default (timezone('utc', now()))::date,
  created_at timestamptz not null default now(),
  primary key (user_id, session_id)
);

create index if not exists gemini_research_sessions_user_date_idx
  on public.gemini_research_sessions (user_id, usage_date desc);

alter table public.gemini_research_sessions enable row level security;

create policy "Users can read own gemini research sessions"
  on public.gemini_research_sessions for select
  using (auth.uid() = user_id);

create or replace function public.check_and_increment_gemini_usage(
  p_user_id uuid,
  p_daily_limit integer default 2,
  p_session_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_limit integer;
  v_today date := (timezone('utc', now()))::date;
begin
  if p_user_id is null then
    return jsonb_build_object('allowed', false, 'error', 'missing_user');
  end if;

  v_limit := greatest(coalesce(p_daily_limit, 2), 1);

  insert into public.gemini_usage (user_id, usage_date, call_count)
  values (p_user_id, v_today, 0)
  on conflict (user_id, usage_date) do nothing;

  -- Same research session: allow without consuming another investigation slot.
  if p_session_id is not null then
    if exists (
      select 1
      from public.gemini_research_sessions
      where user_id = p_user_id
        and session_id = p_session_id
        and usage_date = v_today
    ) then
      select call_count
      into v_count
      from public.gemini_usage
      where user_id = p_user_id
        and usage_date = v_today;

      return jsonb_build_object(
        'allowed', true,
        'count', v_count,
        'limit', v_limit,
        'session_reused', true
      );
    end if;
  end if;

  select call_count
  into v_count
  from public.gemini_usage
  where user_id = p_user_id
    and usage_date = v_today
  for update;

  if v_count >= v_limit then
    return jsonb_build_object(
      'allowed', false,
      'count', v_count,
      'limit', v_limit,
      'error', 'daily_limit_exceeded'
    );
  end if;

  update public.gemini_usage
  set call_count = call_count + 1
  where user_id = p_user_id
    and usage_date = v_today
  returning call_count into v_count;

  if p_session_id is not null then
    insert into public.gemini_research_sessions (user_id, session_id, usage_date)
    values (p_user_id, p_session_id, v_today)
    on conflict (user_id, session_id) do nothing;
  end if;

  return jsonb_build_object(
    'allowed', true,
    'count', v_count,
    'limit', v_limit,
    'session_reused', false
  );
end;
$$;

revoke all on function public.check_and_increment_gemini_usage(uuid, integer, uuid) from public;
grant execute on function public.check_and_increment_gemini_usage(uuid, integer, uuid) to service_role;
