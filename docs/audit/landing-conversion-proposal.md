# Proposal — landing page conversion rework

Shaped 2026-10-01 against `docs/audit/landing-conversion-handoff.md`. Package version at
shaping time: 9.0.2. This document is the design brief and the exact material an
implementation pass needs. Every fact below was verified against the repository at shaping
time; the verification table in §2 says where.

**Implemented the same day** on branch `docs/landing-conversion`, in five commits, through a
finish review that ended `ship`. §12 records what shipped differently from this brief and
why. Read §1–§11 as the brief as written; read §12 before trusting any of it as a
description of the page.

---

## 1. The brief

**Job and audience.** A TypeScript developer arrives from npm, the GitHub mirror or a
search with one question: _can this run Claude Code or Codex against my repository, from my
own code?_ Visitor mode is **Persuade** — the home page is the only surface whose success is
a decision, not comprehension. Success is: within one viewport they know what Outpost is and
what its API looks like; within one scroll they recognise a job they already have; they leave
through `guide/setup/` or the repository.

**Outcome and proof.** The primary action stays `Get started` → `guide/setup/`. The proof is
the only kind Outpost has: real typechecked code, the two live demos, the named agents and
sandboxes, and verifiable engineering facts (CI matrix, container tests, coverage gate, npm
provenance, MIT). There are no users, logos, testimonials or benchmarks, and none are
invented.

**Selected direction.** The visual world is settled and inherited unchanged: DESIGN.md's
_Survey Sheet_ — one 12-track frame, 5 | 7 bays splitting at track 5, inner cells at track 9,
1px hairlines as the only structure, square corners, grayscale with ember reserved for live
state and focus. This is an extension of an existing surface, so there is no concept
tournament and no new identity. One durable system addition is proposed, named in §7.

The structural thesis changes, not the world: **the page now opens on the API and the jobs,
and keeps the argument as the second movement.** Today it opens on a thesis and an abstract
animated comparison; a developer decides from the shape of the call. Three consequences:

1. The hero's `.show` half carries a real `dispatch()` call, as the determinism bay already
   carries a real `check` block.
2. The orchestration demo is **promoted, not demoted**: it leaves the cramped 7-track hero
   half and becomes the page's one full-width drawing, opening the `problem` bay it argues
   for. Its four step cells per lane, its two context meters and its Interrupted cut all
   gain the room they never had.
3. The page gains a real close. It ends on _Where Outpost is not the answer_ — three honest
   boundaries with the closing action beside them. Ending an evaluator's read on a stated
   limit is Outpost's voice (PRODUCT.md principle 1) and it is the last thing a sceptical
   reader needs before clicking.

**Focal moment.** The full-width orchestration drawing, directly under the use cases. It is
the only element on the page that moves, spans the whole frame and makes an argument at once.

**Scope.** `docs/src/content/docs/index.md`, its French peer, `docs/src/content.config.ts`,
`docs/src/components/landing/Landing.astro`, one new file in
`docs/src/components/landing/snippets/`, `docs/test/site.test.mjs`, `docs/PRODUCT.md`.
`DocsHeader.astro` is **not** in scope (§2).

**Untouched.** Both demo components and their player, `DeterminismDemo` in full, every
`aria-*`/`role="status"`/reduced-motion behaviour, the determinism excerpt and its build-time
cut, the clipboard payload, the footer, the Celestia chrome, the two uncommitted
in-progress changes (`DESIGN.md` docs-pane paragraph, `DocsColumns.astro` sheet centring).

**Anti-goals.** No analytics. No new dependency. No theme or framework change. No separate
marketing site. No invented proof of adoption. No third-party product named as inferior. No
generated output touched (`docs:sync` is not required). No version bump, no tag.

**States and ranges.** Reduced motion: both demos settle on still end states, the pause
toggle is hidden — unchanged. Clipboard denied: the copy button's `role="status"` region
stays silent, the command remains selectable text. No-JS: every new element is static
markup; only the copy button and the demos need JS, as today. Content ranges: 2–3 headline
clauses, 3–4 use cases, 2–4 boundaries, 3–5 evidence facts, enforced by the schema.

**Binding constraints.** Bilingual parity with identical key paths; French vouvoiement and
typographic apostrophes (`’`); "une sandbox" feminine. New frontmatter keys require a Zod
change or the build fails. Landing snippets are typechecked by
`docs/scripts/check-examples.mjs` against the real public API and must import
`{ coder, repository, sandboxProvider }` from `./outpost.config.mts`. WCAG 2.2 AA in both
locales. Prettier on every changed file, no unrelated churn.

---

## 2. Corrections to the diagnosis

**Task 4 is already shipped. Drop it.** The handoff states the GitHub repository "is
unreachable from the header on every page" because `DocsHeader.astro` never renders the
`social` config. That is not what the code does. `DocsHeader.astro:29` renders
`<div class="cell source"><SourceLinks /></div>`, and `SourceLinks.astro` renders GitLab,
GitHub mirror and npm as icon links with `aria-label` and `title`, plus the version linking
to the changelog. `NavFooter.astro:8` renders the same component in the sidebar footer for
narrow widths, and the landing's mobile menu reveals that sidebar
(`DocsFrame.astro:78` beats `DocsFrame.astro:47` on specificity). `site.test.mjs` already
asserts all three links and the version in the header on a reference page.

The header's `social` entry in `astro.config.mjs` is genuinely unused, but it is dead
configuration, not a missing link; removing it is unrelated cleanup and is left alone.

One real residual gap survives: the existing header assertion runs on
`reference/dispatch/` only, so nothing covers the landing route. Task 4 is therefore
re-scoped to **one new test assertion**, listed in §8. There is also a narrow band, 50rem to
64rem on the landing only, where the header source cell is hidden and no menu toggle is
shown; the landing footer carries the three source links at that width, so the repository
stays reachable. Not worth a breakpoint change.

**Everything else in the handoff holds.** Verified at shaping time:

| Claim                                           | Verified against                                                                                                                                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js 24+                                     | `package.json` `engines.node: ">=24"`                                                                                                                                                                                              |
| MIT                                             | `package.json` `license`                                                                                                                                                                                                           |
| v9.0.2                                          | `package.json` `version`                                                                                                                                                                                                           |
| CI on Windows, macOS and Linux                  | `.github/workflows/ci.yml:17` `os: [ubuntu-latest, windows-latest, macos-latest]`                                                                                                                                                  |
| Real Docker and Podman tests                    | `.github/workflows/ci.yml:69-74` `containers` job, `engine: [docker, podman]`                                                                                                                                                      |
| Coverage gate at 80% lines, branches, functions | `package.json:70` `--lines=80 --functions=80 --branches=80`                                                                                                                                                                        |
| npm publish with provenance                     | `.github/workflows/release.yml:64` `npm publish --provenance --access public`                                                                                                                                                      |
| Prerequisites for `init`                        | `guide/setup.md` Prerequisites (Node.js 24+, a Git repository with at least one commit, Docker **or Podman** installed and running) + host agent sign-in before a task; `README.md` quickstart agrees                              |
| What `init` writes, and the next command        | `guide/setup.md`: `run.ts`, `brief.md`, `.env.example`, `Dockerfile`, `.gitignore`, `package.json` when absent, then builds the image; next command `node run.ts "Describe this repository"` (identical in `fr/guide/setup.md:93`) |
| Six use-case pages and their titles             | `docs/scripts/navigation.mjs:14-22` and each page's frontmatter in both locales                                                                                                                                                    |

Note the one wording difference from the handoff: `guide/setup/` says **Docker or Podman**,
while `README.md`'s quickstart says Docker because its example is Docker. The landing copy
below says "Docker or Podman", which is true of both and of the `init` flow.

**Drift noticed, not repaired.** `docs/PRODUCT.md` → Capabilities and Constraints still reads
"Current package version: 8.0.0". The same line tells the reader to read `package.json`
instead, so it is self-correcting; it is reported here and left alone.

---

## 3. The page

Seven bays, in reading order. Form per bay is varied deliberately: code, rows, a wide
drawing plus a table, code plus a live table, name boxes, rows, footer.

| #   | Bay              | `.say` (5 tracks)                                                                  | `.show` (7 tracks)                               | Change        |
| --- | ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------ | ------------- |
| 1   | **hero**         | headline, lead, prerequisites, install, outcome + next command, two actions, facts | the `dispatch()` snippet in an `.excerpt` figure | rebuilt       |
| —   | hero title block | full-width strip: four engineering facts                                           |                                                  | new           |
| 2   | **useCases**     | title, one line, link                                                              | three linked ruled rows                          | new           |
| 3   | **problem**      | full-width orchestration drawing, then title, text, link                           | the pain table, unchanged                        | demo moved in |
| 4   | **determinism**  | unchanged                                                                          | unchanged                                        | none          |
| 5   | **runtimes**     | unchanged                                                                          | unchanged                                        | none          |
| 6   | **boundaries**   | title, one line, link, closing action                                              | three boundary rows                              | new           |
| 7   | **footer**       | unchanged                                                                          |                                                  | none          |

