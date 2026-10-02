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

- **Ember** (#fb923c dark / Ember Deep #c2410c light): the only accent. It marks a model or agent step running right now in the orchestration demo (a 12% tint mixed in sRGB and a 2px ember underline that grows for the step's duration), the model's context meter once it passes half, focus rings (2px outline), text selection (a 32% tint), and the experimental flask when a runtime carries one. Nothing else is orange: finished steps, code steps and owner tags stay in ink.

**Alarm** (`--sl-color-red`, light red on the dark ground, deep red on the light one): one job only, the model's context meter past three quarters. Nothing else in the system is red, and nothing uses it for an error, a required field or a destructive action.

### Neutral

- **Night** (dark ground) / **Paper** (light ground): page and rail backgrounds. Night is Celestia's gray-950.
- **White Ink** (dark) / **Slate Ink** (light): headings, primary labels, pressed beats and controls, the filled model and agent owner tags, and the primary button's fill.
- **Mist** (dark body) / **Graphite** (light body): body copy, lane and beat captions, the response figure's reply, and pain details.
- **Pewter** (dark muted) / **Steel** (light muted): captions, the facts ticker, the struck rule on a pain, the demo's step times, inactive beats, outlined code owner tags, meter labels and fills at rest, step notes, the response figure's pane labels and its tag before it is read, a disabled control, and group labels. Both pass 4.5:1 on their ground.
- **Graphite** (dark hairline) / **Fog Line** (light hairline): every rule, frame edge and cell divider, through `--sl-color-hairline-light`.
- **Slate Panel** (gray-800 dark, gray-200 light): hover fill for buttons and navigation. Mixed at 45% into Night, it becomes the code surface (at 80% for a pressed beat or control and a table cell being worked on).

### Named Rules

**The Live-Only Ember Rule.** Ember marks what is active or focused right now, plus one cost that is accumulating: a model or agent step running right now, the model's context meter past half, focus, selection, experimental status. Pressed beats and controls, hovers and link underlines use white or slate ink and fills, never ember.

**The One Alarm Rule.** The meter is the only element that turns red, and only past three quarters. A second red anywhere would make the first one ordinary.

**The Two-Theme Rule.** No color is picked for one theme alone. Each role above has a dark and a light value, and both must meet WCAG 2.2 AA.

## Typography

**Display Font:** Inter (with system-ui, sans-serif)
**Body Font:** Inter
**Label/Mono Font:** the platform monospace stack (ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono)

**Character:** a single humanist grotesque, tightened at display sizes, carries every voice. The monospace is a working tool, never a style.

Celestia sets the root to 14px. All rem values in this file are relative to that.

### Hierarchy

- **Display** (600, sized from its bay's width with container units, 1.05): the landing headline ("Run coding agents" / "from your TypeScript."), one clause per line, all in White/Slate Ink. The former tagline now sits in the footer under the wordmark at 0.875rem in Pewter/Steel.
- **Headline** (600, clamp(1.5rem, 2.2vw, 1.875rem), 1.15, -0.03em): section headings in the left bays; Guide page titles follow the same tight tracking at clamp(1.8rem, 3vw, 2.3rem).
- **Title** (500, 1.0625rem, -0.01em): lane titles and pain names. Demo step names use 0.9375rem at 500 (0.75rem below 40rem).
- **Body** (400, 1rem, 1.65): explanatory copy, capped at about 34rem, with `text-wrap: pretty`. Guide articles use 0.95rem at 1.8.
- **Label** (500, 0.8125rem): group labels, captions, footer headings, the facts ticker (0.9375rem), the demo title, beats, meter labels and the response figure's pane labels. Step notes and the Interrupted mark drop to 0.75rem; owner tags to 0.75rem.
- **Code** (400, 0.8125rem, 1.7): the install command, the hero's `dispatch()` excerpt and API names; the excerpt drops to 0.75rem below 40rem. The response figure sets all three of its panes at 0.75rem.

### Named Rules

**The Working Mono Rule.** Monospace appears only on text a developer could paste or look up: code, commands, file names, function names. Never on labels, eyebrows or decoration.

**The Tight Display Rule.** Display and headline tracking never goes below -0.04em. Hierarchy comes from size and weight, never from gradient or color.

## Layout

The landing page sits in a centered rail, 82rem wide at most, with 1px hairlines on both edges. Outside the rail, a -45° hatch (1px lines every 8px, gray-5 at 45%) fills the margins like the unused area of a drawing sheet.

Inside the rail, every section is a bay on a 12-track frame split 5 | 7. The left bay states the idea (heading, one paragraph, a link), and the right bay proves it (the `dispatch()` excerpt, use-case rows, the pain stage, the response figure, runtime name boxes or boundary rows). One bay escapes the split entirely: the orchestration demo is a full-width figure across all twelve tracks, because its own four-step lanes need the frame. It sits between the use cases and the agents and sandboxes it runs on, one bay above the argument it opens. A bay's trailing link follows the paragraph it belongs to; the sheet left under it is unused area, not a gap to fill. Rows inside the right bay split 4 | 3, so their divider falls on track 9 in every section. The footer's columns start on the same tracks 5 and 9. Horizontal hairlines separate the bays. Content never floats outside a bay. A framed figure (the orchestration demo) is a drawing set inside its bay; its inner divisions follow its own content.

The gutter is `clamp(1.25rem, 3.2vw, 3rem)`. Bays use 3.5rem of vertical padding, stacks inside them 1rem gaps, and cells 1.4rem. More space sits above a heading than below it.

Below 64rem, every bay stacks to one column: the left bay first, then its proof, separated by a hairline. Below 40rem, the rail loses its side borders, the orchestration demo runs edge to edge, the pain stage keeps one column, and the footer becomes two columns under a full-width brand. The hero's first viewport keeps the primary action above the fold at 1280×720.

The documentation carries the same frame. Every Guide, Reference and Project page shares one shell: a fixed 4rem header, a 17rem sidebar for the current space with a hairline edge, and a content pane of at most 84rem. From 100rem wide, a 16rem "On this page" rail joins the pane as a full-height column. The pane (with its rail) is centred as one sheet in the space beside the sidebar; the margins on both sides are hatched like the landing's out-of-frame area, with one hairline on each side of the sheet. Those edges are drawn outside the sheet, so with no margin they merge into the sidebar's edge and no line is drawn at the window edge. Inside the pane, a 2.75rem breadcrumb bar sits above a title section, then one section per `h2`, each laid on the 12-track frame:

- **Split** (5 | 7) when the section has code, a contract or entries. Prose goes left; code, signatures or log entries go right. The right column stays pinned while it fits the viewport and its prose is taller. The divider is drawn on the right column so it runs the full section height.
- **Wide** when there is nothing to put on the right. Prose stays within 70ch; tables, cells and property rows take the full width.

Changelog and roadmap sections pin their heading on the left and run their entries on the right. The docs gutter is `clamp(1.25rem, 2.6vw, 2.5rem)`; sections use 2.5rem of top and 2.75rem of bottom padding. Below 64rem, sections and the title stack to one column. Below 50rem (800px), the sidebar moves into the menu.

### Named Rules

**The Shared Track Rule.** Every vertical hairline falls on a track of the 12-column frame, at 5 or 9 on the landing. A section that needs a new division reuses one of these lines rather than adding another.

## Elevation & Depth

Flat. There are no shadows anywhere. Depth comes from tone: the code surface is a slightly lighter mix of Slate Panel into Night, pressed beats and controls and cells being worked on are a step lighter still, and hover states add the same tonal fill. Structure comes from hairlines alone.

### Named Rules

**The Flat Sheet Rule.** Nothing casts a shadow. When an element needs to stand apart, it gets a tonal fill or a hairline.

## Shapes

Square, everywhere. Landing bays, docs sections, cells, buttons, the code excerpt and code blocks, the install field, demo step cells, owner tags, context meters, beat buttons, response figure panes, runtime name boxes, inline code and sidebar hover and current states all have 0 radius. Icons are drawn SVG with a 1.6 stroke, round caps and round joins. Breadcrumb separators and the demo's code-lane chevrons are drawn with two hairline borders, not glyphs. The one dashed line in the system is the orchestration demo's Interrupted cut.

## Components

### Buttons

Blunt, rectangular and confident.

- **Shape:** square corners (0px), 2.75rem tall, 0 1.25rem padding, 0.9375rem at weight 500.
- **Primary:** inverted, a White Ink fill with Night text (reversed in light theme). A drawn arrow follows the label and moves 3px right on hover.
- **Outline:** a transparent fill with a gray-5 hairline border and White/Slate Ink text. On hover the border lightens to gray-3 and a Slate Panel fill appears.
- **Focus:** a 2px ember outline with a 2px offset.

### Facts Ticker

The strip closing the hero bay, full width under both halves: the engineering facts at 0.9375rem in Pewter/Steel, separated by middots in gray-4, running right to left on a 38s linear loop. The list is written once and repeated, the repeat carrying `aria-hidden`, so the loop is seamless and the facts are announced once. Hovering pauses it. Under reduced motion it does not move: the repeat is removed and the single list wraps inside the bay's gutter.

### Install Field

A single-line code field with a muted `$` prompt, the command in White/Slate Ink, and a square copy button behind a hairline. On copy, the icon swaps to a check in ink, with an announcement through a polite status region.

### Code Excerpt

A framed block of real, typechecked code in a bay: the hero's whole `dispatch()` call, rendered from `snippets/dispatch.ts`, which `docs/scripts/check-examples.mjs` typechecks against the package.

- **Frame:** a 1px hairline around the code surface, with a caption bar above a hairline (Mist/Graphite, 0.8125rem) stating what the code proves.
- **Body:** Celestia's highlighting at 1.7 without line numbers, and no copy button. The Code role's 0.8125rem, dropping to 0.75rem below 40rem.
- **Scroll:** the code scrolls horizontally inside a focusable region (`role="region"`, labelled by the caption) with the ember focus ring inside and a thin gray-5 scrollbar. A 2.5rem fade masks the right edge while code remains hidden.

### Use-Case Rows

The use-case bay's right half: one hairline-divided row per job, each row a whole link to its guide page. The name is Title style in ink over one Pewter/Steel sentence capped at 34rem, with the drawn arrow on the right of the first line, muted at rest and in ink on hover. The whole row takes the code-surface fill on hover and the arrow moves 3px right. A row has no inner column, so the list adds no vertical line to the frame.

### Boundary Rows

The closing bay's right half: a definition list of the cases where Outpost is not the answer. Each row carries the case as a Label-size term in Pewter/Steel over its statement in ink at 0.9375rem, capped at 34rem, with hairlines between rows. The rows are not links and have no hover: the bay's only action is the closing primary button in its left half, beside the `.more` link.

### Demo Frame

The shared chrome and player of both landing demos (`DemoFrame.astro`, `demo-player.ts`): a framed figure on the code surface with a 1px hairline border.

- **Bar:** a 2.75rem strip holding the figure title (Label, ink); a `bar` slot replaces it with custom content. When beats are given, a square pause/replay toggle with drawn icons sits at the right edge behind a hairline, hidden under reduced motion.
- **Optional parts:** beats, the pause toggle and the summary are optional, and `bar` and `foot` slots replace them with custom content. The Orchestration Demo, its one consumer, uses beats, toggle and summary.
- **Summary:** a visually hidden list gives each beat's captions as text for assistive technology.
- **Beats:** buttons along the foot, split by hairlines, as a labelled group with `aria-pressed`. The pressed beat takes the 80% fill and ink text; while playing, a 2px ink underline runs across it for the beat's duration. Focus draws the ember outline inside.
- **Player:** autoplays when 35% in view and chains through the beats, wrapping from the last back to the first, so the figure keeps making its case; clicking a beat jumps there and the chain carries on from it; the toggle stops or replays. The chain waits while the pointer or focus is on the figure or on anything that sets `data-hold` on it, so reading never fights the loop, and the toggle remains the explicit stop WCAG 2.2.2 asks for. A figure may open on any beat at rest. Under reduced motion nothing animates and each beat shows its still end state.

### Orchestration Demo

The signature component: the drawing that opens the problem bay, full width, registered on no inner track but its own. One job (Branch, Fix, Verify, Integrate) runs twice, once with a model deciding every step and once in code, inside a framed figure on the code surface.

- **Bar:** a 2.75rem strip with the job title (Label, ink) and, at the right edge behind a hairline, a square pause/replay toggle with drawn icons. The toggle is hidden under reduced motion.
- **Lanes:** two stacked lanes, "An LLM orchestrates" above "Code orchestrates", separated by a hairline. Each has a Title-style name, a caption for the current beat (all captions share one grid cell so switching never shifts the layout), a row of four step cells and a context meter.
- **Step cells:** a 4-column grid whose dividers are 1px gaps over the line colour, on the Night ground. Each cell holds the step name with its drawn check on the same line at the cell's right edge, an owner tag under it, a note slot at its foot and, at the foot's right edge, the elapsed time of that step in monospace with tabular numerals. Durations live in `orchestration.constants.ts` so the still state and the player agree: a model step costs 600ms, an agent's turn 900ms, a code step 100ms, which makes the model's lane read as twice the code lane's, keeps a beat near three seconds, and keeps every displayed figure exact: four steps of 0.6s total 2.4s, and nothing rounds away. A step's own time shows only on the Steps and Resume beats, where cost is the argument. Name and check read as one finished step at any cell width. Model and agent tags are filled in White/Slate Ink; code tags are outlined in a hairline with Pewter/Steel text, so the split reads at rest.
- **Running state:** a model or agent step gets the ember tint and an ember underline that grows over its run time; a code step gets the 80% code fill and a Pewter/Steel underline. Only the code lane draws chevrons between its steps, because only its order is fixed.
- **Lane foot:** one row under each lane's steps, of fixed height, holding two tenants that cross-fade: the context meter on the Context beat, and the lane's running total everywhere else. A beat shows only the furniture it argues about, so nothing on screen is inert.
- **Context meter:** both lanes label it with the same word, so the two bars are the only difference between them. A 0.5rem hairline track whose fill grows with each model step, while the code lane stays at a quarter. The fill is Pewter/Steel below half, ember from half, Alarm from three quarters, so the two lanes read as a calm bar beside a filling one before either caption is read.
- **Lane total:** a Label-style name against the elapsed time in monospace with tabular numerals, summed from the steps that actually ran. It is the Resume beat's argument in a number: the model's climbs from 2.4s to 3.6s because it rereads two steps, while the code lane holds at 1.2s because restored steps run nothing — and a restored step reports no time of its own.
- **Beats:** four buttons along the foot (Steps, Context, Order, Resume), split by hairlines. The pressed beat takes the 80% fill and ink text; while playing, a 2px ink underline runs across it for the beat's duration. Each beat puts ink on what it explains: code tags, the meters, the code chevrons.
- **Order beat:** the last two model cells swap places and the moved Integrate cell shows "too early".
- **Resume beat:** a dashed ink "Interrupted" cut drops down the middle of both lanes, labelled in a hairline box; lane titles and captions knock the line out with the code-surface fill. The model lane reruns its first steps marked "reread"; the code lane marks them "restored".
- **Motion:** autoplays once when 35% in view, then chains through the beats; clicking a beat plays it alone. Transitions use the landing ease. Under reduced motion nothing animates: every beat button shows its still end state.
- **Accessibility:** the stage is hidden from assistive technology; a visually hidden list gives each beat's two captions as text. Beat buttons are a labelled group with `aria-pressed`, and focus draws the ember outline inside.

### Pain Stage

The problem bay's right half, and the second half of one argument rather than a block of its own. Its four pains are the orchestration drawing's four beats in words, in the same order, so they are shown one at a time rather than stacked: the bay stopped restating what the figure had just shown. The drawing is a bay away, so the stage keeps its own clock rather than mirroring the figure's, which would stop whenever the figure scrolled out of view.

- **Entry:** the pain at 1.375rem/600 in ink with a 1px Pewter/Steel rule struck across it at 56%, its detail in Mist/Graphite under it, then the answer in ink above a hairline, under a 0.75rem "With Outpost" label. Capped at 38rem.
- **Switching:** all four share one grid cell, so nothing shifts; the inactive ones are `visibility: hidden` and leave the accessibility tree, and each strike draws itself 250ms after its entry arrives. A visually hidden list carries all four, labelled, for assistive technology and for search.
- **Pager:** four ticks at the stage's foot, each a 1px gray-4 rule in a 1.75rem target (the WCAG 2.2 minimum), named for its pain and `aria-pressed`, grouped and labelled. The current tick fills with a 2px ink line; while the figure plays, that line grows over the beat's own duration, so the reader sees how long the next pain is. A tick jumps to its pain and the rotation carries on from there, wrapping from the last back to the first. Each pain holds for 6s, set by how long its forty words take to read rather than by the figure's animation, and pointer or focus anywhere in the bay sets `data-hold` on it, parking the rotation on the pain being read until the reader leaves. Under reduced motion nothing rotates: the first pain stands and the ticks still work.
- **Without script:** the bay is served on beat 0, so the first pain reads as static prose and its tick is filled.

### Runtime Names

The agents and sandboxes bay lists two groups (a Label head row above a hairline) of linked name boxes that wrap: 2.25rem tall, a 1px hairline border, the name at 0.9375rem and 500 in ink. Hover darkens the border to gray-4 and adds the code-surface fill. An entry marked experimental carries the ember flask with a localized accessible label; none is marked today.

### Response Figure

The typed-response bay's proof: three stacked panes inside one hairline frame on the code surface, each under a Label caption, with a drawn chevron (two hairline borders turned 45°) between them.

- **Panes:** everything the caller writes, cut at build time from the typechecked `snippets/verdict.ts` — the schema, the `dispatch()` that passes it as `response`, and the typed value read back — then the agent's reply as prose with its tagged block on its own line, and the `result.value` that reply became. The first pane carries the whole chain because the link between a schema and a model's answer is the one thing the figure has to make obvious.
- **Motion:** the frame opens on the declaration alone. When it is 35% in view the reply appears, then after 900ms the value, and the tagged block takes the 80% fill and ink text at that moment — the highlight says which part of the prose became the value. Under reduced motion all three panes and the highlight are present at once.
- **Scroll:** the declaration pane scrolls horizontally inside a focusable region (`role="region"`, labelled by its caption) with the ember focus ring inside. Below 40rem the tagged block wraps instead of scrolling.

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
- **Do** keep ember for a model or agent step running right now, focus, selection and experimental status only.
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
