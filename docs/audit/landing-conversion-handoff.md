# Handoff — landing page conversion rework

Audit date: 2026-10-01. Package version at audit time: 9.0.2.

You are implementing the result of a conversion audit of the documentation home page.
The page is honest, accessible and bilingual; do not rewrite it wholesale. Every task below
is a targeted change with its own acceptance criteria, and each one is independently
committable.

## Diagnosis you are acting on

The home page sells a thesis ("Code orchestrates. Agents think.") to visitors who arrive
looking for a capability ("can this run Claude Code against my repo from my own code?").
The first viewport contains no API code, names no agent, and links none of the six existing
use-case pages. The GitHub repository is unreachable from the header on every page. Fixing
this does not create traffic — it prepares the page for traffic that arrives.

## Files in scope

| File                                        | Role                                                            |
| ------------------------------------------- | --------------------------------------------------------------- |
| `docs/src/content/docs/index.md`            | English landing frontmatter (all copy lives here)               |
| `docs/src/content/docs/fr/index.md`         | French landing frontmatter, same key structure                  |
| `docs/src/content.config.ts`                | Zod schema for the `landing` object — new keys must be declared |
| `docs/src/components/landing/Landing.astro` | Section order and markup (`.bay` / `.say` / `.show`)            |
| `docs/src/components/landing/snippets/*.ts` | Landing code snippets, typechecked (see below)                  |
| `docs/src/components/DocsHeader.astro`      | Header cells                                                    |
| `docs/test/site.test.mjs`                   | Playwright assertions on the landing, in both locales           |
| `docs/scripts/check-content.mjs`            | File-level EN/FR parity gate (`bun run docs:check`)             |
| `docs/PRODUCT.md`                           | Brand commitments, including the recorded headline              |

## Hard constraints

- **Bilingual parity is mandatory.** Every key added to `index.md` must exist in
  `fr/index.md` with the same path. French uses vouvoiement and typographic apostrophes
  (`’`, not `'`), and says "une sandbox" (feminine), matching the existing copy.
- **New frontmatter keys require a schema change** in `docs/src/content.config.ts`. The
  build fails otherwise. Follow the existing composition (`link`, `links`, `runtime`, `lane`).
- **Landing snippets are typechecked against the package.**
  `docs/scripts/check-examples.mjs` copies every file in
  `docs/src/components/landing/snippets/` into a workspace next to a generated
  `outpost.config.mts` and typechecks it. A new snippet must compile against the real public
  API and import `{ coder, repository, sandboxProvider }` from `./outpost.config.mts`, like
  `snippets/fix-tests.ts` does. Never paste code into the component as a string literal.
- **Invent no proof.** There are no users, customers, testimonials, logos, adoption figures
  or benchmarks (`docs/PRODUCT.md`, "Evidence on Hand"). Only the engineering facts listed
  there may be stated.
- **Keep the bays layout.** Each section is a `.bay` with a `.say` (prose) and a `.show`
  (code, table or demo) half; code-free sections go full width. Do not bypass
  `docs/scripts/rehype-bays.mjs` conventions with ad-hoc layout.
- **Keep accessibility at WCAG 2.2 AA.** The existing `aria-*` wiring, `role="status"`,
  screen-reader labels and the reduced-motion behavior of both demos are correct work;
  preserve them. Any new interactive element needs the same treatment.
- Prettier formatting on every changed file; no unrelated churn.
- Do not touch generated output (reference pages, changelogs). Nothing here requires
  `docs:sync`.

## Task 1 — Put real code in the first viewport

**Why:** a TypeScript developer decides from the shape of the API. The hero currently shows
an abstract animated comparison instead. `docs/PRODUCT.md` principle 2 is "Show the code",
and the home page is the only surface that does not apply it.

**Do:**

1. Add `docs/src/components/landing/snippets/dispatch.ts`, a trimmed version of the
   `dispatch()` example in `docs/src/content/docs/guide/introduction.md`. Target 12-16
   lines: the import, the config import, the `dispatch()` call with
   `branch: { mode: "named", … }` and a brief, then one or two `console.log` lines showing
   what comes back (`result.text`, `result.commits`). It must typecheck.
