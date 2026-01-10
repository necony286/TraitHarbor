#!/usr/bin/env bash
set -euo pipefail

psql -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'Connected to Postgres for DB contract check.' AS status;
SQL

for file in supabase/migrations/*.sql; do
  psql -v ON_ERROR_STOP=1 -f "$file"
done

psql -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO users (id)
VALUES ('11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

SELECT create_response_with_scores(
  '11111111-1111-1111-1111-111111111111',
  '{"q1": 1}'::jsonb,
  '{"O": 11, "C": 22, "E": 33, "A": 44, "N": 55}'::jsonb,
  1
) AS response_id \gset

SELECT count(*) = 1 AS rpc_created_score
FROM scores
WHERE response_id = :'response_id';
SQL
