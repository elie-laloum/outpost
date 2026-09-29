---
version: 1
slug: "src-content-docs-guide-introduction-md"
primary_target: "src/content/docs/guide/introduction.md"
related_targets: ["src/content/docs/reference/dispatch.md","src/content/docs/project/changelog.md"]
---

# Surface: documentation pages (Guide, Reference, Project; EN and FR)

Mode: Read. Readers: TypeScript developers learning a capability (Guide), looking up an exact contract (Reference) or checking what changed (Project). Confirmed shape (2026-09-29): one shared frame; full blueprint of 5 | 7 bays; sticky code beside its section; code-free sections, tables and notes run full width at a ~70ch measure; right "On this page" rail only on wide screens; breadcrumbs replace the chapter label; /reference/ becomes a family map (AGENTS.md updated); changelog and roadmap as bays. Untouched: landing, URLs and redirects, search, snippet typechecking, generated reference pipeline, EN/FR parity. Visual authority: DESIGN.md ("The Survey Sheet").

## Direction contract

THESIS: Every documentation page is a survey sheet: the landing's 12-track frame continues into reading, each h2 a bay where the left five tracks explain and the right seven prove with code or contracts pinned beside the prose. It refuses the stock three-column docs theme with floating cards and a separate API skin.

OWN-WORLD: DESIGN.md unchanged: Celestia grayscale in both themes, 1px hairlines as the only structure, square corners, Inter, monospace only for code and API names, ember only for live state, focus and experimental flags.

STORY: A reader lands anywhere, recognises the same frame, sees where they are from the breadcrumb and header, reads prose with its code beside it, scans an API's shape in property rows beside its pinned signature, and moves on through cells to the next page.

FIRST VIEWPORT: Fixed 4rem header (brand, Guide / Reference / Project with the current space in ink, search, language, theme); 17rem sidebar for the current space with a hairline edge; content column with a thin breadcrumb bar, then a full-width title bay (title at headline-plus scale, description; on symbols: kind icon, mono name, family, stability, import on the right), then the first bay split on track 5 with its code pinned right. Right rail only from about 100rem.

FORM: User-pinned, no concept roll and no seed key: in the 2026-09-29 shape round the user answered "Full blueprint" to "How far should the docs move toward the landing's look", then "confirmed" the brief; a pinned direction beats the roll; signature interaction: section code pinned beside its prose and released at the section's end; on symbol pages, the signature stays beside the property rows.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
