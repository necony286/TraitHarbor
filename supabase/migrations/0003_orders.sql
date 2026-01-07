do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('created', 'pending_webhook', 'paid', 'failed');
  end if;
end $$;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  paddle_order_id text,
  status public.order_status not null,
  amount_cents integer not null check (amount_cents >= 0),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on orders(user_id);
