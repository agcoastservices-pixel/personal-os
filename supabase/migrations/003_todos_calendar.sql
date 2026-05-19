-- ============================================================
-- Jarvis OS — Phase 3 Schema: Todos + Calendar + Score bonuses
-- ============================================================

-- 1. Add new columns to tasks table
alter table public.tasks
  add column if not exists deadline        timestamptz,
  add column if not exists category        text check (category in ('personal','business','fitness','financial')) default 'personal',
  add column if not exists priority_v2     text check (priority_v2 in ('most_important','important','least_important')) default 'important';

-- Migrate existing priority values
update public.tasks set priority_v2 = case
  when priority = 'high'   then 'most_important'
  when priority = 'medium' then 'important'
  when priority = 'low'    then 'least_important'
  else 'important'
end;

-- Make priority_v2 not null after backfill
alter table public.tasks alter column priority_v2 set not null;

-- Index for calendar queries (todos by deadline)
create index if not exists tasks_deadline_idx on public.tasks(user_id, deadline)
  where deadline is not null;

-- 2. Rename rpe → rir in workout_sets (stores Reps In Reserve)
alter table public.workout_sets
  rename column rpe to rir;

-- 3. Add bonus boolean fields to daily_scores
alter table public.daily_scores
  add column if not exists water_gallon    boolean not null default false,
  add column if not exists macros_tracked  boolean not null default false;

-- Bump total_score check constraint to allow up to 110 (for bonuses)
alter table public.daily_scores
  drop constraint if exists daily_scores_total_score_check;

alter table public.daily_scores
  add constraint daily_scores_total_score_check
  check (total_score >= 0 and total_score <= 110);

-- ============================================================
-- No new RLS needed — existing tasks + daily_scores policies cover new columns
-- ============================================================
