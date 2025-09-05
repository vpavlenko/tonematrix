-- Create progress table to store per-user chapter progress
create table if not exists public.progress (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  page int not null check (page > 0),
  chat_link text,
  source_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, page)
);

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists progress_set_updated_at on public.progress;
create trigger progress_set_updated_at
before update on public.progress
for each row execute procedure public.set_updated_at();

-- Enable RLS and policies for user isolation
alter table public.progress enable row level security;

drop policy if exists "Users can read their own progress" on public.progress;
create policy "Users can read their own progress"
on public.progress for select
using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own progress" on public.progress;
create policy "Users can insert their own progress"
on public.progress for insert
with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own progress" on public.progress;
create policy "Users can update their own progress"
on public.progress for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );


