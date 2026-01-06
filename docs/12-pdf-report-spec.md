# 12 · PDF Report Spec

## Layout
- A4, margins 24px, ≤ 700 kB target.
- Sections: cover, overview, chart, traits (5), tips, resources.

## Variables
- {name}, {date}, {scores.O}, {scores.C}, {scores.E}, {scores.A}, {scores.N}

## Tech
- HTML+CSS template → Puppeteer/Playwright → Buffer → Storage (signed URL 24h).

## Accessibility
- Selectable text, embedded fonts (subset).

## QA
- Open on mobile/desktop, file size, correct numeric values.
