# Writing the Outpost guides

The Guide helps developers run a first task from TypeScript or YAML, then find focused instructions for their own work. English and French pages cover the same behavior, but each language uses its own natural phrasing.

## Recommended first steps

The reading path is Introduction, Installation, Your first task, Your first workflow, then How Outpost runs a task. Installation covers the package, agent image, authentication prerequisite and an explicitly imported configuration file. Use `init` to prepare the image in a dedicated directory; generated workflow projects are optional and documented at the end of the CLI page.

Use `.ts` for every TypeScript example, import and execution command. Installation explains the ESM package setting once; CommonJS projects can keep these scripts in a separate directory with its own package manifest. Keep examples executable with Node.js 24 or later and match the public API.

Keep explanatory snippets short. A complete named file may be longer when splitting it would create artificial helpers or hide execution order. Split files by responsibility, not line count; display tab groups of at most five files. Explain where to save the files and which one to run. Keep imports explicit, types in adjacent type files and resource ownership in the calling script. Preserve readable formatting; do not compress code to reduce its length.

Use `console.log` for a first result; introduce `createReporter` on the progress page when live reporting is useful. A shared helper must never be a hidden prerequisite. When an example builds on another page, name the required files in the prose and declare `<!-- example:include page-slug file.ts other.ts -->` so validation assembles the same project.

Use `<!-- canvas -->` when a diagram clarifies a relationship, decision or loop. Give each diagram one reader question, label arrows with meaningful conditions or results, and show correction loops explicitly. Prefer user actions to API names inside nodes. Use numbered steps for simple procedures that need no diagram; the retired `flow` component is forbidden. Keep the initial desktop view at a readable scale, even when the map needs panning. On mobile, show the steps and outgoing conditions as a vertical list. Inspect diagrams in both languages at desktop and mobile sizes.

## Page types

- **Tutorial:** one working outcome, the script to save, the command to run and the result to inspect. Introduce dependencies before retries, approvals or checkpoints.
- **How-to:** the task it solves, prerequisites, configuration or code, observable behavior and relevant limits.
- **Explanation:** why the behavior or boundary exists, the mental model and its consequences. Link to instructions without repeating their code. Lifecycle, ownership and security belong here.
- **Orientation:** a short chooser linking to a few tasks. Keep it distinct from a tutorial and from exhaustive reference.
- **Complete example:** the use case, its files, execution and verification, followed by optional adaptations. Keep the complete code available without turning the first steps into a workshop. Downloadable projects are generated from named Guide snippets and explicit include declarations by `docs/scripts/example-projects.mjs`; never maintain a second copy of their code.

## Wording and information order

Name actions in titles and explain unfamiliar concepts before using them. Use full sentences for behavior and consequences; reserve tables for comparisons and concrete outcomes. Property definitions, option catalogs, defaults and return-field dictionaries belong in the API reference. Link to the declaring contracts where readers need those details; keep working examples and their observed behavior in the guide. The CLI, recipe CLI and recovery CLI pages document command flags because these have no API contract. Omit decorative API badges that repeat names already in examples or reference links.

In French, prefer « fournisseur », « stockage », « répertoire personnel » and « étape d’approbation » to untranslated implementation terms. Keep recognizable product names and explain terms such as sandbox, workspace and harness where they first matter.

Each section follows reading order: explanation, example, result or limitation. Every snippet or tab group has a relevant explanation beside it; a heading or API link alone does not suffice. Move an existing explanation before the example when it introduces the example, or add a short introduction. The shared frame may place an example beside its introduction; it must not move a later paragraph or heading before an earlier code block. On small screens, the same content stacks in that order. The sidebar opens the first steps and the current topic; the reader can open the other topics.

Notes, cautions, tips and danger notices span the content section, stopping at its borders before the outer gutters and table-of-contents column. On mobile they span the content section, which fills the viewport. Their text stays aligned with the article. Use a distinct colored background and border for each variant in both themes.

Every card has a decorative icon, including cards without links and diagram steps or branches. Page navigation actions share the available width equally; a single action fills the row.

## Boundaries

Keep security, resource ownership and failure limits accurate. Distinguish what an agent reports from a check enforced in code. Label research prototypes explicitly. Do not turn the introduction into a catalog of every capability, repeat installation on other pages, use collapsible workshops or create a root examples directory.

Preserve page routes, language parity and links, including existing section anchors. Register retired pages in `docs/audit/guide-redirects.json`; leave an anchor and an onward link when moving a section. Write English and French independently around the same runnable behavior. Check API coverage in its maintained source before removing a contract catalog from the Guide. Run the documentation checks, snippet validation and browser suite after changes to content or layout.
