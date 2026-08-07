-- T54 — Report feedback opt-in sync (dogfooding)
-- Run after 005_proxy_abuse.sql
-- Local-only feedback (T35) remains the default; cloud sync is explicit opt-in in the UI.

create table if not exists public.report_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_slug text not null,
  product_name text,
  helpful text not null check (helpful in ('yes', 'no', 'unsure')),
  note text not null default '' check (char_length(note) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

create index if not exists report_feedback_user_updated_idx
  on public.report_feedback (user_id, updated_at desc);

create index if not exists report_feedback_helpful_idx
  on public.report_feedback (helpful);

alter table public.report_feedback enable row level security;

create policy "Users can read own report feedback"
  on public.report_feedback for select
  using (auth.uid() = user_id);

create policy "Users can insert own report feedback"
  on public.report_feedback for insert
  with check (auth.uid() = user_id);

create policy "Users can update own report feedback"
  on public.report_feedback for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own report feedback"
  on public.report_feedback for delete
  using (auth.uid() = user_id);

create or replace function public.set_report_feedback_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists report_feedback_updated_at on public.report_feedback;
create trigger report_feedback_updated_at
  before update on public.report_feedback
  for each row execute function public.set_report_feedback_updated_at();

-- Aggregate counts only (no notes / no user ids) — founder / ops via SQL Editor as postgres,
-- or call with service role. Not granted to anon.
create or replace function public.report_feedback_aggregates()
returns table (helpful text, feedback_count bigint)
language sql
security definer
set search_path = public
as $$
  select rf.helpful, count(*)::bigint
  from public.report_feedback rf
  group by rf.helpful
  order by rf.helpful;
$$;

revoke all on function public.report_feedback_aggregates() from public;
grant execute on function public.report_feedback_aggregates() to service_role;
