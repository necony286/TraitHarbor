# 08 · Scoring Spec

## Item Schema (JSON)
```json
{ "id": "Q1", "trait": "O", "reverseKeyed": false, "weight": 1 }
```

## Likert Mapping
- 1..5 → [-2,-1,0,1,2] (example) or use normalized 0..4 then z-score.

## Per-Trait Score
- Sum weighted items per trait → normalize to 0–100.

## Normalization
- percentile = (raw - min) / (max - min) * 100

## Validation
- Missing answers → prompt to complete or impute neutral.

## Test Fixtures
- Provide 3 sample answer sets with expected OCEAN outputs.
