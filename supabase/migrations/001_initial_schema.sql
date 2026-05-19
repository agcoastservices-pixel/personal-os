-- ============================================================
-- Jarvis OS — Initial Schema
-- Run this in the Supabase SQL editor or via `supabase db push`
-- ============================================================

-- Goals
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  title       text not null,
  category    text not null check (category in ('fitness', 'business', 'financial', 'personal')),
  target_date date,
  progress    integer not null default 0 check (progress >= 0 and progress <= 100),
  status      text not null default 'active' check (status in ('active', 'completed', 'paused')),
  notes       text,
  created_at  timestamptz not null default now()
);

-- Milestones (sub-goals)
create table if not exists public.milestones (
  id          uuid primary key default gen_random_uuid(),
  goal_id     uuid not null references public.goals(id) on delete cascade,
  title       text not null,
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  goal_id     uuid references public.goals(id) on delete set null,
  title       text not null,
  priority    text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date    timestamptz,
  completed   boolean not null default false,
  streak      integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Daily briefs
create table if not exists public.daily_briefs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  date        date not null,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (user_id, date)
);

-- Integrations
create table if not exists public.integrations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  connected   boolean not null default false,
  last_synced timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.goals enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_briefs enable row level security;
alter table public.integrations enable row level security;

-- Goals: users see only their own
create policy "goals: owner access"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Milestones: accessible if user owns the parent goal
create policy "milestones: owner access"
  on public.milestones for all
  using (
    exists (
      select 1 from public.goals g
      where g.id = milestones.goal_id and g.user_id = auth.uid()
    )
  );

-- Tasks: users see only their own
create policy "tasks: owner access"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Daily briefs: users see only their own
create policy "daily_briefs: owner access"
  on public.daily_briefs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Integrations: users see only their own
create policy "integrations: owner access"
  on public.integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Seed default integrations for new users (via trigger)
-- ============================================================

create or replace function public.seed_user_integrations()
returns trigger language plpgsql security definer as $$
begin
  insert into public.integrations (user_id, name, connected)
  values
    (new.id, 'WHOOP', false),
    (new.id, 'Google Calendar', false),
    (new.id, 'Meta Ads', false),
    (new.id, 'Housecall Pro', false),
    (new.id, 'Plaid / Bank', false),
    (new.id, 'Google Ads', false);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.seed_user_integrations();

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists milestones_goal_id_idx on public.milestones(goal_id);
create index if not exists daily_briefs_date_idx on public.daily_briefs(user_id, date desc);
