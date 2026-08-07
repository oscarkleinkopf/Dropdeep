-- T55 — Privacy-friendly product analytics (no third-party cookies)
-- Anonymous funnel events. Reads: service_role / SQL Editor only (no user SELECT policies).

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (
    event_name in (
      'view_discover',
      'parse_ae',
      'start_research',
      'copilot_paste_ok',
      'save_portfolio'
    )
  ),
  -- Random client session id (localStorage) — not auth.users id
  session_id text,
  -- Optional when logged in; must match auth.uid() on insert
  user_id uuid references auth.users (id) on delete set null,
  -- Non-PII props only (path, ok, done, etc.) — never notes, emails, URLs, API keys
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_name_created_idx
  on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;

-- Insert-only for clients (anon + authenticated). No SELECT policies → users cannot read rows.
create policy "Clients can insert analytics events"
  on public.analytics_events for insert
  to anon, authenticated
  with check (
    event_name in (
      'view_discover',
      'parse_ae',
      'start_research',
      'copilot_paste_ok',
      'save_portfolio'
    )
    and (user_id is null or user_id = auth.uid())
    and jsonb_typeof(props) = 'object'
  );

-- Daily funnel rollup for founder (SQL Editor / service_role)
create or replace function public.analytics_funnel_daily(days_back integer default 14)
returns table (
  day date,
  event_name text,
  event_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (created_at at time zone 'utc')::date as day,
    ae.event_name,
    count(*)::bigint as event_count
  from public.analytics_events ae
  where ae.created_at >= (now() - make_interval(days => greatest(1, least(coalesce(days_back, 14), 90))))
  group by 1, 2
  order by 1 desc, 2;
$$;

revoke all on function public.analytics_funnel_daily(integer) from public;
grant execute on function public.analytics_funnel_daily(integer) to service_role;
