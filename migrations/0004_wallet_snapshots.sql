-- Migration 0004: wallet snapshot cache (latest data per wallet).
-- Exchanges already had a snapshot fallback (snapshots table); wallets did not,
-- so a flaky RPC silently dropped an entire venue from the assembled context.
-- Apply via Supabase Management API (needs a Personal Access Token) or psql
-- against the project's direct connection string. Idempotent.

create table if not exists wallet_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  wallet_id uuid references wallets(id) on delete cascade not null unique,
  data jsonb not null,
  created_at timestamptz default now() not null
);

alter table wallet_snapshots enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'wallet_snapshots' and policyname = 'Users read own wallet_snapshots'
  ) then
    create policy "Users read own wallet_snapshots" on wallet_snapshots
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'wallet_snapshots' and policyname = 'Users insert own wallet_snapshots'
  ) then
    create policy "Users insert own wallet_snapshots" on wallet_snapshots
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'wallet_snapshots' and policyname = 'Users update own wallet_snapshots'
  ) then
    create policy "Users update own wallet_snapshots" on wallet_snapshots
      for update using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'wallet_snapshots' and policyname = 'Users delete own wallet_snapshots'
  ) then
    create policy "Users delete own wallet_snapshots" on wallet_snapshots
      for delete using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_wallet_snapshots_wallet on wallet_snapshots(wallet_id);
