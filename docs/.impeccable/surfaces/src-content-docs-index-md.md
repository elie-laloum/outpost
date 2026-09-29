---
version: 1
slug: "src-content-docs-index-md"
primary_target: "src/content/docs/index.md"
related_targets: ["src/content/docs/fr/index.md"]
---

# Surface: docs home landing (EN `index.md`, FR `fr/index.md`)

Mode: Persuade. Audience: TypeScript developers evaluating Outpost (see PRODUCT.md). Action: Get started → Setup; copy `npx @elie-laloum/outpost init`; tertiary Guide and Reference.

Confirmed shape (2026-09-29): layout grammar of better-auth.com, not its look; hero with tagline, install command, CTAs and a code window with static file tabs `run.ts` / `brief.md` / `workflow.ts` (representative example, labelled); three-pillar bordered grid; agents & sandboxes strip (text wordmarks, no invented logos); workflow showcase; quiet footer close, no CTA band. Anti-goals: pixel clone, marketing hype. Visual authority: the existing Guide chrome (Celestia grayscale, hairlines, Inter, light and dark).

## Direction contract

THESIS: The home is a working document framed like a blueprint: one hairline grid that runs from header to footer, every section a bay of that grid split on track 5 (the left bay says, the right bay proves) with inner cells on track 9, every claim backed by real code or facts in the bay beside it. It refuses the centered gradient hero with a feature-card farm.

OWN-WORLD: Celestia grayscale on both themes, 1px hairlines as the only structure, square-cornered bays, Inter at display weight with tight tracking, monospace reserved for code, commands and package names, one restrained accent used only for active code lines and focus.

STORY: A developer reads the tagline, sees the actual script they would run, understands that agent and sandbox are swappable, that they own credentials and state, and that runs become typed durable workflows; they copy the init command or open Setup.

FIRST VIEWPORT: Guide header across the top. Below it, the hero bay split on track 5 of 12: the left five tracks hold the tagline, one clause per line in white, sized so each English clause holds one line in the bay (about 2.6–3rem between 1280 and 1440; French clauses may wrap), one supporting sentence, the install command field with copy, Get started (solid) and Read the guide (outline) side by side, facts line under them; the right seven tracks hold the code window with the three file tabs, highlighted run.ts, copy control and a run-command strip at its foot. Primary action sits under the tagline, above the fold at 1280×720.

FORM: Brief-pinned layout (better-auth.com grammar), no concept roll; signature interaction: in the workflow showcase, focusing or hovering a numbered step highlights its lines in the code bay.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
