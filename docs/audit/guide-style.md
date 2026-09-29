# Guide writing contract

This file is the editorial contract for every page under `docs/src/content/docs/guide/` and its French twin under `fr/guide/`. Read it before writing or reviewing a Guide page.

## Reader

A developer who has never used Outpost. They know TypeScript, Git and the command line; they do not know Outpost's vocabulary. On every page they want three answers quickly:

1. What can I build with this?
2. What is the smallest code that does it?
3. What do I need to know before relying on it?

Write for that reader, not for the maintainer. Implementation notes, validation campaigns and contributor commands belong elsewhere (see "What stays out").

## Navigation

`docs/scripts/navigation.mjs` defines twelve chapters in reading order: Get started, Use cases, Agent tasks, Agents, Outpost harness, Sandboxes, Workflows, Durable runs and people, Automation, Storage and observability, Operations, Extend Outpost. A page belongs to the chapter of the task it serves, not to the layer that implements it. A slug is the kebab-case form of the page's subject; keep the title and slug aligned and add a redirect in `guide-redirects.json` when a slug changes.

## Page types

Each page has one type. Do not mix them.

| Type        | Chapter                           | Purpose                                                           |
| ----------- | --------------------------------- | ----------------------------------------------------------------- |
| Tutorial    | Get started (first tasks)         | Walk a newcomer through one success, step by step, with a result. |
| Explanation | Get started ("How Outpost works") | Build the mental model: pieces, lifecycle, ownership.             |
| Recipe      | Use cases                         | One complete, realistic scenario combining several features.      |
| How-to      | Every other chapter               | Solve one task with one feature.                                  |

### How-to template

1. **Opening paragraph** (one to three sentences): what the reader gets, and when to use it instead of a neighbouring feature.
2. **Minimal snippet**: the shortest working code for the common case, followed by one or two sentences on what happens when it runs and where the result is.
3. **Task sections** (`##`), each named by what the reader does ("Retry with a backoff", "Pass the conversation to a worker"), each with its own short snippet where code helps. Order them from most to least common.
4. **Limits** (`## Limits`, optional): the constraints a reader must know before relying on the feature, as a short list. This is the only place for "does not" statements that are not already obvious.
5. **API line**: `API: [symbol](../../reference/symbol/) · …` for the symbols the page uses.

A how-to page is usually 30 to 90 lines. Beyond 120 lines, split it by task or move detail to the Reference.

### Tutorial template

A goal stated in the first sentence, numbered steps (`##` per step) that each end with something observable (output, a file, a branch), then "Next steps" linking two or three how-to pages. Every command and snippet must work as written, in order.

### Recipe template

1. The scenario in two sentences: the problem and the outcome.
2. "What you use": a short list of the features involved, each linked to its how-to page.
3. The complete code, in one or a few files, with `title="…"`.
4. "How it works": a numbered walk through the code.
5. "Adapt it": two to four variations (another agent, another sandbox, a stricter check).

### Agent and sandbox pages

Every agent page follows the same sections: Install, Account access, API access, What it supports (conversations, steering, MCP, usage reporting; link to the capability table on "Choose an agent" rather than repeating it), Limits. Sandbox pages follow: Prerequisites, Configure, Repository access, Limits.

## Writing rules

- **Positive first.** Say what the feature does before what it does not do. Keep each negation only if a reader would otherwise make a costly mistake, and group them under Limits.
- **One fact, one place.** Explain a concept on its owning page and link to it elsewhere. Do not restate authentication, quota classification, ownership or credential boundaries on every page that touches them.
- **Concrete over abstract.** Name the option, the value, the file and the result. Prefer "`result.text` holds the answer" to "the result exposes the textual output".
- **Short sentences, active voice, second person.** One idea per sentence. Avoid stacked qualifiers and chains of clauses.
- **Explain the vocabulary at first use** on pages a newcomer reaches early (Get started, Use cases, Agent tasks): harness, sandbox provider, workspace, dispatch, checkpoint.
- **Tables for comparisons only**: choosing between options, capability matrices, response codes. Not for prose split into cells.
- **No filler.** No "In this guide, you will learn", no summaries of what was just said, no "Note that", no "simply", no "just".
- **Titles**: sentence case, a noun phrase or an imperative ("Typed responses", "Write a brief"). Headings inside a page are tasks or questions the reader has.
- **Links**: relative (`../slug/`, `../../reference/symbol/`), descriptive text, no bare "here".

