# Report Access (Phase 4)

## Phase 4 plan

- Introduce email-based ownership for paid reports.
- Issue hashed, time-bound magic links for report retrieval.
- Support guest purchases without requiring account creation before the quiz.
- Maintain compatibility with existing account-based orders and payment flows.

## Tables

### orders (additions)

- `email` (nullable; required when `user_id` is null for guest ownership)
- `provider`, `provider_session_id`
- `results_snapshot_id` or `report_id`
- `report_file_key`
- `paid_at`, `updated_at`
- `report_access_token_hash` (hashed token; raw tokens are never stored)

### report_access_links

- `id`
- `email`
- `order_id`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

Indexes: `token_hash`, `email`, `expires_at`, `order_id`.
