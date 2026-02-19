# 09 · Data Model & ERD

Current schema is defined by `supabase/migrations/*.sql`, with `quiz_variant` support added in `0015_add_quiz_variant.sql` and facet scores added in `0014_add_facet_scores.sql`.

```mermaid
erDiagram
  users ||--o{ responses : has
  responses ||--|| scores : has
  users ||--o{ orders : places
  responses ||--o{ orders : source_response
  users ||--o{ assets : owns
  orders ||--o{ assets : generates
  orders ||--o{ report_access_links : grants

  users {
    uuid id PK
    text email
    timestamptz created_at
  }

  responses {
    uuid id PK
    uuid user_id FK
    jsonb answers
    text quiz_variant
    timestamptz created_at
  }

  scores {
    uuid id PK
    uuid response_id FK
    jsonb traits
    jsonb facet_scores
    text quiz_variant
    timestamptz created_at
  }

  orders {
    uuid id PK
    uuid user_id FK
    uuid response_id FK
    text paddle_order_id
    text paddle_transaction_id
    text provider
    text provider_session_id
    text status
    integer amount_cents
    text email
    text report_access_token_hash
    text report_file_key
    text quiz_variant
    timestamptz paid_at
    timestamptz updated_at
    timestamptz created_at
  }

  assets {
    uuid id PK
    uuid user_id FK
    uuid order_id FK
    text kind
    text path
    timestamptz created_at
  }

  report_access_links {
    uuid id PK
    text email
    uuid order_id FK
    text token_hash
    timestamptz expires_at
    timestamptz used_at
    timestamptz created_at
  }
```

## Important constraints
- `responses.quiz_variant`, `scores.quiz_variant`, `orders.quiz_variant` are constrained to `ipip120 | ipip60`.
- `scores.response_id` is unique (1:1 between response and score row).
- `assets` has unique `(order_id, kind)`.
- `report_access_links.token_hash` is unique.

## Runtime mapping
Application-level DB contracts are implemented in:
- `lib/db.ts`
- `lib/orders.ts`

These map snake_case DB columns (e.g., `quiz_variant`, `facet_scores`) to API-facing camelCase fields (`quizVariant`, `facetScores`).
