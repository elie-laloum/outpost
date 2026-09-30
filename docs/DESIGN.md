---
name: Outpost
description: Run an agent, own its environment, compose a workflow.
colors:
  night: "oklch(13% 0.028 261.692)"
  paper: "#ffffff"
  white-ink: "#ffffff"
  slate-ink: "oklch(21% 0.034 264.665)"
  mist: "oklch(87.2% 0.01 258.338)"
  graphite: "oklch(37.3% 0.034 259.733)"
  pewter: "oklch(70.7% 0.022 261.325)"
  steel: "oklch(55.1% 0.027 264.364)"
  slate-panel: "oklch(27.8% 0.033 256.848)"
  fog-line: "oklch(92.8% 0.006 264.531)"
  ember: "#fb923c"
  ember-deep: "#c2410c"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 10.2cqi, 3.4rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.2vw, 1.875rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1.25rem, 3.2vw, 3rem)"
  bay-block: "3.5rem"
  stack: "1rem"
  cell-block: "1.4rem"
components:
  button-primary:
    backgroundColor: "{colors.white-ink}"
    textColor: "{colors.night}"
    rounded: "{rounded.none}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.mist}"
  button-outline:
    backgroundColor: "{colors.night}"
    textColor: "{colors.white-ink}"
    rounded: "{rounded.none}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-outline-hover:
    backgroundColor: "{colors.slate-panel}"
  code-tab-selected:
    textColor: "{colors.white-ink}"
    typography: "{typography.code}"
    padding: "0 1rem"
  pain-row:
    textColor: "{colors.mist}"
    rounded: "{rounded.none}"
    padding: "1.4rem clamp(1.25rem, 3.2vw, 3rem)"
  runtime-name:
    textColor: "{colors.white-ink}"
    rounded: "{rounded.none}"
    padding: "0 0.8rem"
    height: "2.25rem"
  demo-step:
    backgroundColor: "{colors.night}"
    textColor: "{colors.white-ink}"
    rounded: "{rounded.none}"
    padding: "0.8rem 0.8rem 0.7rem"
  demo-tag-model:
    backgroundColor: "{colors.white-ink}"
    textColor: "{colors.night}"
    rounded: "{rounded.none}"
    padding: "0.15rem 0.4rem"
  demo-tag-code:
    textColor: "{colors.pewter}"
    rounded: "{rounded.none}"
    padding: "0.15rem 0.4rem"
  demo-beat-pressed:
    textColor: "{colors.white-ink}"
    rounded: "{rounded.none}"
    height: "2.75rem"
  nav-link-current:
    backgroundColor: "{colors.slate-panel}"
    textColor: "{colors.white-ink}"
    rounded: "{rounded.none}"
---

# Design System: Outpost

## Overview

**Creative North Star: "The Survey Sheet"**

Outpost's web surfaces read like a technical drawing. The frame is drawn first: one hairline grid, measured bays, and every element placed on it. The page has no decoration to fall back on. The structure is the lines, the content is real code and plain facts, and color appears only where something is live: an active code range, a model at work, a focus ring, an experimental flag. It serves developers who read with a terminal open, so density is welcome and ornament is not.

The system is inherited from the Starlight documentation chrome with the Celestia theme: a cool grayscale in both light and dark, Inter for all prose, the platform monospace for code, and a single ember accent. The landing page on the docs home extends that chrome with no new identity. It is the same header, the same hairlines and the same grays, set out as a blueprint of bays.

Both themes are first-class. Every value below has a dark and a light counterpart, and the theme switch in the header selects between them.

**Key Characteristics:**

- One 12-track frame; sections split at track 5, inner cells at track 9.
- 1px hairlines as the only structure; square corners on the landing.
- Grayscale everywhere; ember only for live state and focus.
- Monospace strictly for code, commands and API names.
- Every bay carries its proof: a working demonstration, real typechecked code or plain facts.

## Colors

A cool slate grayscale taken from Celestia's Tailwind grays. The ember accent is used sparingly, so it stands out when it appears.

### Primary

