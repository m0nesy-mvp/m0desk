-- M0Desk v0.1 — initial schema
-- Run this in Supabase Dashboard → SQL Editor (or via Management API).
-- All tables are scoped to auth.uid() with Row Level Security.

-- ============ Extensions ============
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============ Enums ============
create type project_status as enum ('active', 'paused', 'completed', 'archived');
create type task_status as enum ('todo', 'doing', 'done');
create type knowledge_status as enum ('learning', 'understood', 'review');
create type library_type as enum ('paper', 'website', 'github', 'course', 'video', 'book', 'document', 'other');
create type library_status as enum ('unread', 'reading', 'finished', 'reference');
create type inbox_status as enum ('unprocessed', 'processed');

-- ============ Projects ============
create table projects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  title         text not null,
  description   text not null default '',
  status        project_status not null default 'active',
  priority      text not null default 'P2' check (priority in ('P0', 'P1', 'P2', 'P3')),
  deadline      timestamptz,
  current_stage text not null default '',
  next_action   text not null default '',
  notes         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============ Tasks ============
create table tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  project_id   uuid references projects (id) on delete set null,
  title        text not null,
  description  text not null default '',
  status       task_status not null default 'todo',
  priority     text not null default 'P2' check (priority in ('P0', 'P1', 'P2', 'P3')),
  due_date     timestamptz,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============ Knowledge ============
create table knowledge (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  project_id uuid references projects (id) on delete set null,
  title      text not null,
  summary    text not null default '',
  content    text not null default '',
  category   text not null default '',
  tags       text[] not null default '{}',
  status     knowledge_status not null default 'learning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ Library ============
create table library_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  project_id  uuid references projects (id) on delete set null,
  title       text not null,
  type        library_type not null default 'other',
  url         text not null default '',
  description text not null default '',
  tags        text[] not null default '{}',
  status      library_status not null default 'unread',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============ Inbox ============
create table inbox_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  content    text not null,
  status     inbox_status not null default 'unprocessed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ updated_at trigger ============
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_projects_updated_at before update on projects
  for each row execute function set_updated_at();
create trigger trg_tasks_updated_at before update on tasks
  for each row execute function set_updated_at();
create trigger trg_knowledge_updated_at before update on knowledge
  for each row execute function set_updated_at();
create trigger trg_library_items_updated_at before update on library_items
  for each row execute function set_updated_at();
create trigger trg_inbox_items_updated_at before update on inbox_items
  for each row execute function set_updated_at();

-- ============ Indexes ============
create index idx_projects_user on projects (user_id);
create index idx_tasks_user on tasks (user_id);
create index idx_tasks_project on tasks (project_id);
create index idx_tasks_due on tasks (due_date);
create index idx_knowledge_user on knowledge (user_id);
create index idx_knowledge_project on knowledge (project_id);
create index idx_library_user on library_items (user_id);
create index idx_library_project on library_items (project_id);
create index idx_inbox_user on inbox_items (user_id);

-- trigram indexes for keyword search (ilike '%q%')
create index idx_projects_title_trgm on projects using gin (title gin_trgm_ops);
create index idx_tasks_title_trgm on tasks using gin (title gin_trgm_ops);
create index idx_knowledge_title_trgm on knowledge using gin (title gin_trgm_ops);
create index idx_library_title_trgm on library_items using gin (title gin_trgm_ops);
create index idx_inbox_content_trgm on inbox_items using gin (content gin_trgm_ops);

-- ============ Row Level Security ============
alter table projects enable row level security;
alter table tasks enable row level security;
alter table knowledge enable row level security;
alter table library_items enable row level security;
alter table inbox_items enable row level security;

-- multi-user policies: a user can only read/write their own rows
create policy "projects_own" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_own" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "knowledge_own" on knowledge
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "library_items_own" on library_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "inbox_items_own" on inbox_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ Helper view: inbox item counts (used by Settings) ============
create or replace view data_counts
with (security_invoker = true)
as
select
  auth.uid() as user_id,
  (select count(*) from projects p where p.user_id = auth.uid()) as projects,
  (select count(*) from tasks t where t.user_id = auth.uid()) as tasks,
  (select count(*) from knowledge k where k.user_id = auth.uid()) as knowledge,
  (select count(*) from library_items l where l.user_id = auth.uid()) as library,
  (select count(*) from inbox_items i where i.user_id = auth.uid()) as inbox;
