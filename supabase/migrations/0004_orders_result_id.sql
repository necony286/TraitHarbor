alter table if exists orders
  add column if not exists result_id uuid references results(id);

create index if not exists orders_result_id_idx on orders(result_id);