Why the use cases sit before the argument: they describe problems the visitor already has,
whereas `problem` describes LLM-pipeline theory the visitor has not yet named. Why
`boundaries` sits last and not inside `problem`: an objection answered before the visitor
cares is noise, and the page needs a close that is not the footer.

### 3.1 Hero

`.say` DOM order — `h1`, `.lead`, `.install-note` (prerequisites), `<outpost-install>`,
`.install-note` (outcome + the next command in `<code>`), `.actions`, `.facts`.

**Implementation hazard.** The copy script reads
`this.querySelector("code")?.lastChild?.textContent`. The `<code>` holding `install.next`
must sit **outside** `<outpost-install>`, or the clipboard payload changes and the existing
assertion fails. Put the outcome paragraph after the closing `</outpost-install>` tag.

`.show` reuses the determinism bay's `.excerpt` pattern verbatim: `<figure class="excerpt">`
→ `<figcaption>` → `<div class="excerpt-code" role="region" aria-label={caption} tabindex="0">`
→ `<Code code={dispatchCode} lang="ts" />`. The existing `.excerpt-code` clipping script
already queries all instances, so the horizontal fade and the focusable scroll region come
for free. One variant: the hero excerpt sets the code at the system's Code role
(0.8125rem / 1.7); the determinism excerpt keeps 0.75rem.

The evidence strip is a full-width row at the foot of the hero bay (`grid-column: 1 / -1`,
top hairline), middot-separated like `.facts`, 0.8125rem in Pewter/Steel, wrapping. No
vertical hairlines, so the Shared Track Rule is untouched. On mobile it lands after the
snippet, at the bay's foot, which keeps that height out of the copy column.

**English**

```yaml
headline:
  - "Run coding agents"
  - "from your TypeScript."
lead: "Claude Code, Codex, Copilot CLI and Kimi Code, in a Docker, Podman or cloud sandbox you own, on a Git branch you control. Your code keeps the order, the checks and the resume; the agent gets only the work that needs judgment."
hero:
  caption: "One task from end to end: a sandbox, a named branch, the agent’s answer and its commits."
install:
  prerequisites: "You need Node.js 24+, a Git repository with at least one commit, Docker or Podman running, and your agent CLI signed in."
  command: "npx @elie-laloum/outpost init"
  copy: "Copy the install command"
  copied: "Copied"
  outcome: "It writes run.ts, brief.md, a Dockerfile and your configuration, then builds the agent image. Then run:"
  next: 'node run.ts "Describe this repository"'
primary: { label: "Get started", href: "guide/setup/" }
secondary: { label: "Read the guide", href: "guide/introduction/" }
facts: "MIT"
evidence:
  - "CI on Windows, macOS and Linux"
  - "Real Docker and Podman tests"
  - "80% coverage gate"
  - "npm publish with provenance"
reference: { label: "API reference", href: "reference/" }
```

**French**

```yaml
headline:
  - "Exécutez des agents de code"
  - "depuis votre TypeScript."
lead: "Claude Code, Codex, Copilot CLI et Kimi Code, dans une sandbox Docker, Podman ou cloud que vous maîtrisez, sur une branche Git que vous contrôlez. Votre code garde l’ordre, les vérifications et la reprise ; l’agent ne reçoit que le travail qui demande du jugement."
hero:
  caption: "Une tâche de bout en bout : une sandbox, une branche nommée, la réponse de l’agent et ses commits."
install:
  prerequisites: "Il vous faut Node.js 24+, un dépôt Git avec au moins un commit, Docker ou Podman démarré, et la CLI de votre agent connectée."
  command: "npx @elie-laloum/outpost init"
  copy: "Copier la commande d’installation"
  copied: "Copié"
  outcome: "La commande écrit run.ts, brief.md, un Dockerfile et votre configuration, puis construit l’image de l’agent. Ensuite :"
  next: 'node run.ts "Describe this repository"'
primary: { label: "Commencer", href: "guide/setup/" }
secondary: { label: "Lire le guide", href: "guide/introduction/" }
facts: "MIT"
evidence:
  - "CI sur Windows, macOS et Linux"
  - "Tests Docker et Podman réels"
  - "Seuil de couverture à 80 %"
  - "Publication npm avec provenance"
reference: { label: "Référence de l’API", href: "reference/" }
```

