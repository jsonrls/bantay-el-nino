# 🇵🇭 Bantay El Niño

> **Know the heat. Track the water. Protect your community.**

A Philippine climate information platform that makes El Niño conditions easy
to understand at the province and community level.

Design direction and civic UI standards are documented in [`DESIGN.md`](DESIGN.md) alongside the vendored antislop rulebook in [`antislop/`](antislop/).

## Stack (all free / open source)

| Part | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Maps | MapLibre GL JS (GeoJSON province polygons) |
| Database | Supabase (PostgreSQL + PostGIS, free tier) / Static Open Data |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Cloudflare Pages / Vercel |
| Ingestion | GitHub Actions & Node.js scripts (NASA POWER, PAGASA, ERA5…) |

## Getting started

```bash
npm install        # install dependencies
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # eslint
npm run data:gather # fetch & regenerate all datasets
```

Copy `.env.example` to `.env.local` and fill in your Supabase keys when connecting
to a remote database. Until then, the platform runs seamlessly on authoritative
local datasets in `public/data/` and `src/lib/data.ts`.

## Core pages

| Route | Purpose |
|---|---|
| `/` | Home: national status hero, indicators, map preview, advisories |
| `/map` | Live Map: multi-layer interactive province map (MapLibre mount point) |
| `/area` | My Area: region/province selector + localized province dashboard |
| `/advisories` | Filterable official advisories & actionable guidance |
| `/learn` | El Niño education, historical ENSO events & FAQ |

Four core indicators: 🌡️ Temperature · 🌧️ Rainfall · 💧 Water · 🌾 Agriculture

## Project structure

```
src/
├── app/                  # App Router pages (home, map, area, advisories, learn)
├── components/           # Shared UI (header, cards, badges, map, filters)
└── lib/
    ├── types.ts          # Risk levels, score bands, rule-based explanations
    ├── data.ts           # Authoritative datasets & baseline statistics
    ├── data-service.ts   # Unified data access layer & client fetch helpers
    └── demo-data.ts      # Re-export compatibility shim
public/
└── data/                 # Boundaries (GeoJSON), stations, dams & indicators
scripts/                  # Data gathering & transformation scripts
```

## Design & data principles

- Every displayed figure carries an explicit **source + last-updated** timestamp
  (trust is a product feature).
- Explanations are **rule-based**, not AI-generated: predictable and auditable.
- Flat and tile-free mapping with zero recurring subscription fees.

## Live map (MapLibre)

The interactive province map in `/map` (and the homepage map band) renders
`public/data/provinces.geojson` at runtime — province boundaries from PSA PSGC data
(31 Dec 2023), published by `faeldon/philippines-json-maps` under MIT. The style is
flat and tile-free with no basemap, no API key, and no tile-usage policy risk,
keeping the stack at $0/month.

Layers: Impact · Temperature · Rainfall · Drought · Water · Agriculture.
Selecting a province opens a side panel with the indicator breakdown.
Run `npm run data:gather` (`node scripts/gather-all-data.mjs`) to regenerate and
verify all datasets.

## License

This project is licensed under the [MIT License](LICENSE).