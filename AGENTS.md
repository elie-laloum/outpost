# Working on Outpost

This file applies to the entire repository. It is the durable project brief for contributors and coding agents. Keep it aligned with the implementation and CI; do not turn it into a conversation log. Follow the user's current scope and instructions when they differ from these defaults.

## Purpose and philosophy

Outpost is a TypeScript library and CLI for running coding agents in sandboxes, managing their Git workspaces, preserving conversations and composing typed workflows and issue campaigns.

- Prioritize reliable, directly usable behavior and an excellent developer experience.
- Make code understandable through names, small responsibilities and explicit contracts.
- Use domain-driven design and ports and adapters pragmatically. Introduce abstractions for real responsibilities and variations, not speculative flexibility.
- Keep agent protocols independent of sandbox backends. Claude Code and Codex are the supported agents; additional agents belong behind the existing ports.
- Preserve existing features and public contracts during refactoring. Architecture changes must not silently change execution behavior.
- Prefer explicit ownership, predictable failure modes and recoverable state over hidden automation.
- Describe only shipped capabilities as available. Planned features belong in the roadmap.

## Start here

Read `README.md`, `package.json`, `SECURITY.md` and `docs/src/content/docs/project/architecture.md`. Inspect the relevant source, tests and workflows before editing. Check Git status and preserve unrelated work.

Use the repository as the source of truth for versions, supported options and commands. Do not rely on test counts, coverage percentages or publication status remembered from a previous chat.

- Runtime: Node.js 24+, TypeScript, ESM, npm and committed lockfiles.
- Public package: `@elie-laloum/outpost`.
- Public facade: `src/index.ts` and the provider subpaths declared in `package.json`.
- Canonical repository: <https://gitlab.elielaloum.com/elielaloum/outpost>.
- GitHub mirror and CI: <https://github.com/elie-laloum/outpost>.
- Documentation: <https://elie-laloum.github.io/outpost/>.

## Architecture and responsibilities

| Location                 | Responsibility                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `src/domain/`            | Contracts, validation, prompts, responses, usage, task graphs and workflow rules.                       |
| `src/application/`       | Use cases, resource ownership, dispatch, lifecycle orchestration, campaigns and remote synchronization. |
| `src/adapters/agents/`   | One implementation per agent, with separate request construction and event decoding.                    |
| `src/adapters/backlogs/` | Tracker-specific issue access behind backlog contracts.                                                 |
| `src/providers/`         | Sandbox allocation, command execution, file transfer and disposal.                                      |
| `src/infrastructure/`    | Processes, binary streams, Git, files, native conversation storage and logging.                         |
| `src/cli/`               | Argument handling, project scaffolding and image commands.                                              |

`scripts/check-architecture.mjs` enforces these internal dependency directions:

- Domain depends only on domain modules.
- Infrastructure may depend on domain and infrastructure.
- Adapters may depend on domain, infrastructure and adapters.
- Providers may depend on domain, infrastructure, adapters and providers.
- Application may depend on every non-CLI layer.
- CLI composes the other layers.

These are allowed boundaries, not a reason to add unnecessary dependencies. Keep vendor SDKs and protocol details out of the domain. Optional cloud SDKs must remain optional and load through their provider entry points.

Apply SRP throughout the codebase: allocation, request building, event decoding, process supervision, transfer, storage and cleanup have different reasons to change. Split them accordingly. Do not centralize Claude and Codex implementations in a provider file. Compatibility facades such as `providers/agents.ts` re-export; internal services import their owning modules directly.

Use `AgentAdapter` for agent behavior, `SandboxProvider`/`SandboxLease` for execution environments and `ConversationStore` for transcript persistence. Prefer composition and injected capabilities to inheritance or branching on provider names throughout the application. Extend the relevant adapter or strategy when introducing a variant.

## Code conventions

