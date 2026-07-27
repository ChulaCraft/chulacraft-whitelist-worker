-- This migration is intentionally the only browser write path: players use the
-- authenticated RPC below, and the local worker uses a backend-only secret key.
create extension if not exists pgcrypto;

create table if not exists public.minecraft_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete restrict,
  discord_user_id text not null unique,
  discord_username text,
  minecraft_uuid uuid not null unique,
  minecraft_username text not null,
  minecraft_username_key text not null unique,
  desired_whitelisted boolean not null default true,
  sync_status text not null default 'pending' check (sync_status in ('pending', 'synced', 'failed')),
  sync_attempts integer not null default 0 check (sync_attempts >= 0),
  next_sync_at timestamptz not null default now(),
  last_sync_error_code text,
  last_sync_error_at timestamptz,
  whitelisted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint minecraft_username_format check (minecraft_username ~ '^[A-Za-z0-9_]{3,16}$'),
  constraint minecraft_username_key_lower check (minecraft_username_key = lower(minecraft_username))
);

create index if not exists minecraft_registrations_sync_due_idx on public.minecraft_registrations (next_sync_at) where desired_whitelisted;

-- Durable authenticated rate limiter for registration attempts. It is private
-- to its security-definer function; browser clients cannot inspect or modify it.
create table if not exists public.registration_attempt_windows (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0)
);
alter table public.registration_attempt_windows enable row level security;
revoke all on public.registration_attempt_windows from anon, authenticated;

create or replace function public.consume_registration_attempt()
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_window public.registration_attempt_windows%rowtype;
begin
  if v_user_id is null then raise exception 'UNAUTHENTICATED'; end if;
  loop
    select * into v_window from public.registration_attempt_windows where user_id = v_user_id for update;
    if found then
      if v_window.window_started_at <= now() - interval '10 minutes' then
        update public.registration_attempt_windows set window_started_at = now(), attempts = 1 where user_id = v_user_id;
        return true;
      end if;
      if v_window.attempts >= 5 then return false; end if;
      update public.registration_attempt_windows set attempts = v_window.attempts + 1 where user_id = v_user_id;
      return true;
    end if;
    begin
      insert into public.registration_attempt_windows (user_id, attempts) values (v_user_id, 1);
      return true;
    exception when unique_violation then
      -- Another request created the caller's window; lock and evaluate it.
    end;
  end loop;
end;
$$;

revoke all on function public.consume_registration_attempt() from public, anon;
grant execute on function public.consume_registration_attempt() to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists minecraft_registrations_updated_at on public.minecraft_registrations;
create trigger minecraft_registrations_updated_at before update on public.minecraft_registrations for each row execute function public.set_updated_at();

-- Revocation and later re-approval are worker operations, not terminal UI-only
-- states. Reset their retry state atomically so an old revoked_at value cannot
-- hide a new requested removal (or an old synced state hide a re-add).
create or replace function public.reset_sync_on_desired_state_change()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.desired_whitelisted is distinct from new.desired_whitelisted then
    new.sync_status = 'pending';
    new.sync_attempts = 0;
    new.next_sync_at = now();
    new.last_sync_error_code = null;
    new.last_sync_error_at = null;
    if new.desired_whitelisted then
      new.whitelisted_at = null;
    else
      new.revoked_at = null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists minecraft_registrations_reset_sync_on_desired_change on public.minecraft_registrations;
create trigger minecraft_registrations_reset_sync_on_desired_change before update on public.minecraft_registrations for each row execute function public.reset_sync_on_desired_state_change();

alter table public.minecraft_registrations enable row level security;
revoke all on public.minecraft_registrations from anon, authenticated;
grant select (minecraft_username, desired_whitelisted, sync_status, updated_at) on public.minecraft_registrations to authenticated;
-- The worker authenticates with the backend-only service key. It needs the
-- internal retry fields to synchronize records, unlike browser clients.
grant select, update on public.minecraft_registrations to service_role;
create policy "players can read own registration" on public.minecraft_registrations for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.register_minecraft_profile(p_minecraft_uuid uuid, p_minecraft_username text)
returns table (minecraft_username text, desired_whitelisted boolean, sync_status text, updated_at timestamptz, created boolean)
language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_discord_id text;
  v_discord_username text;
  v_existing public.minecraft_registrations%rowtype;
begin
  if v_user_id is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_minecraft_username !~ '^[A-Za-z0-9_]{3,16}$' then raise exception 'INVALID_USERNAME'; end if;

  select provider_id, coalesce(identity_data ->> 'full_name', identity_data ->> 'user_name', identity_data ->> 'name')
    into v_discord_id, v_discord_username
    from auth.identities where user_id = v_user_id and provider = 'discord' limit 1;
  if v_discord_id is null then raise exception 'DISCORD_IDENTITY_REQUIRED'; end if;

  select * into v_existing from public.minecraft_registrations where user_id = v_user_id;
  if found then
    if v_existing.minecraft_uuid = p_minecraft_uuid then
      return query select v_existing.minecraft_username, v_existing.desired_whitelisted, v_existing.sync_status, v_existing.updated_at, false;
      return;
    end if;
    raise exception 'REGISTRATION_CONFLICT';
  end if;

  begin
    insert into public.minecraft_registrations (user_id, discord_user_id, discord_username, minecraft_uuid, minecraft_username, minecraft_username_key)
      values (v_user_id, v_discord_id, v_discord_username, p_minecraft_uuid, p_minecraft_username, lower(p_minecraft_username));
  exception when unique_violation then
    -- A concurrent identical request from this same authenticated user is an
    -- idempotent replay. Never reveal whether a UUID belongs to someone else.
    select * into v_existing from public.minecraft_registrations where user_id = v_user_id;
    if found and v_existing.minecraft_uuid = p_minecraft_uuid then
      return query select v_existing.minecraft_username, v_existing.desired_whitelisted, v_existing.sync_status, v_existing.updated_at, false;
      return;
    end if;
    raise exception 'REGISTRATION_CONFLICT';
  end;
  return query select p_minecraft_username, true, 'pending'::text, now(), true;
end;
$$;

revoke all on function public.register_minecraft_profile(uuid, text) from public, anon;
grant execute on function public.register_minecraft_profile(uuid, text) to authenticated;