2. In `Landing.astro`, render it in the hero's `.show` half with the existing
   `Code` component from `starlight-theme-celestia/components/Code.astro`, with a
   `figcaption`-style label, following the `.excerpt` pattern already used in the
   determinism bay.
3. Move `<OrchestrationDemo />` out of the hero into its own bay, placed immediately before
   or inside the `problem` section (it illustrates exactly that argument). Keep its copy
   keys where they are; if you move the keys, move them in both locales.

**Acceptance:** the hero shows runnable TypeScript above the fold at 390×844 and at desktop
width; `bun run docs:test` (which runs `docs/scripts/check-examples.mjs`)
typechecks the new snippet; the orchestration demo still autoplays, still pauses, and still
respects reduced motion wherever it now lives.

## Task 2 — Lead with the capability, keep the thesis second

**Why:** the headline states a position; it does not identify the product. No agent is named
until the fourth section, and agent names are what people search for.

**Do:** replace the headline and lead in both locales. Proposed copy — treat as a strong
draft, keep the register (direct, factual, no superlatives):

```yaml
# index.md
headline:
  - "Run coding agents"
  - "from your TypeScript."
lead: "Claude Code, Codex, Copilot CLI and Kimi Code, in a Docker, Podman or cloud sandbox you own, on a Git branch you control. Code orchestrates: it keeps the order, the checks and the resume, and the agent gets only the work that needs judgment."
```

```yaml
# fr/index.md
headline:
  - "Exécutez des agents de code"
  - "depuis votre TypeScript."
lead: "Claude Code, Codex, Copilot CLI et Kimi Code, dans une sandbox Docker, Podman ou cloud que vous maîtrisez, sur une branche Git que vous contrôlez. Le code orchestre : il garde l’ordre, les vérifications et la reprise, et l’agent ne reçoit que le travail qui demande du jugement."
```

**Also update, or the change is incoherent:**

- the page `description` in both locales (it currently opens with the old headline);
- `docs/PRODUCT.md` → "Brand Commitments", which records the headline with its date. Replace
  the recorded headline and date; keep the tagline commitment as it is.
- `docs/test/site.test.mjs`, which asserts the `h1` contains `Code orchestrates.` /
  `Le code orchestre.` in the per-locale table near the top of the file.

**Acceptance:** both locales updated, `PRODUCT.md` consistent with the page, browser tests
green, headline still fits the existing type scale without wrapping into four lines on
mobile.

## Task 3 — Surface the use cases

**Why:** six use-case pages exist (`docs/scripts/navigation.mjs`, "Use cases" chapter:
`fix-failing-ci`, `review-on-label`, `nightly-maintenance`, `multi-repository-change`,
`compete-agents`, `specify-with-a-human`) and the home page links none of them. They
describe problems the visitor already has; the `problem` bay instead describes LLM-pipeline
theory the visitor has not yet named.

**Do:** add a `useCases` bay after the hero and before `problem`, with a title, a one-line
intro and three to four entries, each a title, one sentence and a link to its guide page.
Pick the three most recognizable: `fix-failing-ci`, `review-on-label`,
`nightly-maintenance`. Declare the new keys in `content.config.ts` (an array of
`{ title, text, href }` — reuse `link` if the shape fits). Keep the `problem` bay; it earns
its place once the visitor knows what the tool does.

**Acceptance:** schema declares the keys, both locales carry them, every `href` resolves
(rendered-link validation lives in `docs/scripts/check-build.mjs`, run by
`bun run docs:test`), layout follows the bays convention.

## Task 4 — Expose the repository in the header

**Why:** `social` with the GitHub entry is configured in `docs/astro.config.mjs` (lines
~29-35), but the custom `DocsHeader.astro` override never renders it. The repository is
reachable only from the landing footer, so it is unreachable from every guide and reference
page. For an MIT library, the repository is the adoption action.

