create extension if not exists "pgcrypto";

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  traits jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists result_answers (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references results(id) on delete cascade,
  question_id text not null,
  answer integer not null check (answer between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists result_answers_result_id_idx on result_answers (result_id);