Two deliberate copy decisions. `facts` drops "Node.js 24+" because the prerequisites line
now states it where it is actionable; the facts line reads `MIT · v9.0.2 · API reference`.
The lead names four agents, not five: they are the four with full capture/resume/fork
support and the four people search for. Antigravity and the Outpost harness are one scroll
away in the runtimes bay, which lists all six, so nothing is implied to be missing.

**Above the fold at 390×844.** Budget at the 14px root, 56px header, 350px copy container:
headline 2 lines EN / 3 lines FR (≈65 / 97px), lead ≈5 lines (123px), prerequisites 2 lines,
install field 41px, outcome 3 lines, actions 38px, facts 2 lines, bay padding 91px — the
snippet's caption bar lands around 570–600px, leaving roughly 190px of the figure visible.
Runnable TypeScript is above the fold and the primary action is above it. **Verify by
capture, not by arithmetic**, and if the FR headline costs a fourth line, trim the FR lead's
second clause rather than the headline.

### 3.2 Use cases

`.say` holds the title, one line and a `.more` link. `.show flush` holds three ruled rows;
each row is a single `<a>` spanning the bay (no inner divider, so no new vertical line),
with the use-case name in Title style in ink over one sentence in body, and the `Arrow`
component at the right edge moving 3px on hover. Hover takes the code-surface fill, matching
the Runtime Names and Feature cells hover language. Rows are divided by hairlines; the
group gets no head row, which is what keeps it visually distinct from the pain table two
bays down.

Three, not four: a fourth row costs the bay its single-screen read, and `review-on-label`
already carries the "from your own code" shape that `multi-repository-change` and
`specify-with-a-human` would repeat at greater length. Each entry's title is the guide
page's own title, verbatim, in both locales, and each sentence is cut from that page's own
description — so nothing new is claimed.

**English**

```yaml
useCases:
  title: "What you can run"
  text: "Each one is a guide page: the code, the contracts it uses and what comes back."
  link: { label: "Your first task", href: "guide/first-request/" }
  entries:
    - title: "Fix a failing CI build"
      text: "An agent fixes the tests on a branch while Outpost reruns them after each attempt and feeds the failures back."
      href: "guide/fix-failing-ci/"
    - title: "Review a pull request on demand"
      text: "A label on a pull request queues an agent review, and your code posts the typed verdict it returns."
      href: "guide/review-on-label/"
    - title: "Nightly maintenance"
      text: "Every weekday night, an agent updates dependencies on a dated branch and leaves a typed report for the morning."
      href: "guide/nightly-maintenance/"
```

**French**

```yaml
useCases:
  title: "Ce que vous pouvez lancer"
  text: "Chaque cas est une page du guide : le code, les contrats qu’il utilise et ce qui revient."
  link: { label: "Votre première tâche", href: "guide/first-request/" }
  entries:
    - title: "Réparer une CI en échec"
      text: "Un agent corrige les tests sur une branche, et Outpost les relance après chaque tentative en lui renvoyant les échecs."
      href: "guide/fix-failing-ci/"
    - title: "Relire une pull request à la demande"
      text: "Un label sur une pull request met une revue en file, et votre code publie le verdict typé qu’elle renvoie."
      href: "guide/review-on-label/"
    - title: "Maintenance nocturne"
      text: "Chaque nuit de semaine, un agent met à jour les dépendances sur une branche datée et laisse un rapport typé pour le matin."
      href: "guide/nightly-maintenance/"
```

The title avoids "what people run it for" and every other phrasing that would imply users
Outpost does not have.

### 3.3 Problem, with the drawing full width

The bay keeps one `<section aria-labelledby="problem-title">` and gains a first row:

```
<section class="bay problem" aria-labelledby="problem-title">
  <div class="show flush figure-wide"><OrchestrationDemo demo={landing.demo} /></div>
  <div class="say">…title, text, link…</div>
  <div class="show flush pains">…unchanged…</div>
</section>
```

`.problem` keeps `grid-template-columns: minmax(0, 5fr) minmax(0, 7fr)`; `.figure-wide` takes
`grid-column: 1 / -1` and a bottom hairline. The pain table keeps its 4 | 3 split inside the
7-track column, so its divider stays on track 9.

