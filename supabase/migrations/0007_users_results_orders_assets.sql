create table if not exists users (
  id uuid primary key,
  email text unique,
  created_at timestamptz not null default now()
);

alter table if exists results
  add column if not exists user_id uuid;

update results
set user_id = gen_random_uuid()
where user_id is null;

insert into users (id)
select distinct user_id
from results
where user_id is not null
on conflict do nothing;

alter table if exists results
  alter column user_id set not null;

alter table if exists results
  add constraint results_user_id_fkey foreign key (user_id) references users(id);

create index if not exists results_user_id_idx on results(user_id);

alter table if exists orders
  add column if not exists user_id uuid;

update orders
set user_id = gen_random_uuid()
where user_id is null;

insert into users (id)
select distinct user_id
from orders
where user_id is not null
on conflict do nothing;

alter table if exists orders
  alter column user_id set not null;

alter table if exists orders
  add constraint orders_user_id_fkey foreign key (user_id) references users(id);

create index if not exists orders_user_id_idx on orders(user_id);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  order_id uuid not null references orders(id),
  kind text not null,
  path text not null,
  created_at timestamptz not null default now(),
  unique(order_id, kind)
);

create index if not exists assets_user_id_idx on assets(user_id);
create index if not exists assets_order_id_idx on assets(order_id);
