create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists responses_user_id_idx on responses(user_id);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references responses(id) on delete cascade,
  traits jsonb not null,
  created_at timestamptz not null default now(),
  unique(response_id)
);

create index if not exists scores_response_id_idx on scores(response_id);

insert into responses (id, user_id, answers, created_at)
select
  results.id,
  results.user_id,
  coalesce(jsonb_object_agg(result_answers.question_id, result_answers.answer) filter (where result_answers.question_id is not null), '{}'::jsonb),
  results.created_at
from results
left join result_answers on result_answers.result_id = results.id
where not exists (select 1 from responses where responses.id = results.id)
group by results.id;

insert into scores (response_id, traits, created_at)
select
  results.id,
  results.traits,
  results.created_at
from results
where not exists (select 1 from scores where scores.response_id = results.id);

alter table if exists orders
  add column if not exists response_id uuid;

update orders
set response_id = result_id
where response_id is null and result_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_response_id_fkey'
  ) then
    alter table orders
      add constraint orders_response_id_fkey foreign key (response_id) references responses(id);
  end if;
end $$;

create index if not exists orders_response_id_idx on orders(response_id);
create index if not exists orders_paddle_order_id_idx on orders(paddle_order_id);

create or replace function create_response_with_scores(
  user_id uuid,
  answers jsonb,
  traits jsonb,
  expected_count integer
)
returns uuid
language plpgsql
as $$
declare
  response_id uuid;
  actual_count integer;
begin
  if user_id is null then
    raise exception 'User id is required.' using errcode = 'XXU01';
  end if;

  if answers is null then
    raise exception 'Answers payload is required.' using errcode = 'XXP01';
  end if;

  if traits is null then
    raise exception 'Traits payload is required.' using errcode = 'XXP01';
  end if;

  if expected_count is null then
    raise exception 'Expected count is required.' using errcode = 'XXP01';
  end if;

  actual_count := jsonb_object_length(answers);
  if actual_count <> expected_count then
    raise exception 'Answer count mismatch. Expected %, got %.', expected_count, actual_count using errcode = 'XXA01';
  end if;

  insert into responses (user_id, answers)
  values (user_id, answers)
  returning id into response_id;

  begin
    insert into scores (response_id, traits)
    values (response_id, traits);
  exception
    when others then
      raise exception 'Failed to insert scores: %', SQLERRM using errcode = 'XXS01';
  end;

  return response_id;
end;
$$;
