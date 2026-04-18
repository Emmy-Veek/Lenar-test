-- Lenar MVP schema (Supabase / Postgres)
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  goals text,
  availability jsonb,
  active_skill_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid (),
  title text not null,
  description text,
  created_at timestamptz default now ()
);

alter table public.profiles
  add constraint profiles_active_skill_fk
  foreign key (active_skill_id) references public.skills (id) on delete set null;

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid (),
  skill_id uuid references public.skills (id) on delete cascade,
  title text,
  content_type text,
  content_url text,
  order_index int,
  created_at timestamptz default now ()
);

create table if not exists public.user_lessons (
  id uuid primary key default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete cascade,
  completed boolean default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid (),
  skill_id uuid references public.skills (id),
  title text,
  description text,
  order_index int
);

create table if not exists public.user_tasks (
  id uuid primary key default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  submission text,
  completed boolean default false,
  created_at timestamptz default now (),
  unique (user_id, task_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.lessons enable row level security;
alter table public.user_lessons enable row level security;
alter table public.tasks enable row level security;
alter table public.user_tasks enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid () = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid () = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid () = id);

create policy "skills_read_all" on public.skills for select using (true);

create policy "lessons_read_all" on public.lessons for select using (true);
create policy "lessons_insert_authenticated" on public.lessons for insert with check (auth.role () = 'authenticated');

create policy "user_lessons_select_own" on public.user_lessons for select using (auth.uid () = user_id);
create policy "user_lessons_insert_own" on public.user_lessons for insert with check (auth.uid () = user_id);
create policy "user_lessons_update_own" on public.user_lessons for update using (auth.uid () = user_id);

create policy "tasks_read_all" on public.tasks for select using (true);
create policy "tasks_insert_authenticated" on public.tasks for insert with check (auth.role () = 'authenticated');

create policy "user_tasks_select_own" on public.user_tasks for select using (auth.uid () = user_id);
create policy "user_tasks_insert_own" on public.user_tasks for insert with check (auth.uid () = user_id);
create policy "user_tasks_update_own" on public.user_tasks for update using (auth.uid () = user_id);
