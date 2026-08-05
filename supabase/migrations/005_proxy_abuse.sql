-- T20 — Proxy abuse limits (rate window + new-session cooldown)
-- Run after 004_research_session_quota.sql
-- Edge Function gemini-proxy calls these RPCs with service_role.

create table if not exists public.gemini_proxy_hits (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists gemini_proxy_hits_user_created_idx
  on public.gemini_proxy_hits (user_id, created_at desc);

alter table public.gemini_proxy_hits enable row level security;

-- No client policies: service_role only (Edge Function).

/**
 * Sliding window: max N requests per user in the last W seconds.
 * Also records this hit when allowed.
 */
create or replace function public.check_proxy_rate_limit(
  p_user_id uuid,
  p_max_requests integer default 10,
  p_window_seconds integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max integer := greatest(coalesce(p_max_requests, 10), 1);
  v_window integer := greatest(coalesce(p_window_seconds, 10), 1);
  v_count integer;
  v_cutoff timestamptz := timezone('utc', now()) - make_interval(secs => v_window);
begin
  if p_user_id is null then
    return jsonb_build_object('allowed', false, 'error', 'missing_user');
  end if;

  -- Drop old rows for this user (keep table small)
  delete from public.gemini_proxy_hits
  where user_id = p_user_id
    and created_at < v_cutoff;

  select count(*)::integer
  into v_count
  from public.gemini_proxy_hits
  where user_id = p_user_id
    and created_at >= v_cutoff;

  if v_count >= v_max then
    return jsonb_build_object(
      'allowed', false,
      'error', 'rate_limit_exceeded',
      'count', v_count,
      'limit', v_max,
      'window_seconds', v_window
    );
  end if;

  insert into public.gemini_proxy_hits (user_id) values (p_user_id);

  return jsonb_build_object(
    'allowed', true,
    'count', v_count + 1,
    'limit', v_max,
    'window_seconds', v_window
  );
end;
$$;

/**
 * Cooldown between NEW research sessions (same session_id may retry freely).
 * Uses gemini_research_sessions.created_at from migration 004.
 */
create or replace function public.check_new_session_cooldown(
  p_user_id uuid,
  p_session_id uuid,
  p_cooldown_seconds integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cooldown integer := greatest(coalesce(p_cooldown_seconds, 30), 0);
  v_last timestamptz;
  v_elapsed numeric;
begin
  if p_user_id is null then
    return jsonb_build_object('allowed', false, 'error', 'missing_user');
  end if;

  -- No session id → skip cooldown (still subject to rate limit + daily quota)
  if p_session_id is null then
    return jsonb_build_object('allowed', true, 'skipped', true);
  end if;

  -- Existing session today: allow (multi-step research)
  if exists (
    select 1
    from public.gemini_research_sessions
    where user_id = p_user_id
      and session_id = p_session_id
  ) then
    return jsonb_build_object('allowed', true, 'session_reused', true);
  end if;

  if v_cooldown = 0 then
    return jsonb_build_object('allowed', true);
  end if;

  select max(created_at)
  into v_last
  from public.gemini_research_sessions
  where user_id = p_user_id;

  if v_last is null then
    return jsonb_build_object('allowed', true);
  end if;

  v_elapsed := extract(epoch from (timezone('utc', now()) - v_last));
  if v_elapsed < v_cooldown then
    return jsonb_build_object(
      'allowed', false,
      'error', 'session_cooldown',
      'cooldown_seconds', v_cooldown,
      'retry_after_seconds', greatest(1, ceil(v_cooldown - v_elapsed)::integer)
    );
  end if;

  return jsonb_build_object('allowed', true, 'elapsed_seconds', v_elapsed);
end;
$$;

revoke all on function public.check_proxy_rate_limit(uuid, integer, integer) from public;
grant execute on function public.check_proxy_rate_limit(uuid, integer, integer) to service_role;

revoke all on function public.check_new_session_cooldown(uuid, uuid, integer) from public;
grant execute on function public.check_new_session_cooldown(uuid, uuid, integer) to service_role;
