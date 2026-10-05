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
  alarm: "oklch(70.4% 0.191 22.216)"
  alarm-deep: "oklch(39.6% 0.141 25.723)"
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
  nav-link-current:
    backgroundColor: "{colors.slate-panel}"
    textColor: "{colors.white-ink}"
    rounded: "{rounded.none}"
---

# Design System: Outpost

## Overview

**Creative North Star: "The Survey Sheet"**

Outpost's web surfaces read like a technical drawing. The frame is drawn first: one hairline grid, measured bays, and every element placed on it. The page has no decoration to fall back on. The structure is the lines, the content is real code and plain facts, and color appears only where something is live: a model at work, a focus ring, an experimental flag. It serves developers who read with a terminal open, so density is welcome and ornament is not.

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

- **Ember** (#fb923c dark / Ember Deep #c2410c light): focus rings, text selection and experimental status. Reading states and hover fills use the grayscale palette.
- **Notice colors:** Starlight’s note, tip, caution and danger colors identify the banner’s meaning. The background mixes the corresponding border color into the page surface and spans the content rail.

### Neutral

- **Night** (dark ground) / **Paper** (light ground): page and rail backgrounds. Night is Celestia's gray-950.
- **White Ink** (dark) / **Slate Ink** (light): headings, active tabs, icons and primary controls.
- **Mist** (dark body) / **Graphite** (light body): explanatory text and card descriptions.
- **Pewter** (dark muted) / **Steel** (light muted): captions, prerequisites, group labels and secondary controls.
- **Graphite** (dark hairline) / **Fog Line** (light hairline): frames and dividers, through `--sl-color-hairline-light`.
- **Slate Panel** (gray-800 dark, gray-200 light): hover states and navigation. Mixed into the page surface, it forms the code background.

### Named Rules

**The Focus Rule.** Ember marks focus, selection and experimental status. Tabs, hovers and link underlines use ink and grayscale fills.

**The Two-Theme Rule.** No color is picked for one theme alone. Each role above has a dark and a light value, and both must meet WCAG 2.2 AA.

## Typography

**Display Font:** Inter (with system-ui, sans-serif)
**Body Font:** Inter
**Label/Mono Font:** the platform monospace stack (ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono)

**Character:** a single humanist grotesque, tightened at display sizes, carries every voice. The monospace is a working tool, never a style.

Celestia sets the root to 14px. All rem values in this file are relative to that.

### Hierarchy

- **Display** (600, sized from its bay's width with container units, 1.05): the landing headline ("Your agents write code." / "You stay in control."), one clause per line, all in White/Slate Ink. The category label introduces coding agent orchestration in TypeScript.
- **Headline** (600, clamp(1.5rem, 2.2vw, 1.875rem), 1.15, -0.03em): section headings in the left bays; Guide page titles follow the same tight tracking at clamp(1.8rem, 3vw, 2.3rem).
- **Title** (500, 1.0625rem, -0.01em): card names and canvas nodes.
- **Body** (400, 1.0714rem, 1.75): explanations beside code, capped at a comfortable reading measure. Text uses `text-wrap: pretty`.
- **Label** (500, 0.8125rem): group labels, captions, tabs and footer headings.
- **Code** (400, 0.8125rem): install commands, snippets, filenames and API symbols.

### Named Rules

**The Working Mono Rule.** Monospace appears only on text a developer could paste or look up: code, commands, file names, function names. Never on labels, eyebrows or decoration.

**The Tight Display Rule.** Display and headline tracking never goes below -0.04em. Hierarchy comes from size and weight, never from gradient or color.

## Layout

The landing page sits in a centered rail, 90rem wide at most, with 1px hairlines on both edges. Outside the rail, a -45° hatch (1px lines every 8px, gray-5 at 45%) fills the margins like the unused area of a drawing sheet.

The home uses a 12-track frame: a 7 | 5 hero, then the same 5 | 7 prose and code bays as the Guide. Code-free sections use the full width, with a readable prose measure and cards or a canvas below. Each snippet has its explanation beside it on desktop and above it on mobile. The footer uses 5 | 4 | 3 columns. Horizontal hairlines separate sections; no content floats outside the frame.

The gutter follows `--docs-pad`: `clamp(1.25rem, 2.6vw, 2.5rem)`. Below 64rem the hero and split bays stack; below 40rem the rail loses its side borders and the footer becomes two columns below a full-width brand.

The documentation carries the same frame. Every Guide, API and changelog page shares one shell: a fixed 4rem header, a 17rem sidebar with a hairline edge, and a content pane of at most 84rem. The header offers Guide and API; its version button opens the changelog in either language and stays visible on mobile. The changelog uses the Guide sidebar, has no pagination and is excluded from search. The roadmap lives only in the repository's `roadmap.md`. Guide topics can be expanded, with first steps and the current topic open by default. From 100rem wide, a 16rem "On this page" rail joins the pane as a full-height column. The pane (with its rail) is centred as one sheet in the space beside the sidebar; the margins on both sides are hatched like the landing's out-of-frame area, with one hairline on each side of the sheet. Those edges are drawn outside the sheet, so with no margin they merge into the sidebar's edge and no line is drawn at the window edge. Inside the pane, a 2.75rem breadcrumb bar sits above a title section, then one section per `h2`, each laid on the 12-track frame:

- **Split** (5 | 7) when the section has code, a contract or entries. Prose goes left; code, signatures or log entries go right. The right column stays pinned while it fits the viewport and its prose is taller. The divider is drawn on the right column so it runs the full section height.
- **Reading order** in Guide sections: pair each code example with the prose preceding it, then render its explanation before the next example. Multiple examples form successive rows inside the same section.
- **Wide** when there is nothing to put on the right. Prose stays within 70ch; tables, cells and property rows take the full width.

Changelog sections pin their heading on the left and run their entries on the right. The docs gutter is `clamp(1.25rem, 2.6vw, 2.5rem)`; sections use 2.5rem of top and 2.75rem of bottom padding. Below 64rem, sections and the title stack to one column. Below 50rem (800px), the sidebar moves into the menu.

The Guide and API buttons occupy equal, fixed tracks at each breakpoint and use the same font weight in both states. Loading fonts or changing the active space must not move their edges.

### Named Rules

**The Shared Track Rule.** Every vertical hairline falls on a track of the 12-column frame, at 5, 7 or 9 on the landing. A section that needs a new division reuses one of these lines rather than adding another.

## Elevation & Depth

Flat. There are no shadows anywhere. Depth comes from tone: the code surface is a slightly lighter mix of Slate Panel into Night, pressed beats and controls and cells being worked on are a step lighter still, and hover states add the same tonal fill. Structure comes from hairlines alone.

### Named Rules

**The Flat Sheet Rule.** Nothing casts a shadow. When an element needs to stand apart, it gets a tonal fill or a hairline.

## Shapes

Square corners on page sections, cells, buttons, code blocks, notices, tabs and navigation states. Icons use the Guide’s 24px SVG grid, a 1.6 stroke and round caps and joins. Breadcrumbs and path connectors are drawn from rules, rather than decorative glyphs.

## Components

### Buttons

Blunt, rectangular and confident.

- **Shape:** square corners (0px), 2.75rem tall, 0 1.25rem padding, 0.9375rem at weight 500.
- **Primary:** inverted, a White Ink fill with Night text (reversed in light theme). A drawn arrow follows the label and moves 3px right on hover.
- **Outline:** a transparent fill with a gray-5 hairline border and White/Slate Ink text. On hover the border lightens to gray-3 and a Slate Panel fill appears.
- **Focus:** a 2px ember outline with a 2px offset.

### Documentation Home

The home introduces Outpost through its benefits: put agents to work on fixes, reviews and maintenance, choose their environment and decide how to validate and integrate their changes. English and French copy live in `index.md` and `fr/index.md`; frontmatter describes the hero and footer, while Markdown holds the working example and learning sequence. Calls to action invite the reader to run a first task. `Landing.astro` renders this content with the same bays and components as the Guide.

The hero states what Outpost does, provides the installation and API links, and names the three choices for a task: agent, execution environment and Git branch. Each choice is a linked card with the Guide’s icon. Package-manager tabs offer a copyable install command, with keyboard navigation and a localized copy status.

Four sections follow in reading order:

1. A first task in two named `.ts` files, beside the explanation of how to run it and what it returns.
2. A movable, zoomable canvas showing the request, workspace and sandbox, agent turn and result to review.
3. Linked cards for agents, sandbox providers and the built-in harness.
4. Workflow examples, followed by links to typed responses, approval gates and durable runs.

Setup is linked to its Guide page. The note below the example spans the home’s content rail. Code has at most 20 lines per file and is typechecked with the Guide examples. The final installation and API actions divide the row equally, including on mobile. All explanations remain visible while reading; the canvas moves only when the reader interacts with it.

The hero splits 7 | 5 on the 12-track frame; the content below uses the Guide’s 5 | 7 bays. Below 64rem, the hero and code rows stack. The three overview cards form a row on tablets and stack below 40rem. The home rail is at most 90rem wide, keeping the same hairlines, hatch, typefaces and two-theme palette as the documentation.

### Property Rows

Reference parameters and properties become ruled rows rather than a table. Each row holds the monospace name (weight 600, ink) with its presence on the right: Required in ink, Optional muted. The full type follows on its own line in muted monospace, wrapping freely, then the meaning at 0.9rem. Nested options (`options.agent`) are indented behind a hairline, one step per level.

### Docs Code Blocks

Markdown code blocks keep Celestia's highlighting and copy button, set square, inside a hairline border on the code surface. Inline code uses a tonal chip (Slate Panel at 70%) without a border.

Notice banners span the content section and stop at its borders, before the hatched gutters and table-of-contents column. On mobile the content section fills the viewport. Their text remains aligned with the article, and their colored backgrounds and borders stay visible in both themes. The content pane is an inline-size container, so banner widths follow the article width.

### Guide Components

Guide pages show before they tell. An HTML comment before a Markdown list (`<!-- features -->`, `<!-- path -->`, `<!-- canvas -->`, `<!-- files -->`) becomes one of four drawn components, built by `docs/scripts/guide-components.mjs` and styled in `docs/src/styles/guide-components.css`. They run flush with the bay edges, like bay cells, and use hairlines only.

- **Feature cells:** a 3-column grid (2 below 64rem, 1 below 40rem). Every cell, linked or informational, has a drawn icon in ink, a Title-style name, one Pewter/Steel sentence and a row of tags pushed to the cell's foot. A registration cross (two 1px strokes, gray-4) marks each inner corner, like the corner ticks of a drawing sheet. Linked cells gain the code-surface fill on hover.
- **Tags:** 1px hairline boxes at label size. API names keep the monospace; product and concept names stay in Inter.
- **Path:** linked stages side by side, each divider carrying a drawn chevron (two hairline borders turned 45°) that points to the next stage. Below 64rem the stages stack and the chevron turns down.
- **Canvas:** pannable, zoomable diagrams with nodes, branches and labeled connections. Sequential phases share a lane and connect in reading order; nested steps keep their icons and execution tags.
- **File tree:** ruled rows with a muted file or folder icon, the monospace name in ink and a one-line note; folders indent their entries behind a hairline.

Every guide card has a decorative SVG icon, including diagram branches and numbered cards. Icons come from `docs/scripts/guide-icons.mjs` on the 24px grid with the 1.6 stroke. Linked cards use the destination page's icon; informational cards use their title's subject in either language, with a book as the fallback. The sequence of a path or canvas is carried by its connectors, never by numerals.

At the bottom of a documentation page, navigation actions divide the full content width into equal columns at every screen size. One action fills the row; two each take half; additional actions share it equally. Missing previous or next links leave no empty cell. The edit link occupies a separate row.

Every snippet or tab group sits beside a relevant explanation. A heading or API link alone leaves an empty prose column and is rejected by the rendered-page checks. Introductions belong before their examples in Markdown, so they sit beside the code on desktop and above it on mobile.

Guide code blocks contain at most 20 lines, including imports. Longer examples become separate, named files in tab groups of at most five. Split by responsibility, keep imports explicit and explain which file to run. Do not compress statements to meet the limit.

File tabs scroll horizontally within the code block, with a visible scrollbar, mouse-wheel scrolling, mouse dragging and native touch swipes. Keyboard selection reveals the active filename without scrolling the page. Dragging moves the strip without selecting a different file.

## Do's and Don'ts

### Do:

- **Do** place every vertical division on the shared 12-track frame (tracks 5, 7 and 9 on the landing).
- **Do** prove each claim in the bay beside it with a working demonstration, real typechecked code or a factual table.
- **Do** keep ember for focus, selection and experimental status.
- **Do** give every color role a dark and a light value that meet WCAG 2.2 AA.
- **Do** use drawn SVG icons with a 1.6 stroke and round caps and joins.
- **Do** make every code surface scroll inside itself, with edge fades instead of page overflow.

### Don't:

- **Don't** add shadows, glows or glass. Depth is tonal.
- **Don't** round the corners of landing bays, cells, buttons or code surfaces.
- **Don't** use monospace for labels, eyebrows or decoration.
- **Don't** put kickers or eyebrows above headings.
- **Don't** reduce inactive code to low-contrast gray to emphasize a range. Tint the active range instead.
- **Don't** use Unicode arrows or emoji as icons.
- **Don't** add superlatives, adoption claims, testimonials or invented logos.
