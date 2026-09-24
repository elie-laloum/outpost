# Changelog

## Unreleased

- Add read-only `recovery verify --directory` checks for retained transfer metadata and required backup files, with bounded state parsing and explicit separation from content integrity or restoration validation.
- Add optional `recovery inspect --locks` with bounded lock metadata reads and local PID observations; report invalid or unverifiable records explicitly without claiming ownership or deleting locks.
- Add optional `recovery inspect --git` workspace reports with branch/detached HEAD, clean/dirty status, Git locks and explicit unregistered/unavailable states, without refreshing indexes or pruning registrations.
- Add read-only `outpost recovery inspect` reports for recovery files, logs, locks and managed workspaces, with metadata-only logical sizes, symlink protection and explicit partial results when traversal limits or filesystem errors prevent a complete inventory.
- Check default agent start/resume/fork CLI help inside diagnostic images, verifying command usage and declared options instead of trusting a successful help exit; keep real execution and protocol compatibility explicitly unverified.
- Extend `doctor --image` to check a local Docker/Podman image in a temporary sandbox, without image downloads or networking; report image agent versions and cleanup failures separately from host checks.
- Add `outpost doctor` with bounded host prerequisite checks, Docker/Podman connectivity, host agent version comparison, explicit unchecked capabilities and JSON reports.

## 2.0.0

- Normalize the workflow test directory before computing relative repository paths, fixing macOS CI with symlinked temporary directories.
- Show live agent progress in generated starters and report cancellation recovery details without an uncaught error stack trace.
- Document workflow directories, repository path resolution and multi-repository task ownership in English and French.
- Generate standalone workflow projects directly in the chosen directory, with `run.ts`, a default package manifest and preserved existing package/ignore files.
- Add `init --repository` for external repositories; resolve generated brief/environment paths from the script and pin the workflow container image independently of the target repository.
- Read image build recipes from the workflow root; older layouts can use `--file .outpost/Dockerfile`.
- Remove issue campaigns, GitHub/Beads/custom backlog connectors and their public types.
- Simplify initialization to a dispatch starter; remove campaign templates, `--template`, `--tracker`, `--label`, tracker files and GitHub/Beads CLI installation.

## 1.1.4

- Wait for noninteractive container commands and preserve their real exit status; reuse the runtime terminal for interactive commands.
- Stream binary archives through the running Docker/Podman container so uploads and conversation capture/restore see the same tmpfs home as agents.
- Preserve ordinary file modes and links, reject unsafe download destinations, and support GNU tar and bsdtar hosts.
- Create a private writable agent home in generated images, including when used without the sandbox tmpfs mount.
- Add real container, pseudo-terminal, cancellation, binary integrity and native conversation regression checks.
- Add English/French account-connection guides for Claude Code and Codex, plus seven progressive cookbooks.

## 1.1.3

- Replace the flat documentation with an Astro Starlight site in English and French, with English as the default language.
- Organize usage into focused guides and generate checked reference pages for every public API export and supporting contract.
- Validate translations, TypeScript examples, rendered links, navigation and search assets in CI.
- Deploy one GitHub Pages site after successful stable releases, protecting it from older release deployments.
- Move the French getting-started content and roadmap into the documentation, retain the root changelog and remove obsolete migration and contribution files.
- Keep documentation tooling out of the published library archive.

## 1.1.2

- Match npm package repository metadata to the GitHub build origin for provenance verification. GitLab remains the canonical source repository.

## 1.1.1

- Separate Claude and Codex adapters, request builders and protocol decoders; preserve unknown events as raw observations.
- Split sandbox provisioning, operation ownership, dispatch, attachment, conversation storage and recovery into dedicated services.
- Separate campaign planning, issue execution and integration; isolate workflow state, retries and scheduling.
- Isolate container planning, mounts, commands and transfers, cloud command/file adapters, Git worktree management and remote synchronization stages.
- Extract contracts into `.types.ts` modules and configuration defaults into `.constants.ts` modules, without changing public entry points.
- Enforce dependency boundaries and type placement in CI, reject unused implementation declarations, and document the structure in English and French.

## 1.1.0

- Add typed issue campaigns with dynamic planning, bounded concurrency, per-issue branches, warm review, verified integration and tracker closure.
- Add complete GitHub and Beads backlog connectors and executable campaign starters.
- Isolate cold passes, validate cancellation and structured responses before allocation, and preserve raw/final agent output.
- Expose per-turn transcripts, custom conversation stores, selective path rewriting and separate Claude cache counters.
- Align environment allowlists, caller-relative prompts, interactive variable collection and lifecycle hook ordering.
- Recover managed workspaces, refresh reusable branches and preserve host edits during committed-only remote synchronization.
- Complete Podman namespace options, macOS preflight, file-mount preparation and bounded transfers.
- Add human progress reporting, appendable journals, recovery metadata and terminal cleanup.
- Expand functional, provider and package tests; document migration in English and French.

## 1.0.0

Initial Outpost release.

- Separate workspace and sandbox ownership, reusable environments and asynchronous disposal.
- Codex and Claude Code adapters with native conversations, resume and fork.
- Docker, Podman, host, Vercel and Daytona providers; extensible provider contracts.
- Managed Git worktrees, named branches, automatic integration and recovery files.
- Remote synchronization retaining commit identity and protecting concurrent host changes.
- Prompt files, typed variables, command expansion, completion loops and inactivity deadlines.
- Tagged text/JSON responses, Standard Schema validation and resumable repair attempts.
- Typed workflow graphs with conditions, retries, cancellation, concurrency and diagrams.
- Interactive/headless initialization, five starter templates and issue-tracker connectors.
- English/French documentation, cross-platform tests, coverage gates and package release automation.