- Keep source identifiers, errors and project guidance in English.
- Put interfaces, type aliases and object type declarations in adjacent `*.types.ts` modules. Use type-only imports; these files must have no runtime initialization.
- Put configuration defaults, supported values, shared limits and reusable fixed recipes in adjacent `*.constants.ts` modules. Keep local variables, computed values and closures with their operation; do not create a global constants dumping ground.
- Use guard clauses for validation and early exits. Use strategies or handler registries for behavioral alternatives. Do not introduce `if / else if / else` chains or disguise them as nested ternaries.
- Keep simple conditions simple. Avoid abstraction layers that make a single operation harder to read.
- Respect strict TypeScript settings. Narrow unknown external data at boundaries; do not silence errors with unchecked casts or `any`.
- Follow the existing relative `.ts` import convention and public export layout.
- Comments are exceptional: prefer one line, never more than two lines per comment. Explain a non-obvious constraint or reason, not what the code says. Do not split a long explanation into adjacent comments to bypass this rule.
- Put longer explanations in Markdown documentation. The comment limit does not limit documentation prose.
- Use the repository's Prettier configuration. Format changed files without unrelated churn.
- Avoid new dependencies unless they materially simplify a requirement. Preserve the lightweight core and optional provider integrations.

## Behavioral invariants

Treat these as review and regression-test obligations when changing the affected code:

- Workspaces and sandboxes have separate lifetimes. Preserve cold execution, warm reuse, exclusive operation ownership and idempotent disposal.
- A command completes when its process completes. Preserve exit status even when stdout/stderr close early. Cancellation and deadlines must terminate the intended process group and descendants without destroying an otherwise reusable sandbox.
- Non-TTY container commands use `setsid --wait`. Real interactive terminals use the session supplied by the container runtime. Do not apply the non-TTY wrapper blindly to TTY execution.
- Container transfers must see the live mounted filesystem, including tmpfs. Do not replace the streamed archive implementation with `docker cp`/`podman cp` without proving equivalent behavior for these mounts.
- Transfer binary data without text decoding or output-retention truncation. Preserve supported file permissions, symlinks and directory-content semantics. Reject unsafe destination traversal and clean temporary staging on success, failure and cancellation.
- Keep the agent home coherent. The default private home remains ephemeral; do not solve authentication by persisting only a fragment of it. Generated images must create the home with correct ownership and permissions.
- Preserve conversation capture, restore, continuation, fork and transcript relocation. Agent authentication and conversation storage are separate concerns.
- Preserve hook ordering, structured-response validation, retries, usage aggregation and observer isolation. Observer failures must not change execution outcomes.
- Protect concurrent host edits during remote synchronization. Validate and back up before applying incoming changes. Preserve recovery artifacts whenever cleanup would discard recoverable work.
- Keep branch integration and tracker closure explicit and correctly ordered. Never discard dirty or detached worktrees as routine cleanup.
- Do not silently fall back from an isolated provider to host execution. `local()` is explicitly unisolated; mounted Git metadata is not an adversarial security boundary.

## Tests and coverage

Use `node:test` and `node:assert/strict`, following the existing suite. Test observable contracts and failures rather than mirroring implementation details.

- `test/unit/`: domain rules, protocol adapters, boundaries and isolated infrastructure behavior.
- `test/functional/`: lifecycle, Git, synchronization, recovery, CLI and campaign behavior using temporary resources.
- `test/container.test.ts`: real Docker/Podman behavior. Mocks alone cannot validate process sessions, tmpfs, mounts, ownership or archive transfer.
- `test/fixtures/container-terminal.ts`: real PTY input, exit status, cancellation and warm reuse.
- `scripts/package-smoke.mjs`: the packed package as a consumer sees it, including exports and declarations.

For a bug fix, add a regression that fails for the actual defect. For execution changes, checking stdout alone is insufficient: test nonzero exit status, completion after output closes, cancellation and reuse as relevant. For transfer changes, verify files through a process inside the sandbox, not just an upload/download round trip.

`npm run coverage` enforces **at least 80% lines, branches and functions**. Preserve or improve meaningful coverage. Do not lower thresholds, add exclusions or write trivial tests to make a metric pass. Existing exclusions cover erased type modules and the CLI process entry wrapper; command handlers remain covered.

Keep routine tests deterministic and independent of real account credentials or paid model calls. Clearly distinguish mock tests, real container tests and live provider/model tests when reporting results. Never report an unavailable or skipped check as passed.

