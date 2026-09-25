---
title: "Changelog"
description: "Changelog — Outpost API"
sidebar:
  order: 2
---

The release notes below are synchronized from the root `CHANGELOG.md`, the single source of release history.

## 4.1.0

- Replace global CLI parsing and manual help with Commander subcommands and command-specific options; use Clack selection prompts for interactive initialization. Previously ignored options belonging to other commands are now rejected. Headless and JSON output remain plain.
- Guide initialization through package manager and authentication choices. Check a requested package manager before writing files when `--install` is used. Build Docker/Podman images automatically; use `--no-build` to generate files without building. Existing generated workflows are unchanged.
- Generate explicit API-key, Claude subscription-token and Codex account-login setup. Validate required model credentials before allocation; prepare Codex API login through stdin, or copy an explicitly selected account credential seed into the private sandbox home. Host keychains are not exported.
- Add `CodexModelProvider` with a custom Responses API URL and API-key environment variable; expose `--base-url`, `--api-key-env` and `--model` in initialization. Chat Completions-only endpoints are not supported. Verify the native Codex connection against a local simulated Responses endpoint in container CI.
- Preserve Vercel allocation variables on every command, with command-level overrides. Regress generated Claude token forwarding and document that switching providers must preserve explicit model variables.
- Add manually enabled authenticated Claude/Codex cloud campaigns with sanitized reports. Missing credentials remain skipped; adding this fixture does not establish a successful live account campaign. Scheduled runs do not make model calls.
- Preserve Daytona’s session shell and real exit status for non-interactive commands; accept an already removed PTY during cancellation cleanup. Regress both defects found by live testing. Validate Claude OAuth workflows on Docker, Vercel and Daytona, plus Daytona terminal input, resize, exit, cancellation and reuse.
- Preserve exact Daytona command output through encoded streaming, fixing synchronization of Git paths delimited by NUL bytes. Verify unterminated output, Unicode, exit status, cancellation and warm reuse.
- Make unattended Gemini `yolo` requests trust the selected workspace with `--skip-trust`; preserve other approval modes and document the trust boundary. Clarify generated Codex subscription login for local and cloud providers.
- Validate authenticated file-editing workflows with Codex subscription login and Gemini API keys on Docker, Vercel and Daytona, a custom Responses endpoint on Docker and Vercel, and OpenRouter Responses on Daytona. The same unmodified adapter completes the OpenRouter model/tool/synchronization workflow; the other custom endpoint still resets HTTPS connections from Daytona before authentication. Codex API-key authentication was not exercised in this campaign.
- Refocus the bilingual roadmap on near-term reliability and medium-term directions with explicit validation criteria.

## 4.0.0

This major release extends public workflow status unions. Exhaustive consumers must handle task statuses `paused` and `rejected`, and workflow result status `paused`. Research features remain explicitly opt-in with their documented limitations.

- Allocate isolated container workspaces under a writable private parent for rootless Podman, and publish file artifacts without recreating Windows drive roots. Document manual checkpoint lock recovery when process ownership cannot be verified.
- Create missing Vercel workspace and transfer parent directories recursively before writing files.

- Add cooperative storage reservations with workspace ownership, isolated restoration of retained previous/incoming transfer state, and local sandbox/resource activity inspection.
- Batch and verify incremental file/symlink uploads; transfer verified Git history deltas while retaining complete recovery bundles. Directory copies keep their existing transfer behavior.
- Persist workflow checkpoints with JSON outputs, explicit replay and cumulative usage. Add approval/pause gates and typed immutable artifacts with unsigned lineage.
- Add SQLite durable task queues, authenticated HTTP transport and fenced workers. Replays can repeat side effects; terminal usage receipts prevent double accounting without guaranteeing real-time billing caps.
- Extend task statuses with `paused` and `rejected`, and workflow result status with `paused`; exhaustive status consumers must handle these values. Add optional checkpoint flushing and usage-receipt methods to task contexts.
- Support Daytona native PTY attachment with cancellation, resize and reuse; live account validation remains outstanding.
- Add the Gemini CLI adapter, bootstrap, diagnostics and image installation pinned to 0.61.0. Gemini supports fresh sessions only, without native conversation capture, continuation or automatic response repairs.
- Add opt-in research prototypes for isolated Docker/Podman Git checkouts, prepared-host Firecracker microVMs, container deny-all/Vercel egress policies, and bounded speculative candidates with explicit validation and no automatic integration.
- Attribute cloud reports to source commit/runtime/time and retain successful image-attestation verification artifacts. Live cloud campaigns, signed publication and real Firecracker boot remain separately gated validation, not implied successes.
- Synchronize the complete public API reference, bilingual guides and roadmap with implemented behavior and remaining prototype limits.

## 3.0.0

- Canonicalize temporary recovery verification directories across platforms and reuse existing Podman cache volumes without recreation.
- Breaking: custom implementations of `Sandbox`, `TaskContext` and `WorkflowResult` must provide `diagnose`, `reportUsage` and `usage`, respectively; exhaustive workflow observers must handle the new `attempt` and `usage` events. Factory-created objects provide these members automatically.
- Treat uncertain or legacy lock ownership conservatively; simultaneous writers to the same configured journal now conflict instead of sharing the file.
- Add shared workflow attempt and observed usage budgets, including retries and agent repairs, with graceful admission draining and cooperative token-limit cancellation.
- Add structured workflow usage/lifecycle events and an optional OpenTelemetry entry point with injected tracer/meter, fixed span names, counters and duration histograms without task contents or identifiers.
- Diagnose caller-owned sandboxes through an exclusive operation, with optional binary transfer probes and cleanup; report observed capabilities separately from advertised contracts and bundled agent protocol fixture checks.
- Add credential-free cloud contract fixtures and explicitly enabled scheduled Vercel/Daytona checks with sanitized reports, independent cleanup and optional live CLI syntax probes; authenticated model turns remain outside this suite.
- Wait for Daytona command exit status after output closes, and register allocation cleanup before discovering the sandbox home.
- Add explicit recovery retention plans, revalidated cleanup and quota admission; protect recovery artifacts, uncertain logs and workspaces containing ignored files.
- Observe lock ownership using Linux host, boot, namespace and process-start identity; serialize stale-lock reclamation and refuse uncertain owners.
- Verify retained Git bundles, objects and patch applicability in an isolated copy without inherited Git filters or changes to the source repository.
- Add opt-in Docker/Podman dependency caches with explicit invalidation keys and repository, image and user scoping; add pinned agent-image build tooling and a gated publication workflow with signed provenance verification.
- Download changed untracked files from Vercel/Daytona using SHA-256 manifests and bounded gzip batches; reuse verified unchanged files while retaining complete recovery payloads and protecting ignored host files.
- Record atomic SHA-256 manifests for new remote transfer backups before host apply; add opt-in `recovery verify --checksums` with bounded streaming verification, explicit missing/mismatched results and preserved host state on capture failure.
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
