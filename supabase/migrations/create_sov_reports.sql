-- Share of Voice reports table
create table if not exists sov_reports (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'queued',
  client_name text not null,
  date_from text not null,
  date_to text not null,
  selected_networks text[] not null default '{}',
  brand jsonb not null default '{}',
  competitors jsonb not null default '[]',
  apify_run_ids jsonb not null default '{}',
  apify_completed_runs text[] not null default '{}',
  total_expected_runs integer not null default 0,
  raw_data jsonb not null default '{}',
  analysis jsonb,
  generation_cost_usd numeric,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
