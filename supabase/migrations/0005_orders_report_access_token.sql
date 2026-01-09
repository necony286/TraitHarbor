alter table if exists orders
  add column if not exists report_access_token uuid;

create index if not exists orders_report_access_token_idx on orders(report_access_token);