**Do:** add a header cell with the GitHub link, and npm alongside it if it fits the grid.
Use icon links with accessible labels, matching the header's existing cell styling and its
mobile breakpoints (see the `.docs-search` rules for the pattern). Do not fabricate a star
count or fetch it at build time.

**Acceptance:** the link is present and labeled on landing, guide and reference pages, in
both locales; the header does not overflow at 390px; existing header assertions in
`site.test.mjs` still pass, and a new assertion covers the link.

## Task 5 — Make the install command lead to a result

**Why:** `npx @elie-laloum/outpost init` on its own runs nothing. It needs Node.js 24+, Git,
a repository with at least one commit, Docker running, and a host agent login done
beforehand (see the repository `README.md` quickstart and `guide/setup/`). A visitor who
copies it hits a wall of prerequisites without knowing what they were promised.

**Do:** keep one copyable command, but state the prerequisites and the outcome around it —
for example a short line above ("Node.js 24+, Git, Docker running") and a line below naming
what `init` produces (`run.ts`, `brief.md`, configuration, the image) and what the next
command is. Do not turn the hero into the full quickstart; `guide/setup/` owns that.

**Acceptance:** the clipboard content stays exactly `npx @elie-laloum/outpost init` (asserted
in `site.test.mjs`); new copy exists in both locales and in the schema; the prerequisites
stated match `README.md` and `guide/setup/` exactly — verify, do not paraphrase from memory.

## Task 6 — Answer "why not X"

**Why:** the first objection of an evaluator is unaddressed anywhere on the page: Claude Code
already has subagents, GitHub Actions already runs agents in CI, LangGraph and similar
already orchestrate LLM steps.

**Do:** add a short bay, or a block inside `problem`, that states plainly what Outpost is
and is not. Rules: name the alternatives neutrally, claim no superiority, state where the
alternative is the better choice. If the comparison cannot be made factually from
`docs/PRODUCT.md` positioning and the guide, leave this task for human review rather than
guessing — flag it instead of inventing distinctions.

**Acceptance:** every claim traceable to a documented capability; both locales; no
disparagement and no unverifiable comparison.

## Task 7 — State the engineering evidence

**Why:** with no users and no testimonials, rigor is the only available proof, and the page
shows only `Node.js 24+ · MIT · v9.0.2` while the repository `README.md` carries CI,
coverage-gate, npm and license badges.

**Do:** extend the `facts` line, or add a small evidence row near the primary CTA, with
facts only: CI on Windows, macOS and Linux; real Docker and Podman tests; a coverage gate of
at least 80% lines, branches and functions; npm publication with provenance; MIT. Each must
be verifiable from the repository — check `package.json` and `.github/workflows/ci.yml`
before stating any of them, and drop anything you cannot verify.

**Acceptance:** every fact verified against the repository at implementation time, both
locales, no invented metric.

## Validation

Run from the repository root:

```sh
bun run build          # the package: landing snippets typecheck against it
bun run docs:check     # content, parity, links, examples
bun run docs:build
bun run docs:test
bun run docs:test:browser
```

Then Prettier on changed files. If a browser test fails because copy moved, update the
assertion deliberately — do not weaken it to a substring match that would pass on the old
copy too.

## Out of scope

- No analytics installation. The provider choice is the maintainer's decision (GDPR,
  self-hosted or not) and is not a page change.
- No framework or theme replacement, no separate marketing site.
- No new dependency for the landing.
- Do not remove `DeterminismDemo`. It answers an objection that lands once the visitor
  cares, and its copy is accurate about what Outpost does not do.
- Do not change reference pages, changelogs or roadmaps. No version bump, no tag.

## Decisions left to the maintainer

1. Final wording of the headline and lead (Task 2 ships a draft; the brand commitment in
   `PRODUCT.md` is the maintainer's to change).
2. Whether the comparison bay (Task 6) ships at all, and against which alternatives.
3. Which three use cases lead (Task 3 proposes three of six).
