drop function if exists create_result_with_answers(jsonb, jsonb, integer);

create or replace function create_result_with_answers(
  user_id uuid,
  traits jsonb,
  answers jsonb,
  expected_count integer
)
returns uuid
language plpgsql
as $$
declare
  result_id uuid;
  actual_count integer;
begin
  if user_id is null then
    raise exception 'User id is required.' using errcode = 'XXU01';
  end if;

  if traits is null then
    raise exception 'Traits payload is required.' using errcode = 'XXP01';
  end if;

  if answers is null then
    raise exception 'Answers payload is required.' using errcode = 'XXP01';
  end if;

  if expected_count is null then
    raise exception 'Expected count is required.' using errcode = 'XXP01';
  end if;

  actual_count := jsonb_object_length(answers);
  if actual_count <> expected_count then
    raise exception 'Answer count mismatch. Expected %, got %.', expected_count, actual_count using errcode = 'XXA01';
  end if;

  insert into results (user_id, traits)
  values (user_id, traits)
  returning id into result_id;

  begin
    insert into result_answers (result_id, question_id, answer)
    select result_id, key, value::integer
    from jsonb_each_text(answers);
  exception
    when others then
      raise exception 'Failed to insert answers: %', SQLERRM using errcode = 'XXA02';
  end;

  return result_id;
end;
$$;
