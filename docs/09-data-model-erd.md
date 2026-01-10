# 09 · Data Model & ERD

```mermaid
erDiagram
  users ||--o{ responses : has
  responses ||--|| scores : has
  users ||--o{ orders : has
  responses ||--o{ orders : purchased_with
  users ||--o{ assets : has
  orders ||--o{ assets : generates

  users {
    uuid id PK
    text email
    timestamp created_at
  }
  responses {
    uuid id PK
    uuid user_id FK
    jsonb answers
    timestamp created_at
  }
  scores {
    uuid id PK
    uuid response_id FK
    jsonb traits
    timestamp created_at
  }
  orders {
    uuid id PK
    uuid user_id FK
    uuid response_id FK
    text paddle_order_id
    text status
    integer amount_cents
    uuid report_access_token
    timestamp created_at
  }
  assets {
    uuid id PK
    uuid user_id FK
    uuid order_id FK
    text kind
    text path
    timestamp created_at
  }
```

## Indexes
- users.email unique
- responses.user_id
- scores.response_id unique
- orders.user_id, orders.response_id, orders.paddle_order_id
- assets.order_id + assets.kind unique (also indexed by user_id and order_id)

## Anonymous user model
- `users.id` is an anonymous UUID stored in a cookie/localStorage (no Supabase Auth).
- `users.email` is optional and only populated for paid orders via the Paddle webhook.
- Access is enforced server-side using the Supabase service role; no RLS policies are assumed.
