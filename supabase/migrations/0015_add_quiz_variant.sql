alter table if exists responses
  add column if not exists quiz_variant text;

alter table if exists scores
  add column if not exists quiz_variant text;

alter table if exists orders
  add column if not exists quiz_variant text;

update responses
set quiz_variant = 'ipip120'
where quiz_variant is null;

update scores
set quiz_variant = 'ipip120'
where quiz_variant is null;

update orders
set quiz_variant = coalesce(orders.quiz_variant, responses.quiz_variant, 'ipip120')
from responses
where orders.response_id = responses.id
  and orders.quiz_variant is null;

update orders
set quiz_variant = 'ipip120'
where quiz_variant is null;

alter table if exists responses
  alter column quiz_variant set default 'ipip120',
  alter column quiz_variant set not null;

alter table if exists scores
  alter column quiz_variant set default 'ipip120',
  alter column quiz_variant set not null;

alter table if exists orders
  alter column quiz_variant set default 'ipip120',
  alter column quiz_variant set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'responses_quiz_variant_chk'
  ) then
    alter table responses
      add constraint responses_quiz_variant_chk
      check (quiz_variant in ('ipip120', 'ipip60'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'scores_quiz_variant_chk'
  ) then
    alter table scores
      add constraint scores_quiz_variant_chk
      check (quiz_variant in ('ipip120', 'ipip60'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_quiz_variant_chk'
  ) then
    alter table orders
      add constraint orders_quiz_variant_chk
      check (quiz_variant in ('ipip120', 'ipip60'));
  end if;
end $$;

drop function if exists create_response_with_scores(uuid, jsonb, jsonb, integer);
drop function if exists create_response_with_scores(uuid, jsonb, jsonb, integer, jsonb);

create or replace function create_response_with_scores(
  user_id uuid,
  answers jsonb,
  traits jsonb,
  expected_count integer,
  facet_scores jsonb default null,
  quiz_variant text default 'ipip120'
)
returns uuid
language plpgsql
as $$
declare
  response_id uuid;
  actual_count integer;
  normalized_variant text;
begin
  normalized_variant := coalesce(quiz_variant, 'ipip120');

  if normalized_variant not in ('ipip120', 'ipip60') then
    raise exception 'Invalid quiz variant.' using errcode = 'XXP03';
  end if;

  if user_id is null then
    raise exception 'User id is required.' using errcode = 'XXU01';
  end if;

  if answers is null then
    raise exception 'Answers payload is required.' using errcode = 'XXP01';
  end if;

  if jsonb_typeof(answers) <> 'object' then
    raise exception 'Answers payload must be a JSON object.' using errcode = 'XXP02';
  end if;

  if traits is null then
    raise exception 'Traits payload is required.' using errcode = 'XXP01';
  end if;

  if expected_count is null then
    raise exception 'Expected count is required.' using errcode = 'XXP01';
  end if;

  actual_count := (select count(*) from jsonb_object_keys(answers));
  if actual_count <> expected_count then
    raise exception 'Answer count mismatch. Expected %, got %.', expected_count, actual_count using errcode = 'XXA01';
  end if;

  insert into responses (user_id, answers, quiz_variant)
  values (user_id, answers, normalized_variant)
  returning id into response_id;

  begin
    insert into scores (response_id, traits, facet_scores, quiz_variant)
    values (response_id, traits, facet_scores, normalized_variant);
  exception
    when others then
      raise exception 'Failed to insert scores: %', SQLERRM using errcode = 'XXS01';
  end;

  return response_id;
end;
$$;
