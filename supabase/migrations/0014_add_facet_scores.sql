alter table scores
  add column if not exists facet_scores jsonb;

create or replace function create_response_with_scores(
  user_id uuid,
  answers jsonb,
  traits jsonb,
  expected_count integer,
  facet_scores jsonb default null
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

  insert into responses (user_id, answers)
  values (user_id, answers)
  returning id into response_id;

  begin
    insert into scores (response_id, traits, facet_scores)
    values (response_id, traits, facet_scores);
  exception
    when others then
      raise exception 'Failed to insert scores: %', SQLERRM using errcode = 'XXS01';
  end;

  return response_id;
end;
$$;
