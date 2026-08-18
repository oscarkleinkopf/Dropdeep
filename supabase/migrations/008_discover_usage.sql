-- T45 — Daily AliExpress Affiliate search quota (discover-proxy)
-- Run after 005_proxy_abuse.sql
-- Number 008: 006/007 reserved for feedback/analytics (PR #56).

create table if not exists public.discover_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null default (timezone('utc', now()))::date,
  call_count integer not null default 0 check (call_count >= 0),
  primary key (user_id, usage_date)
);

create index if not exists discover_usage_user_date_idx
  on public.discover_usage (user_id, usage_date desc);

alter table public.discover_usage enable row level security;

create policy "Users can read own discover usage"
  on public.discover_usage for select
  using (auth.uid() = user_id);

create or replace function public.check_and_increment_discover_usage(
  p_user_id uuid,
  p_daily_limit integer default 40
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

  v_limit := greatest(coalesce(p_daily_limit, 40), 1);

  insert into public.discover_usage (user_id, usage_date, call_count)
  values (p_user_id, (timezone('utc', now()))::date, 0)
  on conflict (user_id, usage_date) do nothing;

  select call_count
  into v_count
  from public.discover_usage
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

  update public.discover_usage
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

revoke all on function public.check_and_increment_discover_usage(uuid, integer) from public;
grant execute on function public.check_and_increment_discover_usage(uuid, integer) to service_role;
