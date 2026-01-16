do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumlabel = 'pending'
      and enumtypid = 'order_status'::regtype
  ) then
    alter type public.order_status add value 'pending';
  end if;

  if not exists (
    select 1
    from pg_enum
    where enumlabel = 'refunded'
      and enumtypid = 'order_status'::regtype
  ) then
    alter type public.order_status add value 'refunded';
  end if;
end $$;

alter table if exists orders
  alter column user_id drop not null;

alter table if exists orders
  add column if not exists email text,
  add column if not exists provider text,
  add column if not exists provider_session_id text,
  add column if not exists report_id uuid,
  add column if not exists results_snapshot_id uuid,
  add column if not exists report_file_key text,
  add column if not exists paid_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists report_access_token_hash text;

alter table if exists orders
  drop column if exists report_access_token;

update orders
set email = users.email
from users
where orders.user_id = users.id
  and orders.email is null
  and users.email is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_email_or_user_id_chk'
  ) then
    alter table orders
      add constraint orders_email_or_user_id_chk
      check (user_id is not null or email is not null);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_results_snapshot_id_fkey'
  ) then
    alter table orders
      add constraint orders_results_snapshot_id_fkey
      foreign key (results_snapshot_id)
      references responses(id);
  end if;
end $$;

create table if not exists report_access_links (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  order_id uuid references orders(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists report_access_links_token_hash_idx
  on report_access_links(token_hash);

create index if not exists report_access_links_email_idx
  on report_access_links(email);

create index if not exists report_access_links_expires_at_idx
  on report_access_links(expires_at);

create index if not exists report_access_links_order_id_idx
  on report_access_links(order_id);
