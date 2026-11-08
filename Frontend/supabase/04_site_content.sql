-- =============================================================================
-- Website content managed from the admin dashboard ("Website Content" tab).
-- Run after 01–03. Safe to re-run.
-- =============================================================================

-- One row per editable field. `key` matches a data-cms key in src/site/*.html
-- (e.g. "home.t2"), a settings key ("settings.phone"), a page meta key
-- ("home.meta.title") or a list ("list.brands", stored as JSON text).
create table if not exists public.site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.site_content enable row level security;

drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content"
  on public.site_content for select using (true);

drop policy if exists "Staff can insert site content" on public.site_content;
create policy "Staff can insert site content"
  on public.site_content for insert with check (public.is_staff());

drop policy if exists "Staff can update site content" on public.site_content;
create policy "Staff can update site content"
  on public.site_content for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff can delete site content" on public.site_content;
create policy "Staff can delete site content"
  on public.site_content for delete using (public.is_staff());

create or replace function public.touch_site_content()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before insert or update on public.site_content
  for each row execute function public.touch_site_content();

-- Public bucket for website images uploaded from the dashboard.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public site media access" on storage.objects;
create policy "Public site media access"
  on storage.objects for select using (bucket_id = 'site-media');

drop policy if exists "Staff can upload site media" on storage.objects;
create policy "Staff can upload site media"
  on storage.objects for insert with check (bucket_id = 'site-media' and public.is_staff());

drop policy if exists "Staff can update site media" on storage.objects;
create policy "Staff can update site media"
  on storage.objects for update using (bucket_id = 'site-media' and public.is_staff());

drop policy if exists "Staff can delete site media" on storage.objects;
create policy "Staff can delete site media"
  on storage.objects for delete using (bucket_id = 'site-media' and public.is_staff());
