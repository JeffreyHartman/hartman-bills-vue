-- Create bills table
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  creation_date timestamptz not null default now(),
  due_date timestamptz,
  amount numeric not null,
  recurring jsonb,
  paid_dates jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast per-user queries
create index bills_user_id_idx on public.bills(user_id);

-- Enable RLS
alter table public.bills enable row level security;

-- RLS policies: users can only access their own bills
create policy "Users can view their own bills"
  on public.bills for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bills"
  on public.bills for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bills"
  on public.bills for update
  using (auth.uid() = user_id);

create policy "Users can delete their own bills"
  on public.bills for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at on row changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bills_updated_at
  before update on public.bills
  for each row execute function public.handle_updated_at();
