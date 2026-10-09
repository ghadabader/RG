-- Spec 0001 — profiles: one row per account, created by a trigger on auth.users.
-- Holds nothing beyond the user's id, their language and timestamps.

create table public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  locale     text not null default 'en' check (locale in ('en', 'ar', 'he')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row-level security: a user may read and update only their own row.
-- No insert or delete policy: the trigger creates rows, the cascade removes them.
alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- The project does not expose new tables automatically, so grant exactly what the
-- policies allow. Only `locale` is user-editable; updated_at is set by the trigger below.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (locale) on public.profiles to authenticated;
grant select on public.profiles to service_role;

create function public.profiles_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.profiles_touch_updated_at();

-- Create the profile when the account is created, so a failed second write can never
-- leave a user without one. The locale comes from sign-up metadata, falling back to 'en'.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, locale)
  values (
    new.id,
    case
      when new.raw_user_meta_data ->> 'locale' in ('en', 'ar', 'he')
        then new.raw_user_meta_data ->> 'locale'
      else 'en'
    end
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.profiles_touch_updated_at() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
