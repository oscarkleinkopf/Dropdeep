-- DropDeep research history (cloud sync for logged-in users)
-- Run after 001_profiles.sql

create table if not exists public.research_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_name text not null,
  product_slug text not null,
  category_id text default 'general',
  report_json jsonb not null,
  product_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

create index if not exists research_reports_user_updated_idx
  on public.research_reports (user_id, updated_at desc);

alter table public.research_reports enable row level security;

create policy "Users can read own research reports"
  on public.research_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own research reports"
  on public.research_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own research reports"
  on public.research_reports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own research reports"
  on public.research_reports for delete
  using (auth.uid() = user_id);

create or replace function public.set_research_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists research_reports_updated_at on public.research_reports;
create trigger research_reports_updated_at
  before update on public.research_reports
  for each row execute function public.set_research_reports_updated_at();
