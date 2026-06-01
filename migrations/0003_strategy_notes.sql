-- Migration 0003: user-authored strategy notes (one row per user).
-- The user's own investment thesis / ideas-to-try, folded into the served context
-- and the GLM investor profile. Kept SEPARATE from investor_profiles (which is
-- overwritten on every profile-gen) so user-authored text is never clobbered.
-- Apply via Supabase Management API (needs a Personal Access Token) or psql. Idempotent.

create table if not exists strategy_notes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  content text not null default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table strategy_notes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'strategy_notes' and policyname = 'Users read own strategy_notes'
  ) then
    create policy "Users read own strategy_notes" on strategy_notes
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'strategy_notes' and policyname = 'Users insert own strategy_notes'
  ) then
    create policy "Users insert own strategy_notes" on strategy_notes
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'strategy_notes' and policyname = 'Users update own strategy_notes'
  ) then
    create policy "Users update own strategy_notes" on strategy_notes
      for update using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'strategy_notes' and policyname = 'Users delete own strategy_notes'
  ) then
    create policy "Users delete own strategy_notes" on strategy_notes
      for delete using (auth.uid() = user_id);
  end if;
end $$;
