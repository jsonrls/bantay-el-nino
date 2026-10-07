# DESIGN.md

Direction for Bantay El Niño. Transcribed from `bantay-el-nino-website-blueprint.md`
(owner's direction) and formatted for the antislop filter (see `antislop/`).

## Design Read

> Reading this as: public-service climate dashboard for Filipino citizens,
> LGU staff, and farmers, in a civic data-journalism style
> (warm paper + serif display + tabular figures),
> dial ENERGY 1 / RHYTHM 2 / MOTION 1.

## Dials

| Dial | Value | Why |
|---|---|---|
| ENERGY | 1 (Calm) | A public-service information service must feel trustworthy and steady, not shouty (blueprint: "serious information service rather than a pretty dashboard") |
| RHYTHM | 2 (Consistent with a few breaks) | Core data views stay uniform and predictable; the home page breaks rhythm at the map band and editorial lists so the page has a spine |
| MOTION | 1 (Hover states only) | Health and safety information must render instantly and never move on its own; motion only confirms interaction |

## Identity

**Why:** the site must fail the "swap the logo" test (R-20).

- **Paper and ink:** warm off-white paper (`#FAF9F5`) with warm near-black ink.
  Reason: reads as printed public notices and broadsheet reporting, not a SaaS app.
- **Identity motif (repeated):** every number is set in IBM Plex Mono with
  tabular figures over a hairline rule; micro-labels are small uppercase mono.
  Reason: the product is measurements (gauges, anomalies, scores), so the
  instrument-panel figure treatment becomes the brand.
- **Severity rules:** risk is always carried by a sharp rectangular status tag
  and, in lists, a solid left severity bar. Reason: color marks real state only
  (R-13), and rectangles match the printed-notice language.
- **Hairline structure:** sections are separated by 1px warm hairlines and
  column rules instead of floating cards. Reason: hierarchy without shadow soup
  (R-12), like a newspaper page.

## Palette (R-29: 2 core + 1 accent + semantic status scale)

| Token | Value | Reason (R-31) |
|---|---|---|
| Paper (background) | `#FAF9F5` | warm paper: printed-notice identity, softer than default white |
| Ink (foreground) | `#1A1814` | near-black with warmth to match paper; AA-safe on paper |
| Accent: Signal Orange | `#C2410C` | one deliberate accent = heat itself; fires only on the impact score, primary CTA, and high/extreme severity |
| Status scale | `#4D7C0F` low, `#A16207` moderate, `#C2410C` high, `#991B1B` extreme | semantic system for real risk states only, never decoration |

No gradients, glows, or glass (R-01, R-10, R-13). Neutrals (paper, ink, warm
greys) do not count toward the palette cap.

## Typography (R-06: chosen for character, not as a default)

| Role | Typeface | Reason |
|---|---|---|
| Display (h1/h2) | Public Sans | clean, modern, unadorned civic sans for clear public legibility |
| Body/UI | Public Sans | typeface built for civic and government interfaces; plain, legible, unbranded by any tech product |
| Data/labels | IBM Plex Mono | designed for technical and data clarity; tabular figures for gauge readings and micro-labels |

Type sizes are hierarchical and deliberate: one giant figure per screen
(the focal score), bold civic sans for section heads, plain body text, mono for
measurements. No extreme-tracked shouting labels (R-06): micro-labels use
modest `0.08em` tracking only.

## Shape, shadow, texture

- **Radius: 0 everywhere.** Reason: printed notices are rectangular; hierarchy
  comes from rules and weight, not softness (R-11).
- **Shadows: none.** Reason: elevation is communicated by hairlines and the
  paper/white surface step (R-12).
- **No background grids, dots, or orbs** (R-07). Texture comes from type and rules.
- **Fixed light theme.** Reason: a heat-advisory service is read outdoors in
  bright sunlight, so a high-contrast light surface is a functional requirement,
  not a default (R-21). No toggle is shipped, so both-modes work does not apply (R-34).

## Icons (R-04)

Lucide icons appear only where the glyph literally names the datum
(Thermometer for temperature, CloudRain for rainfall, Droplets for water,
Wheat for agriculture). Relevance reason recorded here. No emoji in headings,
labels, or buttons (decorative emoji is an AI tell): the 🇵🇭 flag stays only in
the wordmark because it is the owner's named identity in the blueprint.
If no relevant glyph exists, no icon is used.

## Data honesty (R-17, R-38)

All figures are demo placeholders until Supabase ingestion ships. Every figure
carries a source line ("Demo figures, pending..."), the footer states the whole
build is demo data, and the header carries a "Demo build" marker. Numbers are
never presented as measured facts.

## Composition rules (R-05, R-14)

- No identical card grids: indicators are a divided data strip (table logic),
  advisories are a list with severity bars, "What's happening" is a numbered
  editorial row list.
- One focal point per screen: home = the 74/100 score, map = the map canvas,
  area = province score, advisories = the feed, learn = the step flow.
- Section order follows the product narrative (status, explanation, map,
  detail, advisories), not a landing-page template.

## Live map (MapLibre)

The interactive province map on `/map` (and the homepage map band) loads
`public/data/provinces.geojson` and `public/data/drought-assessment.json` at
runtime — province boundaries from PSA PSGC data (31 Dec 2023), published by
`faeldon/philippines-json-maps` under MIT (note the PSGC source itself; the
repository map files are MIT).

The style is flat and tile-free on purpose: paper-toned sea (`#f1eee5`),
no basemap, no API key, and no tile-usage policy risk (keeps the stack at
$0/month and the map on-brand). Layers: Impact · Temperature · Rainfall ·
Drought · Water · Agriculture. Selecting a province opens a side panel with the
indicator table (blueprint §3); Escape or the close button dismisses it.

Run `node scripts/gather-all-data.mjs` to regenerate and audit all geographic
and climate datasets.