No copy key moves. `landing.demo` stays exactly where it is in both locales, and
`DemoFrame.astro` already wraps the player in `<figure aria-labelledby="{id}-title">`, so the
drawing keeps its own accessible name above the section heading. `OrchestrationDemo`'s step
grid is `repeat(4, minmax(0, 1fr))` with no max-width, so it fills the frame without change —
but its `@media (max-width: 40rem)` block and its context-meter column
(`minmax(6.5rem, auto)`) must be re-checked at the new width, and the hero's old
`.hero-demo` padding rules move to `.figure-wide`.

The drawing reads before the heading. That is the intent: it is self-titled ("One job, two
orchestrators") and it is the page's one visual beat. If a capture shows the figure
overwhelming the argument below it, move it between the `.say` and the pain table rather
than shrinking it.

### 3.4 Boundaries

`.say` holds the title, one line, a `.more` link to `guide/job-queues/` and the closing
primary button. `.show flush` holds three static rows: the case as a Pewter/Steel label
lead-in over the statement in ink, hairline-divided, no links inside the rows, no hover.
Not a table and not interactive, so it reads as a different object from the use-case rows.

Every claim is Outpost-side or a concession. No third-party product is named, by decision
(§9); the alternatives are named as the three shapes an evaluator is actually weighing.

**English**

```yaml
boundaries:
  title: "Where Outpost is not the answer"
  text: "Outpost owns the steps around an agent. When those steps are not yours to own, something smaller is the better choice."
  entries:
    - lead: "One agent session is enough"
      text: "If the whole job fits in one conversation, run the agent CLI directly. Outpost earns its place when the branch, the checks, the order and the resume are yours."
    - lead: "A single CI step"
      text: "A workflow file that runs an agent and stops is less code. Outpost runs the same job from CI, a queue, a cron slot or a verified webhook, and keeps the checkpoint when the worker restarts."
    - lead: "An LLM pipeline"
      text: "Outpost does not chain prompts and has no vector store or retrieval layer. It runs coding agents against Git repositories; the model calls it makes itself go through its own harness."
  link: { label: "Job queues and workers", href: "guide/job-queues/" }
  action: { label: "Start with the setup guide", href: "guide/setup/" }
```

**French**

```yaml
boundaries:
  title: "Quand Outpost n’est pas la réponse"
  text: "Outpost prend en charge les étapes autour de l’agent. Quand ces étapes ne sont pas les vôtres, un outil plus petit convient mieux."
  entries:
    - lead: "Une seule session d’agent suffit"
      text: "Si toute la tâche tient dans une conversation, lancez la CLI de l’agent directement. Outpost prend son sens quand la branche, les vérifications, l’ordre et la reprise vous appartiennent."
    - lead: "Une seule étape de CI"
      text: "Un fichier de workflow qui lance un agent et s’arrête demande moins de code. Outpost lance la même tâche depuis la CI, une file, un créneau cron ou un webhook vérifié, et garde le checkpoint quand le worker redémarre."
    - lead: "Un pipeline de LLM"
      text: "Outpost n’enchaîne pas de prompts et n’a ni base vectorielle ni couche de recherche. Il exécute des agents de code sur des dépôts Git ; les appels au modèle qu’il fait lui-même passent par son propre harness."
  link: { label: "Files de jobs et workers", href: "guide/job-queues/" }
  action:
    { label: "Commencer par le guide d’installation", href: "guide/setup/" }
```

Traceability: queues, cron slots and verified webhooks → `guide/job-queues/` and the trigger
invariants; checkpoints surviving a restart → durable-run checkpoints and lease fencing;
"its own harness" → `guide/harness/` and `src/adapters/models/`. The third entry states an
absence, which is verifiable from the public API and is the honest form of this comparison.

`boundaries.action.label` is deliberately **not** "Get started": a second link with that
accessible name would break the existing `getByRole("link", { name: start }).click()`
assertion under Playwright strict mode. The existing assertion is additionally scoped to the
hero in §8.

### 3.5 Page `description` and body

```yaml
# index.md
description: "Run coding agents from your TypeScript. Claude Code, Codex, Copilot CLI and Kimi Code in a sandbox you own, on a Git branch you control."
# fr/index.md
description: "Exécutez des agents de code depuis votre TypeScript. Claude Code, Codex, Copilot CLI et Kimi Code dans une sandbox que vous maîtrisez, sur une branche Git que vous contrôlez."
```

The Markdown body under the frontmatter (the Pagefind fallback paragraph) keeps its meaning
but opens on the capability: "Outpost runs coding agents in a sandbox you own, from
workflows you write in TypeScript. …" — same links, same two sentences.

---

## 4. `docs/src/content.config.ts`

Two new composables beside the existing `link` / `links` / `runtime` / `lane`, following the
same style:

```ts
const entry = z.object({
  title: z.string(),
  text: z.string(),
  href: z.string(),
});
const boundary = z.object({ lead: z.string(), text: z.string() });
```

Added to `landing`, keeping the object in page order:

```ts
hero: z.object({ caption: z.string() }),
install: z.object({
  command: z.string(),
  copy: z.string(),
  copied: z.string(),
  prerequisites: z.string(),
  outcome: z.string(),
  next: z.string(),
}),
evidence: z.array(z.string()).min(3).max(5),
useCases: z.object({
  title: z.string(),
  text: z.string(),
  link,
  entries: z.array(entry).min(3).max(4),
}),
boundaries: z.object({
  title: z.string(),
  text: z.string(),
  link,
  action: link,
  entries: z.array(boundary).min(2).max(4),
}),
```

`entry` is a new shape rather than a reuse of `link`: an entry needs a title, a sentence and
a target, and `link` is `{ label, href }`. The `min`/`max` bounds are the content ranges from
§1 and are what keeps a later edit from silently breaking the layout.

---

## 5. `docs/src/components/landing/snippets/dispatch.ts`

Thirteen lines, trimmed from the `dispatch()` example in `guide/introduction.md` and
agreeing with the README quickstart. It must typecheck under
`docs/scripts/check-examples.mjs`, which copies the whole `snippets/` directory next to a
generated `outpost.config.mts`.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
  brief: { text: "Fix the failing tests, run them and commit the fix." },
});

