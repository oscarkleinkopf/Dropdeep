-- Founder observability (T54 / T55) — run in Supabase SQL Editor as postgres / service role.
-- No PII in aggregates: no notes, emails, or raw URLs.

-- Feedback dogfooding rollup
select * from public.report_feedback_aggregates();

-- Funnel last 14 days (UTC)
select * from public.analytics_funnel_daily(14);

-- Drop-off style ratios (same day)
with daily as (
  select * from public.analytics_funnel_daily(30)
)
select
  day,
  coalesce(sum(event_count) filter (where event_name = 'view_discover'), 0) as view_discover,
  coalesce(sum(event_count) filter (where event_name = 'parse_ae'), 0) as parse_ae,
  coalesce(sum(event_count) filter (where event_name = 'start_research'), 0) as start_research,
  coalesce(sum(event_count) filter (where event_name = 'copilot_paste_ok'), 0) as copilot_paste_ok,
  coalesce(sum(event_count) filter (where event_name = 'save_portfolio'), 0) as save_portfolio
from daily
group by day
order by day desc;
