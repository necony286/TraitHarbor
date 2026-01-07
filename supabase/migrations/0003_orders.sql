create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  paddle_order_id text,
  status text not null,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on orders(user_id);
