create or replace function create_result_with_answers(
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
  if traits is null then
    raise exception 'Traits payload is required.' using errcode = 'XXP01';
  end if;

  if answers is null then
    raise exception 'Answers payload is required.' using errcode = 'XXP01';
  end if;

  if jsonb_typeof(answers) <> 'object' then
    raise exception 'Answers payload must be a JSON object.' using errcode = 'XXP02';
  end if;

  if expected_count is null then
    raise exception 'Expected count is required.' using errcode = 'XXP01';
  end if;

  actual_count := (select count(*) from jsonb_object_keys(answers));
  if actual_count <> expected_count then
    raise exception 'Answer count mismatch. Expected %, got %.', expected_count, actual_count using errcode = 'XXA01';
  end if;

  insert into results (traits)
  values (traits)
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