- **Ember** (#fb923c dark / Ember Deep #c2410c light): the only accent. It marks the active code lines in a highlighted range (a 10% tint and a 2px gutter marker), a model or agent step running right now in the orchestration demo (a 12% tint mixed in sRGB and a 2px ember underline that grows for the step's duration), focus rings (2px outline), text selection (a 32% tint), and the experimental flask on Firecracker. Nothing else is orange: finished steps, code steps and model owner tags stay in ink.

### Neutral

- **Night** (dark ground) / **Paper** (light ground): page and rail backgrounds. Night is Celestia's gray-950.
- **White Ink** (dark) / **Slate Ink** (light): headings, primary labels, active tabs and beats, filled step numbers, the filled model and agent owner tags, and the primary button's fill.
- **Mist** (dark body) / **Graphite** (light body): body copy, lane captions and pain details.
- **Pewter** (dark muted) / **Steel** (light muted): captions, the facts line, inactive tabs and beats, outlined code owner tags, meter labels and fills at rest, step notes and group labels. Both pass 4.5:1 on their ground.
- **Graphite** (dark hairline) / **Fog Line** (light hairline): every rule, frame edge and cell divider, through `--sl-color-hairline-light`.
- **Slate Panel** (gray-800 dark, gray-200 light): hover fill for buttons and navigation. Mixed at 45% into Night, it becomes the code surface (at 80% for a selected tab).

### Named Rules

**The Live-Only Ember Rule.** Ember marks what is active or focused right now: highlighted code, a model or agent step running right now, focus, selection, experimental status. Selected tabs, pressed steps, hovers and link underlines use white or slate ink and fills, never ember.

**The Two-Theme Rule.** No color is picked for one theme alone. Each role above has a dark and a light value, and both must meet WCAG 2.2 AA.

## Typography

**Display Font:** Inter (with system-ui, sans-serif)
**Body Font:** Inter
**Label/Mono Font:** the platform monospace stack (ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono)

**Character:** a single humanist grotesque, tightened at display sizes, carries every voice. The monospace is a working tool, never a style.

Celestia sets the root to 14px. All rem values in this file are relative to that.

### Hierarchy

- **Display** (600, sized from its bay's width with container units, 1.05): the landing headline ("Code orchestrates." / "Agents think."), one clause per line, all in White/Slate Ink. The former tagline now sits in the footer under the wordmark at 0.875rem in Pewter/Steel.
- **Headline** (600, clamp(1.5rem, 2.2vw, 1.875rem), 1.15, -0.03em): section headings in the left bays; Guide page titles follow the same tight tracking at clamp(1.8rem, 3vw, 2.3rem).
- **Title** (500, 1.0625rem, -0.01em): lane titles, pain names and step titles. Demo step names use 0.9375rem at 500 (0.75rem below 40rem).
- **Body** (400, 1rem, 1.65): explanatory copy, capped at about 34rem, with `text-wrap: pretty`. Guide articles use 0.95rem at 1.8.
- **Label** (500, 0.8125rem): group labels, captions, footer headings, the facts line, the demo title, beats and meter labels. Owner tags, step notes and the Interrupted mark drop to 0.75rem.
- **Code** (400, 0.8125rem, 1.7): code windows, the install command and API names.

### Named Rules

**The Working Mono Rule.** Monospace appears only on text a developer could paste or look up: code, commands, file names, function names. Never on labels, eyebrows or decoration.

**The Tight Display Rule.** Display and headline tracking never goes below -0.04em. Hierarchy comes from size and weight, never from gradient or color.

## Layout

The landing page sits in a centered rail, 82rem wide at most, with 1px hairlines on both edges. Outside the rail, a -45° hatch (1px lines every 8px, gray-5 at 45%) fills the margins like the unused area of a drawing sheet.

Inside the rail, every section is a bay on a 12-track frame split 5 | 7. The left bay states the idea (heading, one paragraph, a link), and the right bay proves it (the orchestration demo, the pain/answer table, a code window, or name boxes). Rows inside the right bay split 4 | 3, so their divider falls on track 9 in every section. The footer's columns start on the same tracks 5 and 9. Horizontal hairlines separate the bays. Content never floats outside a bay. A framed figure (a code window, the orchestration demo) is a drawing set inside its bay; its inner divisions follow its own content.

The gutter is `clamp(1.25rem, 3.2vw, 3rem)`. Bays use 3.5rem of vertical padding, stacks inside them 1rem gaps, and cells 1.4rem. More space sits above a heading than below it.

Below 64rem, every bay stacks to one column: the left bay first, then its proof, separated by a hairline. Below 40rem, the rail loses its side borders, code windows and the demo run edge to edge, pain rows stack, and the footer becomes two columns under a full-width brand. The hero's first viewport keeps the primary action above the fold at 1280×720.

The documentation carries the same frame. Every Guide, Reference and Project page shares one shell: a fixed 4rem header, a 17rem sidebar for the current space with a hairline edge, and a content pane of at most 84rem. The margin beyond the pane is hatched, like the landing's out-of-frame area. From 100rem wide, a 16rem "On this page" rail joins the frame as a full-height column. Inside the pane, a 2.75rem breadcrumb bar sits above a title section, then one section per `h2`, each laid on the 12-track frame:

- **Split** (5 | 7) when the section has code, a contract or entries. Prose goes left; code, signatures or log entries go right. The right column stays pinned while it fits the viewport and its prose is taller. The divider is drawn on the right column so it runs the full section height.
- **Wide** when there is nothing to put on the right. Prose stays within 70ch; tables, cells and property rows take the full width.

Changelog and roadmap sections pin their heading on the left and run their entries on the right. The docs gutter is `clamp(1.25rem, 2.6vw, 2.5rem)`; sections use 2.5rem of top and 2.75rem of bottom padding. Below 64rem, sections and the title stack to one column. Below 50rem (800px), the sidebar moves into the menu.

### Named Rules

**The Shared Track Rule.** Every vertical hairline falls on a track of the 12-column frame, at 5 or 9 on the landing. A section that needs a new division reuses one of these lines rather than adding another.

## Elevation & Depth

Flat. There are no shadows anywhere. Depth comes from tone: the code surface is a slightly lighter mix of Slate Panel into Night, selected tabs are a step lighter still, and hover states add the same tonal fill. Structure comes from hairlines alone.

### Named Rules

**The Flat Sheet Rule.** Nothing casts a shadow. When an element needs to stand apart, it gets a tonal fill or a hairline.

## Shapes

Square, everywhere. Landing bays, docs sections, cells, buttons, code windows and code blocks, the install field, step number boxes, demo step cells, owner tags, context meters, beat buttons, runtime name boxes, inline code and sidebar hover and current states all have 0 radius. Icons are drawn SVG with a 1.6 stroke, round caps and round joins. Breadcrumb separators and the demo's code-lane chevrons are drawn with two hairline borders, not glyphs. The one dashed line in the system is the demo's Interrupted cut.

## Components

### Buttons

Blunt, rectangular and confident.

- **Shape:** square corners (0px), 2.75rem tall, 0 1.25rem padding, 0.9375rem at weight 500.
- **Primary:** inverted, a White Ink fill with Night text (reversed in light theme). A drawn arrow follows the label and moves 3px right on hover.
- **Outline:** a transparent fill with a gray-5 hairline border and White/Slate Ink text. On hover the border lightens to gray-3 and a Slate Panel fill appears.
- **Focus:** a 2px ember outline with a 2px offset.

### Code Window

The workflow bay's proof. The hero no longer carries a code window.

- **Frame:** a 1px hairline around a code surface (Slate Panel at 45% in Night).
- **Bar:** a 2.75rem strip holding mono file tabs, or a single mono title, with a square copy button at the right edge.
- **Tabs:** inactive tabs use Pewter/Steel text. The selected tab gets White/Slate Ink text, the 80% fill and a 2px underline in ink. Arrow keys, Home and End move between tabs.
- **Body:** line numbers in a right-aligned gutter using tabular numerals. The window scrolls in both directions itself. A 2.5rem fade appears on whichever edge still has hidden content, and the scrollbar is themed gray-5.
- **Highlighted range:** a 10% ember tint, a 2px ember gutter marker and ink-colored line numbers. Inactive lines stay at full syntax contrast; nothing is dimmed.
- **Foot:** an optional note strip. It shows a `$` command in mono, or a plain-language note.
- **Copy feedback:** the icon swaps to a check in ink, with an announcement through a polite status region.

### Install Field

A single-line code field with a muted `$` prompt, the command in White/Slate Ink, and a square copy button behind a hairline. It uses the same copy feedback as the code window.

### Orchestration Demo

The signature component: the hero's proof. One job (Branch, Fix, Verify, Integrate) runs twice, once with a model deciding every step and once in code, inside a framed figure on the code surface.

- **Bar:** a 2.75rem strip with the job title (Label, ink) and, at the right edge behind a hairline, a square pause/replay toggle with drawn icons. The toggle is hidden under reduced motion.
- **Lanes:** two stacked lanes, "An LLM orchestrates" above "Code orchestrates", separated by a hairline. Each has a Title-style name, a caption for the current beat (all captions share one grid cell so switching never shifts the layout), a row of four step cells and a context meter.
- **Step cells:** a 4-column grid whose dividers are 1px gaps over the line colour, on the Night ground. Each cell holds the step name, an owner tag, a note slot and a drawn check that appears when done. Model and agent tags are filled in White/Slate Ink; code tags are outlined in a hairline with Pewter/Steel text, so the split reads at rest.
- **Running state:** a model or agent step gets the ember tint and an ember underline that grows over its run time; a code step gets the 80% code fill and a Pewter/Steel underline. Only the code lane draws chevrons between its steps, because only its order is fixed.
- **Context meter:** a label and a 0.5rem hairline track whose Pewter/Steel fill grows with each model step (the code lane stays at a quarter).
- **Beats:** four buttons along the foot (Steps, Context, Order, Resume), split by hairlines. The pressed beat takes the 80% fill and ink text; while playing, a 2px ink underline runs across it for the beat's duration. Each beat puts ink on what it explains: code tags, the meters, the code chevrons.
- **Order beat:** the last two model cells swap places and the moved Integrate cell shows "too early".
- **Resume beat:** a dashed ink "Interrupted" cut drops down the middle of both lanes, labelled in a hairline box; lane titles and captions knock the line out with the code-surface fill. The model lane reruns its first steps marked "reread"; the code lane marks them "restored".
- **Motion:** autoplays once when 35% in view, then chains through the beats; clicking a beat plays it alone. Transitions use the landing ease. Under reduced motion nothing animates: every beat button shows its still end state.
- **Accessibility:** the stage is hidden from assistive technology; a visually hidden list gives each beat's two captions as text. Beat buttons are a labelled group with `aria-pressed`, and focus draws the ember outline inside.

### Pain Table

A definition table in the problem bay. Each group opens with a head row (the group name and, on track 9, the "With Outpost" column label, both Label style in Pewter/Steel). Each row splits 4 | 3: the pain (Title in ink) over its detail on the left, the answer in ink on the right behind a hairline. Groups and rows are separated by hairlines.

Below 40rem the columns stack: the group head becomes a tonal band (code-surface fill, the group name in ink at 600, the column label hidden), and each answer sits under an inset hairline with a visible "With Outpost:" lead-in. On wider screens that lead-in is visually hidden but read aloud.

### Runtime Names

The agents and sandboxes bay lists two groups (a Label head row above a hairline) of linked name boxes that wrap: 2.25rem tall, a 1px hairline border, the name at 0.9375rem and 500 in ink. Hover darkens the border to gray-4 and adds the code-surface fill. The experimental Firecracker entry carries the ember flask with a localized accessible label.

### Step List

A numbered list where the sequence carries meaning. Each row is a full-width button with hairline separators. The number sits in a 1.75rem square box. Pressed state is a tonal fill with an ink-filled number box. Focusing or hovering a step highlights its lines in the paired code window and scrolls the window to them. The page itself never scrolls.

### Navigation

- **Header:** a fixed 4rem strip of cells separated by 1px hairlines. The brand cell is exactly 17rem (the mark and "Outpost"), so its right hairline continues the sidebar's edge. Then a 16rem spaces cell, a search cell that fills the rest and is itself the field (code-surface fill, "Search the docs", square `Ctrl K` keys), a source cell (GitLab, GitHub mirror and npm icons, then the version in monospace linking to the changelog), and a settings cell (language, theme). Icon buttons (GitLab, GitHub, npm, theme) are full-height squares; every item on the right draws only its own right hairline, so shared edges stay single. Text targets fill with Slate Panel on hover; icon buttons have no hover color. Every target shows the ember outline, drawn inside, on focus.
- **Language:** one link to the same page in the other language, named in full ("Français" / "English") from 80rem; below that the current code sits in ink beside the other code as the link ("EN FR"). The not-found page links to the other language's home.
- **Responsive header:** the version hides below 80rem; the source cell moves to the sidebar footer below 64rem; below 50rem the bar keeps the mark, the spaces, a search icon and the menu, and the menu footer holds the source links, version, language and theme.
- **Spaces:** Guide, Reference and Project sit in the header. The current space is in ink at weight 500 with a 2px ink underline; the others are in Pewter/Steel.
- **Sidebars:** one per space. Group headings are 0.78rem muted labels over a hairline. Links are 0.875rem; hover and current states use a square Slate Panel fill, with the current link at weight 500. The Reference sidebar opens with a "Reference map" link. Its families collapse, their labels are 0.9375rem in ink, and long API names wrap only between words.
- **Mobile:** the menu toggle reveals the current space's sidebar in full width (the Guide sidebar on the landing page).

### Title Section

A breadcrumb bar (space, group, family: all links except the last) sits above a full-width title section. Guide and Project titles are Inter 600 at clamp(2rem, 3.2vw, 2.75rem), with the description below them. Reference symbol titles are set in monospace at clamp(1.6rem, 2.6vw, 2.2rem) with the kind icon before the name and the ember flask after it. The import line sits on the right, or under the title when the name is longer than 24 characters.

### Property Rows

Reference parameters and properties become ruled rows rather than a table. Each row holds the monospace name (weight 600, ink) with its presence on the right: Required in ink, Optional muted. The full type follows on its own line in muted monospace, wrapping freely, then the meaning at 0.9rem. Nested options (`options.agent`) are indented behind a hairline, one step per level.

### Docs Code Blocks

Markdown code blocks keep Celestia's highlighting and copy button, set square, inside a hairline border on the code surface. Inline code uses a tonal chip (Slate Panel at 70%) without a border.

### Guide Components

Guide pages show before they tell. An HTML comment before a Markdown list (`<!-- features -->`, `<!-- path -->`, `<!-- flow -->`, `<!-- files -->`) becomes one of four drawn components, built by `docs/scripts/guide-components.mjs` and styled in `docs/src/styles/guide-components.css`. They run flush with the bay edges, like bay cells, and use hairlines only.

- **Feature cells:** a 3-column grid (2 below 64rem, 1 below 40rem). Each cell is a link with a drawn icon in ink, a Title-style name, one Pewter/Steel sentence and a row of tags pushed to the cell's foot. A registration cross (two 1px strokes, gray-4) marks each inner corner, like the corner ticks of a drawing sheet. Hover adds the code-surface fill.
- **Tags:** 1px hairline boxes at label size. API names keep the monospace; product and concept names stay in Inter.
- **Path:** linked stages side by side, each divider carrying a drawn chevron (two hairline borders turned 45°) that points to the next stage. Below 64rem the stages stack and the chevron turns down.
- **Flow:** one column per phase with a tonal head (phase name and one line) above ruled steps; host or sandbox tags under each step, chevrons between phases.
- **File tree:** ruled rows with a muted file or folder icon, the monospace name in ink and a one-line note; folders indent their entries behind a hairline.

Icons are drawn per Guide page in `docs/scripts/guide-icons.mjs` on the 24px grid with the 1.6 stroke. The sequence of a path or flow is carried by its connectors, never by numerals.

## Do's and Don'ts

### Do:

- **Do** place every vertical division on the shared 12-track frame (tracks 5 and 9 on the landing).
- **Do** prove each claim in the bay beside it with a working demonstration, real typechecked code or a factual table.
- **Do** keep ember for highlighted code, a model or agent step running right now, focus, selection and experimental status only.
- **Do** give every color role a dark and a light value that meet WCAG 2.2 AA.
- **Do** use drawn SVG icons with a 1.6 stroke and round caps and joins.
- **Do** make every code window scroll inside itself, with edge fades instead of page overflow.

### Don't:

- **Don't** add shadows, glows or glass. Depth is tonal.
- **Don't** round the corners of landing bays, cells, buttons or code windows.
- **Don't** use monospace for labels, eyebrows or decoration.
- **Don't** put kickers or eyebrows above headings.
- **Don't** reduce inactive code to low-contrast gray to emphasize a range. Tint the active range instead.
- **Don't** use Unicode arrows or emoji as icons.
- **Don't** add superlatives, adoption claims, testimonials or invented logos.
