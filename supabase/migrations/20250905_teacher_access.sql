-- Grant teacher (by specific user_id) ability to read all progress
-- and provide a SECURITY DEFINER RPC to fetch progress with user names

-- Grant read access policy for the teacher user
drop policy if exists "Teacher can read all progress" on public.progress;
create policy "Teacher can read all progress"
on public.progress for select
using ( auth.uid() = '5dbf78cf-206b-45f9-a7af-37116875bd33'::uuid );

-- Function to fetch all progresses with user names/emails
create or replace function public.get_all_progress_with_users()
returns table (
  user_id uuid,
  name text,
  email text,
  page int,
  chat_link text,
  source_code text,
  updated_at timestamptz
) as $$
begin
  -- Only allow the specific teacher to read
  if auth.uid() <> '5dbf78cf-206b-45f9-a7af-37116875bd33'::uuid then
    raise exception 'not authorized';
  end if;

  return query
  select
    p.user_id,
    coalesce(
      (au.raw_user_meta_data ->> 'name'),
      (au.raw_user_meta_data ->> 'full_name'),
      split_part(au.email, '@', 1)
    )::text as name,
    au.email::text,
    p.page,
    p.chat_link,
    p.source_code,
    p.updated_at
  from public.progress p
  join auth.users au on au.id = p.user_id
  order by name nulls last, au.email, p.page;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.get_all_progress_with_users() to anon, authenticated;


