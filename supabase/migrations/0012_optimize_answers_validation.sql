create or replace function validate_answers_payload(
  answers jsonb,
  expected_count integer
)
returns void
language plpgsql
as $$
declare
  actual_count integer;
begin
  if answers is null then
    raise exception 'Answers payload is required.' using errcode = 'XXP01';
  end if;

  if jsonb_typeof(answers) <> 'object' then
    raise exception 'Answers payload must be a JSON object.' using errcode = 'XXP02';
  end if;

  if expected_count is null then
    raise exception 'Expected count is required.' using errcode = 'XXP01';
  end if;

  actual_count := jsonb_object_length(answers);
  if actual_count <> expected_count then
    raise exception 'Answer count mismatch. Expected %, got %.', expected_count, actual_count using errcode = 'XXA01';
  end if;
end;
$$;

create or replace function create_response_with_scores(
  user_id uuid,
  traits jsonb,
  answers jsonb,
  expected_count integer
)
returns uuid
language plpgsql
as $$
declare
  response_id uuid;
begin
  if user_id is null then
    raise exception 'User id is required.' using errcode = 'XXU01';
  end if;

  perform validate_answers_payload(answers, expected_count);

  if traits is null then
    raise exception 'Traits payload is required.' using errcode = 'XXP01';
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
