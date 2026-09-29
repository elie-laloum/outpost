---
version: 1
slug: "src-components-docsheader-astro"
primary_target: "src/components/DocsHeader.astro"
related_targets: []
---

# Surface: navigation bar (DocsHeader, every docs page and the landing)

Mode: Read chrome. Confirmed shape (2026-09-29): put the bar on the blueprint grid, search as the centre, add source links (GitLab, GitHub mirror, npm) and the version; remove "docs" from the brand; phones keep today's layout; no landing call to action; 4rem height kept; no dropdowns. Visual authority: DESIGN.md.

## Direction contract

THESIS: The header is the top row of the survey sheet: a strip of cells whose vertical hairlines continue the frame below (the brand cell ends exactly on the sidebar's 17rem edge), with search as the widest cell. It refuses the floating stock docs bar with a pill search box.

OWN-WORLD: DESIGN.md unchanged: grayscale, 1px hairlines between cells, square fields and key hints, Inter labels, drawn icons in muted ink, ember only for focus.

STORY: A reader sees where they are (current space inked and underlined on the bar's bottom line), reaches anything through the central search, and finds the canonical source and exact version one click away.

FIRST VIEWPORT: 4rem bar: brand cell 17rem (mark + "Outpost"); spaces cell (Guide / Reference / Project); search cell filling the rest with a full-height square field and Ctrl K hint; source cell (GitLab, GitHub, npm icons + v8.0.0 to the changelog); settings cell (language, theme). Cells hover to Slate Panel.

FORM: User-pinned extension, concept roll waived and no seed key: an extension of the established frame (new-work section 3 runs no concept tournament for extensions), and the user answered "go" to the confirmed brief on 2026-09-29; signature: the brand cell's right hairline and the sidebar's edge form one continuous line.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