## Show, then tell

Nobody reads long paragraphs. Structure the information, split it, and present it with the page's visual elements before prose.

- **The description is the opening.** The frontmatter `description` is shown under the title; do not repeat it in a first paragraph. Start with the first section.
- **Paragraphs are one to three short sentences** (about 60 words at most). A section opens with one or two sentences, then shows its content: code, a component, a table.
- **Choose a visual for any enumeration.** Three or more parallel items become a component or a table, not a paragraph and rarely a plain bullet list. A sequence of steps becomes headings (tutorials), a `path` or a `flow`, never a numbered list of paragraphs.
- **Cut explanations the visual already carries.** Do not describe a table or a diagram in prose next to it.
- **Cautions go in asides** (`:::note`, `:::caution`), one or two sentences each, only when the reader would otherwise make a costly mistake.

### Components

An HTML comment placed on its own line before a Markdown list turns that list into a drawn component (`docs/scripts/guide-components.mjs`, styles in `docs/src/styles/guide-components.css`). Each item is a title (a link, bold text or inline code), then `: ` and one short sentence starting with a capital letter. A nested list holds tags or steps. Icons come from the linked page (`docs/scripts/guide-icons.mjs`); add a mapping there for a new page.

| Marker              | Use it for                                                          | Item                                                                           |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `<!-- features -->` | A map of capabilities or choices: three, six, nine or twelve cells. | `[Title](../page/): Sentence.` with an optional nested list of tags.           |
| `<!-- path -->`     | A reading path or ordered choice of pages, two to five stages.      | `[Title](../page/): Sentence.`                                                 |
| `<!-- flow -->`     | A process in phases, each with its steps; host or sandbox as tags.  | `**Phase**: Sentence.` with nested `**Step**: Sentence.` items and their tags. |
| `<!-- files -->`    | Generated files or directories, one line each.                      | `` `name` ``: Sentence. Names ending with `/` are folders and can nest.        |

Tags in inline code are API names and use the code face; plain tags are product or concept names. Keep tags to one to five per cell. Tables remain the tool for comparing options along several attributes.

## Snippets

- Every `ts` block is typechecked against the built package by `docs:test`. Snippets that import `./outpost.config.mts` use the configuration published on the Setup page; reuse it instead of redefining an agent and a provider.
- Mark a snippet that runs offline in a temporary directory with `<!-- check:run -->` right after it, and show its expected output in a comment or the next sentence.
- Keep snippets minimal: no unused options, no defensive code the reader does not need. Show the default path first, options later.
- Brief texts and prompts inside snippets stay in English in both languages; comments and prose follow the page language.

## What stays out

- **Validation campaigns and test evidence** (dates, model names used for live checks, "checked against version X", which scenarios passed): roadmap or changelog.
- **Version history** ("Available since 8.0.0", "stable in 7.0.0"): changelog. The Guide describes the current release.
- **Contributor material** (`scripts/`, `test/`, repository checkouts, how the source tree is organized): `AGENTS.md` or the repository README.
- **Exhaustive option lists and every edge case**: the Reference. The Guide shows the options a reader chooses between and links to the Reference for the rest.
- **Internal invariants** phrased as defensive prose. State the behaviour the reader observes.

## French

The French page mirrors the English page: same sections in the same order, same snippets, same links. Translate meaning, not word order. Use "vous", typographic apostrophes (’), a regular space before `:`, `;`, `?` and `!` as in existing pages, and these terms: la sandbox, le workspace, le worktree, le harness, le provider (de sandbox), le brief, le dispatch, le checkpoint, le hook, le webhook, le worker, la tâche, le dépôt, la branche. Keep API names, option names and code identical.

## Review checklist

Before committing a page:

- [ ] The opening says what the reader gets, in one to three sentences.
- [ ] The first snippet is the minimal common case and runs as shown.
- [ ] Each `##` section is a task, ordered by frequency.
- [ ] No validation campaigns, version notes or contributor commands.
- [ ] No fact repeated from its owning page; links instead.
- [ ] Negations are rare and grouped under Limits.
- [ ] No paragraph longer than three sentences; enumerations use a component or a table.
- [ ] Every claim matches the current source (`src/`) and Reference.
- [ ] The French page has the same structure, snippets and links.
- [ ] `docs:check`, `docs:build` and `docs:test` pass.
