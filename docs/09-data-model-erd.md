# 09 · Data Model & ERD

```mermaid
erDiagram
  users ||--o{ results : has
  users ||--o{ orders  : has
  users ||--o{ assets  : has
  orders ||--o{ assets : generates

  users {
    uuid id PK
    text email
    timestamp created_at
  }
  results {
    uuid id PK
    uuid user_id FK
    jsonb traits
    timestamp created_at
  }
  orders {
    uuid id PK
    uuid user_id FK
    text paddle_order_id
    text status
    integer amount_cents
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
- results.user_id, orders.user_id
- assets.order_id + assets.kind unique

## RLS/ACL (if Supabase)
- results: owner read; orders: owner read.
- Limitation: owner-read RLS policies require Supabase Auth, which the MVP does not use. For now, access is enforced server-side only with the service role key.
