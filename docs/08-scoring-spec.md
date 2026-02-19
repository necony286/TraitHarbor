# 08 · Scoring Spec

This document describes the scoring behavior implemented in `lib/scoring.ts` and item loading in `lib/ipip.ts`.

## Item Schema (JSON)
```json
{ "id": "Q1", "prompt": "...", "trait": "O", "reverseKeyed": false, "facetKey": "O1_Imagination" }
```

- Item data sources:
  - `src/data/ipip120.json`
  - `src/data/ipip60.json`
- Facet mapping source:
  - `src/data/ipip120.facets.json` (attached to items in `lib/ipip.ts`)

## Quiz variants
- Pro quiz: `ipip120` (`/quiz`)
- Quick quiz: `ipip60` (`/quiz/quick`)

## Likert mapping
`mapLikertToScore(value) = value - 3`

- 1 → -2
- 2 → -1
- 3 → 0
- 4 → 1
- 5 → 2

## Reverse-key handling
For each answered item:
- `mapped = value - 3`
- `adjusted = reverseKeyed ? -mapped : mapped`

Trait and facet raw sums use `adjusted`.

## Per-trait normalization (0–100)
For each trait with `count` items:
- `min = -2 * count`
- `max =  2 * count`
- `normalized = ((raw - min) / (max - min)) * 100`
- rounded to 2 decimals

## Facet scoring
- Each item contributes to a facet via `facetKey`.
- Facet raw totals and counts are accumulated per trait.
- Each facet score is normalized using the same 0–100 formula.
- Stored shape: `Record<TraitName, Record<FacetKey, number>>`.

## API validation coupling
`POST /api/score` validates that submitted answer IDs exactly match the loaded item IDs for the selected variant:
- missing IDs → 400
- extra IDs → 400

## Fixtures
Scoring fixtures are defined in `lib/scoring.ts` (`scoringFixtures`):
- high → all traits score 100
- neutral → all traits score 50
- low → all traits score 0
