# Writing the Outpost guides

The guide teaches a developer how to use Outpost from TypeScript. English and French pages cover the same behavior, but each language uses its own natural phrasing.

## Recommended first steps

The reading path is Introduction, Installation, Your first task, Your first workflow, then How Outpost runs a task. Installation covers the package, agent image, authentication prerequisite and an explicitly imported configuration file. Use `init` to prepare the image in a dedicated directory; generated workflow projects are optional and documented at the end of the CLI page.

Use `.ts` for every TypeScript example, import and execution command. Installation explains the ESM package setting once; CommonJS projects can keep these scripts in a separate directory with its own package manifest. Keep examples executable with Node.js 24 or later and match the public API.

Code blocks contain at most 20 lines, including imports and blank lines. Split longer examples into named files by responsibility, displayed in tab groups of at most five. Explain where to save the files and which one to run. Keep imports explicit, types in adjacent type files and resource ownership in the calling script. Preserve readable formatting; do not compress code to satisfy the limit.

Use `<!-- canvas -->` for diagrams, including sequential phases. Keep nodes, branches, connections and execution tags; the retired `flow` component is forbidden.

## Page types

- **Tutorial:** one working outcome, the script to save, the command to run and the result to inspect. Introduce dependencies before retries, approvals or checkpoints.
- **How-to:** the task it solves, prerequisites, configuration or code, observable behavior and relevant limits.
- **Overview:** a short explanation and a small set of links chosen by user need. Detailed settings belong on the linked pages.
- **Complete example:** the use case, its files, execution and verification, followed by optional adaptations. Keep the complete code available without turning the first steps into a workshop.

## Wording and information order

Name actions in titles and explain unfamiliar concepts before using them. Use full sentences for behavior and consequences; reserve tables for comparisons and concrete outcomes. Property definitions, option catalogs, defaults and return-field dictionaries belong in the API reference. Link to the declaring contracts where readers need those details; keep working examples and their observed behavior in the guide. The CLI page documents command flags because these have no API contract. Omit decorative API badges that repeat names already in examples or reference links.

In French, prefer « fournisseur », « stockage », « répertoire personnel » and « étape d’approbation » to untranslated implementation terms. Keep recognizable product names and explain terms such as sandbox, workspace and harness where they first matter.

Each section follows reading order: explanation, example, result or limitation. Every snippet or tab group has a relevant explanation beside it; a heading or API link alone does not suffice. Move an existing explanation before the example when it introduces the example, or add a short introduction. The shared frame may place an example beside its introduction; it must not move a later paragraph or heading before an earlier code block. On small screens, the same content stacks in that order. The sidebar opens the first steps and the current topic; the reader can open the other topics.

Notes, cautions, tips and danger notices span the content section, stopping at its borders before the outer gutters and table-of-contents column. On mobile they span the content section, which fills the viewport. Their text stays aligned with the article. Use a distinct colored background and border for each variant in both themes.

Every card has a decorative icon, including cards without links and diagram steps or branches. Page navigation actions share the available width equally; a single action fills the row.

## Boundaries

Keep security, resource ownership and failure limits accurate. Distinguish what an agent reports from a check enforced in code. Label research prototypes explicitly. Do not turn the introduction into a catalog of every capability, repeat installation on other pages, use collapsible workshops or create a root examples directory.

Preserve page routes, language parity and links. Run the documentation checks, snippet validation and browser suite after changes to content or layout.