console.log(result.text);
console.log(result.branch, result.commits.length);
```

`Landing.astro` imports it with `?raw` and renders the whole file — no build-time cut, unlike
the determinism excerpt, because the whole file is the point. Keep the import beside the
existing `fixTests` import.

---

## 6. Layout and CSS notes

- `.hero` keeps `min-height: min(calc(100svh - 4rem), 48rem)`; its `.show` becomes an
  ordinary padded `.show` holding the excerpt figure. The old `.hero-demo` padding rules
  (both breakpoints) move to `.figure-wide`.
- New classes: `.install-note` (0.8125rem, Pewter/Steel, `max-width: 34rem`), `.hero-evidence`
  (full-width strip, top hairline, `li + li::before { content: "·" }`), `.use-cases`
  (hairline-divided link rows), `.figure-wide` (`grid-column: 1 / -1`), `.boundaries`
  (hairline-divided static rows).
- Below 64rem every bay already stacks to one column; the three new row lists need no
  breakpoint of their own because they have no inner columns. Below 40rem the rail loses its
  side borders and the full-width drawing runs edge to edge — confirm `.figure-wide` inherits
  the existing `padding-inline: 0` rule.
- Accessibility for the new elements: the use-case rows are ordinary links with visible text,
  so they need no extra labelling; the boundary rows are a `<dl>` with the lead as `<dt>` and
  the statement as `<dd>`, matching the pain table's semantics; the evidence strip is a `<ul>`
  with the middots drawn by `::before` so they are not announced. The hero excerpt's
  `role="region"` takes its `aria-label` from `hero.caption`, exactly as the determinism
  excerpt does. Focus keeps the 2px ember ring everywhere.
- `rehype-bays.mjs` is not involved: it lays out Markdown pages, and the landing's bays are
  hand-written in `Landing.astro`. Nothing here bypasses it.

---

## 7. `docs/PRODUCT.md`

Two edits are required, not one:

1. **Brand Commitments** — replace the recorded headline:
   `Headline (2026-10-01): "Run coding agents from your TypeScript." (FR « Exécutez des agents de code depuis votre TypeScript. »)`.
   The tagline commitment and everything else in that section stays.
2. **Positioning, item 1** — its last sentence currently reads "The home page leads with the
   pains this removes: everything interpreted, growing context, orchestrator drift, resume as
   re-interpretation." After this change the page leads with the capability and the API. That
   sentence becomes false and must be rewritten, e.g. "The home page leads with the
   capability and the API; the thesis follows in the lead, and the pains it removes are the
   page's second movement." Leaving it is an inconsistency inside the file that records the
   commitment.

`DESIGN.md` is the documenter's job at finish, not a pre-write. Three additions will be owed
then: the hero excerpt variant (§3.1), the use-case rows and the boundary rows as named
components, and the full-width figure row as a documented exception to the 5 | 7 bay.

---

## 8. `docs/test/site.test.mjs`

Deliberate updates, no weakened assertions:

| Change                                                                                                                     | Why                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Per-locale table: `"Code orchestrates."` → `"Run coding agents"`, `"Le code orchestre."` → `"Exécutez des agents de code"` | the `h1` changed; both new strings fail on the old copy, so the assertion keeps its teeth                                      |
| Scope `page.getByRole("link", { name: start })` to `.landing .hero`                                                        | the boundaries bay adds a second primary action; without scoping, strict mode fails even with a distinct label                 |
| New: `.landing .hero .excerpt-code` contains `dispatch(`                                                                   | Task 1's acceptance, in both locales                                                                                           |
| New: `.landing .use-cases a` has count 3, and the first resolves to `guide/fix-failing-ci/`                                | Task 3's acceptance                                                                                                            |
| New: `.landing .hero-evidence li` has count 4                                                                              | Task 7's acceptance                                                                                                            |
| New: `.landing .boundaries dt` has count 3                                                                                 | Task 6's acceptance                                                                                                            |
| New, on the landing route: the header exposes the GitLab / GitHub mirror / npm links                                       | the residual half of Task 4 (§2); today only `reference/dispatch/` is covered                                                  |
| Unchanged: clipboard is exactly `npx @elie-laloum/outpost init`                                                            | guards the `install.next` hazard in §3.1                                                                                       |
| Unchanged: the reduced-motion test, both demo tests, the determinism replay chain                                          | the drawing moved, its behaviour did not; these must pass without edits, which is the regression that proves the move was safe |

Rendered-link validation for the new `href`s comes free from `docs/scripts/check-build.mjs`,
which walks every `a[href]` in the built output.

---

## 9. Decisions taken

The handoff left three to the maintainer. All three are decided here; reverse any of them
freely.

1. **Headline and lead.** Taken as drafted, with the lead's second sentence shortened to
   "Your code keeps the order, the checks and the resume; the agent gets only the work that
   needs judgment." — it buys ~50px of mobile hero height, which is what puts the snippet
   above the fold. `facts` drops its duplicated "Node.js 24+".
2. **The comparison bay ships**, as the page's closing bay, and it names **no third-party
   product**. The handoff permits naming alternatives neutrally; characterising another
   product's feature set accurately on a page that cannot be re-verified when that product
   changes is a liability with no upside, so the three entries name the three _shapes_ an
   evaluator weighs — one agent session, one CI step, an LLM pipeline — and every statement
   is about Outpost or is a concession. If you want the product names (Claude Code
   subagents, GitHub Actions, LangGraph) they drop into the three `lead` values without any
   structural change.
3. **Use cases: three, as proposed** — `fix-failing-ci`, `review-on-label`,
   `nightly-maintenance`. Reasoning in §3.2.

Two further calls the handoff did not raise: the orchestration demo goes **full width**
rather than into a 7-track half, and the engineering evidence becomes a **full-width strip**
at the foot of the hero rather than a longer `facts` line.

## 10. What this proposal does not do

- No code is written. This is the shape output; implementation is a separate pass.
- `astro.config.mjs`'s unused `social` entry is left in place as unrelated cleanup.
- `PRODUCT.md`'s stale "8.0.0" line is reported, not repaired (§2).
- No analytics, no dependency, no `docs:sync`, no version bump, no tag.
- The two uncommitted in-progress changes stay untouched.

## 11. Validation the implementation pass owes

From the repository root:

```sh
bun run build          # the package: landing snippets typecheck against it
bun run docs:check     # content, parity, links, examples
bun run docs:build
bun run docs:test
bun run docs:test:browser
```

Then Prettier on changed files, and one batched capture round at **390×844 and 1440 wide**,
plus 1280×720 for the DESIGN.md above-the-fold rule. What the captures must show: runnable
TypeScript in the hero at both widths; the primary action above the fold at 1280×720; the
headline at three lines or fewer in French on mobile; the full-width drawing's four step
cells and both context meters legible; the header without overflow at 390px. Fix everything
one round shows in one batch, confirm with at most one more round, and stop.

---

## 12. What shipped, and where it left the brief

Branch `docs/landing-conversion`, worktree `.outpost/workspaces/landing-conversion`, five
commits from `f5552344`:

| Commit     | Scope                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `31c0d5c0` | The hero on the API: headline, lead, snippet, install copy, evidence strip, the drawing moved out. Tasks 1, 2, 5, 7. |
| `0dd54330` | The use-cases bay. Task 3.                                                                                           |
| `7b5b2138` | The closing boundaries bay. Task 6.                                                                                  |
| `d1ef6878` | Landing coverage for the header source links (Task 4's residual), and two defects the first capture round found.     |
| `9e53d4ae` | The finish review's fix batch, and DESIGN.md.                                                                        |

### Deviations from this brief

1. **The French headline is `"Exécutez des agents de code" / "en TypeScript."`**, not
   `"depuis votre TypeScript."` as §3.1 specifies. §3.1's own fallback (trim the FR lead) was
   wrong on the mechanics: the lead is a different element and cannot change how the headline
   wraps. Rendered line counts measured in the browser at 390 and 1440, identical at both:

   | Candidate                                                  | Lines |
   | ---------------------------------------------------------- | ----- |
   | `Exécutez des agents de code` / `en TypeScript.`           | 3     |
   | `Exécutez des agents de code` / `depuis votre TypeScript.` | 4     |
   | the same with `text-wrap: balance`                         | 4     |
   | `Exécutez des agents` / `depuis votre TypeScript.`         | 3     |
   | `Vos agents de code,` / `en TypeScript.`                   | 2     |

   Only dropping `de code` or dropping the imperative buys the possessive back at three
   lines. `agents de code` was kept because Task 2's premise is that the `h1` must identify
   the product, and the possessive is stated in the lead's second sentence. The open copy
   choice, for the maintainer: `"Exécutez des agents" / "depuis votre TypeScript."` also
   renders three lines and keeps the possessive, at the cost of `de code` in the `h1`.
   `text-wrap: balance` on the clauses shipped either way; it turned the French wrap from
   333px/130px into 215px/249px.

2. **Both hero halves register on one top rule**, rather than each being centred in its
   column. The finish review measured the excerpt floating with ~150px of air above and below
   at 1280×720; the headline's cap line and the excerpt's caption bar now both sit at 105px.

3. **`DESIGN.md` was updated after all**, against §7's deferral, because four of its
   statements became false: the recorded headline, the Layout paragraph placing the
   orchestration demo in a right bay, and two references to "the hero's proof" and "the hero
   demo's Interrupted cut". The Determinism Excerpt section is generalised to a Code Excerpt
   carrying both sizes, and Use-Case Rows and Boundary Rows are documented. The paragraph
   under uncommitted edit elsewhere was left alone. **This makes `DESIGN.md` the one file the
   branch and the working tree both touch: commit or stash the local edit before the
   fast-forward.**

4. **Two browser assertions moved**, deliberately. The orchestration demo's autoplay
   assertion was coupled to the hero position, not to the player's contract ("autoplays once
   when 35% in view"); it now scrolls the figure into view and asserts the same thing.
   `.landing .button.primary` matched two elements once the closing action existed, so it is
   scoped to the hero, as `getByRole("link", { name: start })` already was by §3.4.

5. **The hero snippet's brief string was shortened** to `"Fix the failing tests and commit."`,
   matching `snippets/fix-tests.ts`, and the excerpt drops to 0.75rem below 40rem. At 390px
   this took the lines hidden behind the scroll region from four to one. The one that remains
   is the 74-character `./outpost.config.mts` import, which `check-examples.mjs` requires
   verbatim; full visibility at that width is not reachable without breaking the snippet
   contract.

### Not done, with reasons

- **A hover state on the boundary rows** was proposed by the review and declined: the rows
  are not links, so a tonal fill would advertise an interaction that does not exist. The
  review accepted the decline.
- **`PRODUCT.md`'s "Current package version: 8.0.0"** is still stale. Reported in §2, left
  alone; the same line tells the reader to read `package.json` instead.
- **`astro.config.mjs`'s unused `social` entry** is still there. It is dead configuration,
  not a missing link (§2), and removing it is unrelated cleanup.

### Verification at the final commit

`bun run build` · `docs:check` (17 pass) · `docs:build` (2099 pages) · `docs:test` (2099
rendered pages; 436 snippets typechecked) · `docs:test:browser` (50 pass, both locales) ·
`format:check` clean · `impeccable detect` 11 advisories, all `design-system-font-size`,
against 9 for the same file on `main`; the two new ones are `0.9375rem`, the step the pain
rows and runtime names already use and the declared ramp still omits.

Captures reviewed at 390×844, 1280×720 and 1440 in both locales, in two rounds. They live in
the session scratchpad, not in `docs/.impeccable/review/`, which keeps its committed set.
