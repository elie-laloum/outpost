# Working on Outpost

This file applies to the entire repository. It is the durable project brief for contributors and coding agents. Keep it aligned with the implementation and CI; do not turn it into a conversation log. Follow the user's current scope and instructions when they differ from these defaults.

## Purpose and philosophy

Outpost is a TypeScript library and CLI for running coding agents in sandboxes, managing their Git workspaces, preserving conversations and composing typed workflows.

- Prioritize reliable, directly usable behavior and an excellent developer experience.
- Make code understandable through names, small responsibilities and explicit contracts.
- Use domain-driven design and ports and adapters pragmatically. Introduce abstractions for real responsibilities and variations, not speculative flexibility.
- Keep agent protocols independent of sandbox backends. Additional agents belong behind the existing ports.
- Preserve existing features and public contracts during refactoring. Architecture changes must not silently change execution behavior.
- Prefer explicit ownership, predictable failure modes and recoverable state over hidden automation.
- Distinguish released behavior, implemented but unreleased additions, and opt-in research prototypes. Keep remaining work and live-validation prerequisites in the guides and release notes; do not imply publication from a local implementation.

## Start here

Read `README.md`, `package.json`, `SECURITY.md` and `docs/src/content/docs/guide/integration-ports.md`. Inspect the relevant source, tests and workflows before editing. Check Git status and preserve unrelated work.

Use the repository as the source of truth for versions, supported options and commands. Do not rely on test counts, coverage percentages or publication status remembered from a previous chat.

- Runtime: Node.js 24+, TypeScript, ESM. Bun (version pinned by `packageManager`) installs dependencies and runs scripts, with committed `bun.lock` files; tests and scripts still execute on Node.js. `images/<agent>/` keeps one npm lockfile per CLI image because images install CLIs with npm; they ship in the package for `image eject`.
- Public package: `@elie-laloum/outpost`.
- Public API: explicit subpaths declared in `package.json`. `/core` owns everyday agent execution; `/workspaces`, `/harness`, `/workflows`, `/queues`, `/storage`, `/observation`, `/recovery`, `/integrations`, `/recipes` and `/speculation` own their contracts. There is no package-root export or compatibility barrel. Import each symbol from its owning entry; internal services continue to import implementation modules directly. Clean builds remove retired entry artifacts before packing.
- Canonical repository: <https://gitlab.elielaloum.com/elielaloum/outpost>.
- GitHub mirror and CI: <https://github.com/elie-laloum/outpost>.
- Documentation: <https://elie-laloum.github.io/outpost/>.

## Area briefs

Area briefs hold the rules that apply only to their files. Read the brief before changing files it covers; some agents load it automatically when they read a file below it, others must open it.

