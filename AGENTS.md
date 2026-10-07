# AGENTS.md

Project entry file for AI coding agents.

## Stack

Next.js 16 (App Router, TypeScript) + Tailwind CSS v4 + shadcn/ui.
See `README.md` for commands and structure. Design direction lives in
`DESIGN.md`; product specs live in the three `bantay-el-nino-*.md` docs.

## antislop pointer

This project uses the antislop filter for all UI, copy, and code-comment work.

- Core rules: `antislop/antislop.md` (read before generating or editing UI)
- Skills: `antislop/skills/` (`antislop`, `antislop-ui`,
  `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`,
  `antislop-code`)
- Apply `DESIGN.md` direction on top of the filter; set the dials and declare
  a Design Read before UI work.
- Run the antislop Delivery Gate (PASS/FAIL report) before delivering any UI
  change, alongside lint and build.
