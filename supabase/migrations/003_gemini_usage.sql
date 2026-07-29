-- Daily Gemini proxy usage per user (founder-safe starter quota)
-- Run after 001_profiles.sql

create table if not exists public.gemini_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null default (timezone('utc', now()))::date,
  call_count integer not null default 0 check (call_count >= 0),
  primary key (user_id, usage_date)
);

create index if not exists gemini_usage_user_date_idx
  on public.gemini_usage (user_id, usage_date desc);

alter table public.gemini_usage enable row level security;

create policy "Users can read own gemini usage"
  on public.gemini_usage for select
  using (auth.uid() = user_id);

-- Edge Function uses service role + security definer RPC for increments.

create or replace function public.check_and_increment_gemini_usage(
  p_user_id uuid,
  p_daily_limit integer default 2
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_limit integer;
begin
  if p_user_id is null then
    return jsonb_build_object('allowed', false, 'error', 'missing_user');
  end if;

  v_limit := greatest(coalesce(p_daily_limit, 2), 1);

  insert into public.gemini_usage (user_id, usage_date, call_count)
  values (p_user_id, (timezone('utc', now()))::date, 0)
  on conflict (user_id, usage_date) do nothing;

  select call_count
  into v_count
  from public.gemini_usage
  where user_id = p_user_id
    and usage_date = (timezone('utc', now()))::date
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
    and usage_date = (timezone('utc', now()))::date
  returning call_count into v_count;

  return jsonb_build_object(
    'allowed', true,
    'count', v_count,
    'limit', v_limit
  );
end;
$$;

revoke all on function public.check_and_increment_gemini_usage(uuid, integer) from public;
grant execute on function public.check_and_increment_gemini_usage(uuid, integer) to service_role;