| Brief                               | Read before changing                                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/AGENTS.md`                     | Source code: domain contracts, composition, CLI, images and authentication, repositories and storage, behavioral invariants.     |
| `src/application/recipes/AGENTS.md` | YAML recipes: `src/application/recipes/`, `src/domain/recipes/`, `recipes/`, the recipe CLI commands and `scripts/recipe-*.mjs`. |
| `test/AGENTS.md`                    | Test suites, fixtures and opt-in live checks.                                                                                    |
| `docs/AGENTS.md`                    | Documentation content, navigation, reference generation and documentation checks.                                                |

This root brief applies everywhere; area briefs add rules and never relax it. Keep each rule in exactly one brief, aligned with its code like this file.

## Architecture and responsibilities

| Location                | Responsibility                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `src/domain/`           | Contracts, validation, prompts, responses, usage, task graphs and workflow rules.            |
| `src/application/`      | Use cases, resource ownership, dispatch, lifecycle orchestration and remote synchronization. |
| `src/adapters/agents/`  | One folder per agent: request building, event decoding, descriptor. Plus the catalog.        |
| `src/adapters/secrets/` | Optional secret-manager adapters with host-side, declared-name resolution.                   |
| `src/providers/`        | Sandbox allocation, command execution, file transfer and disposal.                           |
| `src/infrastructure/`   | Processes, binary streams, Git, files, native conversation storage and logging.              |
| `src/cli/`              | Argument handling, project scaffolding and image commands.                                   |
| `editor/`               | Recipe editor web app (TanStack Start SPA), built into `dist/editor` for `recipe editor`.    |

`scripts/check-architecture.mjs` enforces these internal dependency directions:

- Domain depends only on domain modules.
- Infrastructure may depend on domain and infrastructure.
- Adapters may depend on domain, infrastructure and adapters.
- Providers may depend on domain, infrastructure, adapters and providers.
- Application may depend on every non-CLI layer.
- CLI composes the other layers.

The checker also inspects type-import expressions. Review nested behavioral alternatives, unchecked double casts and comment length manually; static dependency checks do not enforce every code convention.

These are allowed boundaries, not a reason to add unnecessary dependencies. Keep vendor SDKs and protocol details out of the domain. Optional cloud SDKs must remain optional and load through their provider entry points.

Apply SRP throughout the codebase: allocation, request building, event decoding, process supervision, transfer, storage and cleanup have different reasons to change. Split them accordingly. Do not centralize Claude and Codex implementations in a provider file. Compatibility facades such as `providers/agents.ts` re-export; internal services import their owning modules directly.

## Code conventions

- Keep source identifiers, errors and project guidance in English.
- Put public and shared interfaces, type aliases and object type declarations in adjacent `*.types.ts` modules. A non-exported type or interface of at most five lines may stay inside the single function that uses it. Use type-only imports; `.types.ts` files must have no runtime initialization.
- Put configuration defaults, supported values, shared limits and reusable fixed recipes in adjacent `*.constants.ts` modules. Keep local variables, computed values and closures with their operation; do not create a global constants dumping ground.
- Use guard clauses for validation and early exits. Use strategies or handler registries for behavioral alternatives. Do not introduce `if / else if / else` chains or disguise them as nested ternaries.
- Keep simple conditions simple. Avoid abstraction layers that make a single operation harder to read.
- Attempt ordered cleanup with `withCleanup()`/`runCleanup()` from `src/domain/cleanup.ts` instead of hand-written `let failure` blocks: every step runs, the execution failure is never masked, and a `recovery` key keeps it unchanged with cleanup failures attached. Callers still decide ownership, preservation and order.
- Raise recipe and execution configuration errors with `configurationError()`/`configurationInvariant()` from `src/domain/configuration-diagnostic.ts`, giving a stable code, the path of the rejected value and a hint when the fix is known; wrap lower-level validators with `locateConfiguration()`. Locations come from paths, never from message text.
- Respect strict TypeScript settings. Narrow unknown external data at boundaries; do not silence errors with unchecked casts or `any`.
- Follow the existing relative `.ts` import convention and public export layout.
- Name public functions by when their work happens: `create*` builds a runtime object (agent, harness, provider, transport, store, queue, observer, reporter); `define*` declares what an engine runs later (workflows, tasks, response and artifact contracts, harness tools, hooks, skills); a verb acts immediately (`dispatch`, `speculate`, `readJournal`). Give each constructor a name distinct from every type.
- When renaming a public function, keep the previous name as a `@deprecated` alias (in `src/deprecated.ts`, or beside a subpath export) until the next major version. Reference generation skips `@deprecated` exports and guide snippets reject them; redirect the retired reference page to its replacement.
- Comments are exceptional: prefer one line, never more than two lines per comment. Explain a non-obvious constraint or reason, not what the code says. Do not split a long explanation into adjacent comments to bypass this rule.
- Put longer explanations in Markdown documentation. The comment limit does not limit documentation prose.
- Use the repository's Prettier configuration. Format changed files without unrelated churn.
- Avoid new dependencies unless they materially simplify a requirement. Preserve the lightweight core and optional provider integrations.

## Tests and coverage

Use `node:test` and `node:assert/strict`, following the existing suite. Test observable contracts and failures rather than mirroring implementation details. Test scripts preload `test/setup.ts`, which removes host CLI home variables such as `CLAUDE_CONFIG_DIR`; run a single file with `node --import ./test/setup.ts --test <file>`.

For a bug fix, add a regression that fails for the actual defect. For execution changes, checking stdout alone is insufficient: test nonzero exit status, completion after output closes, cancellation and reuse as relevant. For transfer changes, verify files through a process inside the sandbox, not just an upload/download round trip.

`bun run coverage` enforces **at least 80% lines, branches and functions**. Preserve or improve meaningful coverage. Do not lower thresholds, add exclusions or write trivial tests to make a metric pass. Existing exclusions cover erased type modules and the CLI process entry wrapper; command handlers remain covered.

Keep routine tests deterministic and independent of real account credentials or paid model calls. Clearly distinguish mock tests, real container tests and live provider/model tests when reporting results. Never report an unavailable or skipped check as passed.

### Validation commands

Use `bun run check:generated` for recipe catalogues, schemas and parity; `check:source` for source behavior and coverage; `check:package` for packed-package consumption; and `check:docs` for documentation, examples and browser checks. These commands retain the existing checks and do not replace real Docker/Podman or Redis validation. Regenerate derived files explicitly before checking them.

Install root dependencies with `bun install --frozen-lockfile`; install documentation dependencies with `bun install --cwd docs --frozen-lockfile` when needed.

| Change                                                                | Checks                                                                                                         |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Source behavior or architecture                                       | `bun run check` (architecture, typecheck, unit/functional tests, build), then `bun run coverage`.              |
| Public API, exports, packaging or dependencies                        | Also `bun run test:package`.                                                                                   |
| Container commands, transfers, mounts, lifecycle or image scaffolding | Also real Docker and Podman tests and the PTY fixture using the setup in `.github/workflows/ci.yml`.           |
| BullMQ queue state, distribution or connection ownership              | Also `bun run test:redis` against standalone Redis using the setup in `.github/workflows/ci.yml`.              |
| Recipe editor app, its server routes or editor runs                   | Also `bun run build`, then `bun run test:editor` after `bunx playwright-core install chromium`.                |
| API documentation or changelog sources                                | `bun run docs:sync`, then inspect generated changes.                                                           |
| Documentation content or site configuration                           | `bun run build`, `bun run docs:check`, `bun run docs:build`, `bun run docs:test`, `bun run docs:test:browser`. |
| Any changed tracked content                                           | Prettier check on changed files; full `bun run format:check` before release.                                   |

CI runs the full unit/functional suite with coverage on Linux and in three test shards without instrumentation on Windows and macOS. Static checks run once on Linux; package consumption and recipe examples run on all three systems. The built recipe editor runs in headless Chromium on Linux. Real Docker/Podman execution, Redis, documentation and dependency audits remain required. New pushes cancel superseded branch/PR runs; release-tag verification is not cancelled. The `Images` workflow builds and publishes agent images and the egress companion together, testing the same image bytes with Docker and rootless Podman on amd64/arm64. Match relevant CI checks locally where possible. For a guidance-only Markdown edit, formatting and factual/link review are sufficient; do not rerun runtime suites without a reason.

## Generated files and changelogs

- Generated sources: edit `native-catalog.constants.ts` and owning TypeScript contracts before `node scripts/recipe-native-schemas.mjs --write`; edit `recipes/` before `node scripts/recipe-catalog.mjs --write`; use `node scripts/recipe-schemas.mjs --write` for editor schemas and `bun run docs:sync` for reference pages, component guides, agent capability tables and site changelogs. The sign-in and continuation tables of `guide/choose-an-agent.md` come from agent descriptors and adapters through `node scripts/agent-capability-docs.mjs --write`. Never edit generated factory descriptors, capability tables or API pages directly.
- The API reference and both documentation changelogs are synchronized by `docs/scripts/sync-reference.mjs`. Update their sources and regenerate; do not patch generated output as the source of truth. Changelog sources are root `CHANGELOG.md` and `docs/translations/changelog.fr.md`.
- Keep `CHANGELOG.md` at the root and in the documentation. Do not reintroduce the repository roadmap, documentation roadmap pages, a root French README, `CONTRIBUTING.md` or migration guides without a new requirement.
- When API is updated and docs is updated as well always update docs/references with changes.

## Git, CI and releases

- GitLab is the source repository; GitHub is its mirror and runs GitHub Actions. Avoid independent changes on GitHub that diverge from GitLab.
- Main and pull requests are validated. There is one public documentation site, deployed after the latest eligible stable release; main does not deploy a separate preview site.
- A release tag is `v<package version>`. Keep `package.json`, the lockfile and changelogs consistent. `scripts/verify-release.mjs` requires a nonempty version section and an empty `Unreleased` section in both changelogs, then emits only that version’s English notes for the release workflow. Use its verification gates and latest-release guard.
- For every release, update the version history in `CHANGELOG.md` and `docs/translations/changelog.fr.md`, and review remaining validation prerequisites in the guides and release notes. Do this before creating the release tag.
- Reconcile release notes with the actual implementation: record shipped and removed capabilities, keep incomplete work and live-validation limits explicit, and avoid promising unimplemented features.
- Regenerate the documentation changelogs with `bun run docs:sync`, inspect the generated changes, and run the required documentation checks. Include the changelog and validation-prerequisite updates in the release commit and verify the changelog’s English/French consistency before tagging.
- npm publication uses provenance and public access. The workflow packs with `bun pm pack`, sets `repository.url` to the GitHub mirror immediately before packing, and uploads the archive with `npm publish` because Bun cannot generate provenance; the source manifest retains the canonical GitLab URL.
- Do not manually bypass failed release checks, move published tags or republish an existing package version. Verify remote workflow, package and documentation status before claiming publication succeeded.
- A local change does not itself authorize a release. Follow the requested delivery scope; do not bump versions or create tags for every edit.

## Working discipline

Reproduce and explain failures before choosing a fix. Consider adjacent contracts and side effects, then make the smallest coherent change that preserves the architecture. Complete the relevant tests and documentation together.

Never commit credentials, private transcripts, runtime artifacts or sensitive logs. Use environment variables and ignored configuration; keep secrets out of command output and remote URLs. Follow `SECURITY.md` for execution and data boundaries.

Preserve unrelated user changes. Avoid destructive resets, broad cleanup and unrelated refactors. Inspect the final diff for accidental generated files, secrets and scope creep.

Report what changed, what was verified, and concrete limitations or remaining work. Do not promise zero side effects or claim feature completeness based only on unit tests. Keep this file current when a lasting project convention changes.