### Validation commands

Install root dependencies with `npm ci`; install documentation dependencies with `npm ci --prefix docs` when needed.

| Change                                                                | Checks                                                                                               |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Source behavior or architecture                                       | `npm run check` (architecture, typecheck, unit/functional tests, build), then `npm run coverage`.    |
| Public API, exports, packaging or dependencies                        | Also `npm run test:package`.                                                                         |
| Container commands, transfers, mounts, lifecycle or image scaffolding | Also real Docker and Podman tests and the PTY fixture using the setup in `.github/workflows/ci.yml`. |
| API documentation or changelog sources                                | `npm run docs:sync`, then inspect generated changes.                                                 |
| Documentation content or site configuration                           | `npm run build`, `npm run docs:check`, `npm run docs:build`, `npm run docs:test`.                    |
| Any changed tracked content                                           | Prettier check on changed files; full `npm run format:check` before release.                         |

CI checks Windows, macOS and Linux, real Docker/Podman execution, package consumption, coverage, formatting, documentation and dependency audits. Match relevant CI checks locally where possible. For a guidance-only Markdown edit, formatting and factual/link review are sufficient; do not rerun runtime suites without a reason.

## Documentation

- Use Astro Starlight in `docs/`, with `.md` content and English as the default language.
- English content lives in `docs/src/content/docs/`; French equivalents live under `fr/` with matching relative paths. Update both languages for user-facing changes.
- Organize by user task. Prefer focused, navigable pages to large catch-all documents. Maintain sidebar order, cross-links and useful prerequisites.
- Examples must match the public API and be usable in their stated environment. Explain expected results, resource ownership, authentication and failure behavior where relevant.
- Cookbooks progress from small tasks to advanced orchestration. Keep complete examples and distinguish instructions to an agent from enforced workflow gates.
- Keep account/subscription login and API-key authentication clearly separated, including billing implications and host-versus-sandbox credential locations. Check current official vendor documentation when modifying authentication guidance.
- The API reference and both documentation changelogs are synchronized by `docs/scripts/sync-reference.mjs`. Update their sources and regenerate; do not patch generated output as the source of truth. Changelog sources are root `CHANGELOG.md` and `docs/translations/changelog.fr.md`.
- Keep `CHANGELOG.md` at the root and in the documentation. The roadmap belongs in the documentation. Do not reintroduce a root French README, `CONTRIBUTING.md`, root roadmap or migration guides without a new requirement.
- Documentation checks validate language parity, links, generated references, rendered output, search and examples. Do not treat a successful Astro build alone as complete validation.

## Git, CI and releases

- GitLab is the source repository; GitHub is its mirror and runs GitHub Actions. Avoid independent changes on GitHub that diverge from GitLab.
- Main and pull requests are validated. There is one public documentation site, deployed after the latest eligible stable release; main does not deploy a separate preview site.
- A release tag is `v<package version>`. Keep `package.json`, the lockfile and changelogs consistent. Use the release workflow, including its verification gates and latest-release guard.
- npm publication uses provenance and public access. The workflow sets `repository.url` to the GitHub mirror immediately before publishing; the source manifest retains the canonical GitLab URL.
- Do not manually bypass failed release checks, move published tags or republish an existing package version. Verify remote workflow, package and documentation status before claiming publication succeeded.
- A local change does not itself authorize a release. Follow the requested delivery scope; do not bump versions or create tags for every edit.

## Working discipline

Reproduce and explain failures before choosing a fix. Consider adjacent contracts and side effects, then make the smallest coherent change that preserves the architecture. Complete the relevant tests and documentation together.

Never commit credentials, private transcripts, runtime artifacts or sensitive logs. Use environment variables and ignored configuration; keep secrets out of command output and remote URLs. Follow `SECURITY.md` for execution and data boundaries.

Preserve unrelated user changes. Avoid destructive resets, broad cleanup and unrelated refactors. Inspect the final diff for accidental generated files, secrets and scope creep.

Report what changed, what was verified, and concrete limitations or remaining work. Do not promise zero side effects or claim feature completeness based only on unit tests. Keep this file current when a lasting project convention changes.
