# KraDoll — a play-first gift concierge for Apple Park Kids

A believable clone of the [appleparkkids.com](https://appleparkkids.com) homepage
with a **KraDoll** tab that launches a Forest-style, wordless picture-quiz. The
child plays a five-minute story starring a real doll or Farm Buddy; the parent
receives a finished purchase decision — a personality archetype plus one real,
priced, add-to-cart product.

## Run it

```bash
npm install
npm run dev          # Vite on :5173, story API on :8787
```

Open http://localhost:5173 → click **KraDoll** (or go to `/quiz`).

## How it works — two deliberately separated layers

- **Rule-based (deterministic, demo-safe):** every quiz answer maps to one of four
  archetypes (`src/data/archetypes.ts`), tallied in `src/lib/scoring.ts`. The
  winning archetype (+ chosen buddy's animal) picks a real, in-stock product in
  `src/lib/match.ts`. Same answers → same result, every time.
- **AI flavor (never decides the outcome):** the final keepsake story is written
  by **Claude Haiku 4.5** via `server/index.ts` (`POST /api/story`). If
  `ANTHROPIC_API_KEY` is unset or the call fails, a local template renders instead
  — the quiz never blocks.

## Enable live AI stories

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

`GET /api/health` reports `{ "ai": true }` when a key is present.

## Data

Products come from `apple_park_catalog_full.csv` (255 rows), converted to
`src/data/catalog.ts` via `npm run gen:catalog`. Buddies (10 dolls + named Farm
Buddies) are derived in `src/data/buddies.ts`.

## Artwork

The app ships with themed emoji/CSS placeholders. To drop in AI-generated
illustrations that reference the real products, see `scripts/art-prompts.md` and
register asset ids in `src/lib/art.ts`.
