create unique index if not exists scores_response_id_unique_idx
  on scores(response_id);

alter table if exists orders
  add column if not exists paddle_transaction_id text;

create unique index if not exists orders_paddle_order_id_unique_idx
  on orders(paddle_order_id)
  where paddle_order_id is not null;

create unique index if not exists orders_paddle_transaction_id_unique_idx
  on orders(paddle_transaction_id)
  where paddle_transaction_id is not null;
