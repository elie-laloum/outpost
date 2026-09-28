---
title: "Changelog"
description: "Changelog — Outpost API"
sidebar:
  order: 2
---

The release notes below are synchronized from the root `CHANGELOG.md`, the single source of release history.

## Unreleased

- Stabilize the built-in harness and OpenAI/Anthropic model contracts (implemented, unreleased), with authenticated delegation validated for both integrations. Add `defineHarnessSubagent()` with serialized shared-sandbox execution, separate captured histories, inherited permissions, bounded depth and cumulative ancestor token budgets. Count final responses and context summaries toward token ceilings, reject incomplete accounting and correlate child lifecycle/usage events. Add deterministic container CI and an opt-in, budgeted live campaign.
- Add scoped observation hubs with bounded pluggable sinks, correlated workflow/agent/operation events, process stop diagnostics, normalized CLI tool results and opt-in model payloads. Journals and reporters use the shared delivery policy; sink failures are reported independently of execution. OpenTelemetry can consume the unified stream without changing metric names.
- Add native session capture, warm/cold resume and response repairs for Copilot and Kimi, plus native Kimi fork. Antigravity supports warm resume and repairs only; portable capture/cold resume and automated fork remain unsupported. Copilot automated fork is explicitly refused. Session bundles preserve supported native files and can be archived through Transport.

- Add opt-in Firecracker jailer execution with protected root-owned assets, an unprivileged VMM identity, cgroup v2 CPU/memory/process limits and conservative jail/cgroup cleanup. Direct execution remains compatible; the provider remains experimental pending broader host and adversarial validation.
- Pin Antigravity CLI 1.2.12 in generated images and remote bootstrap using versioned archives and recorded SHA-512 digests. Expose `agentVersions.antigravity`, compare it in doctor, and disable automatic updates in generated images, agent requests and diagnostics. Existing binaries are reused; existing image recipes must be updated and rebuilt.
- Collect Copilot and Kimi token usage from sandbox session files, including Kimi sub-agents, and reconcile Copilot streamed usage without double counting. Missing or partial counters carry `Usage.complete: false` through dispatch, workflows, speculation and checkpoints. Token-only workflow budgets fail with `WorkflowUsageUnavailable` when accounting is incomplete; configure an attempt budget and execution time limits for bounded fallback.

- Add `s3Transport({ deleteMode: "tombstone" })` for services such as R2 without atomic conditional DELETE: conditional PUT markers fence stale deletions and concurrent recreation, remain physically stored, and are hidden from reads and lists. The default conditional DELETE mode is unchanged.
- Refuse BullMQ queues unless Redis INFO confirms `maxmemory-policy=noeviction`, with a configuration error instead of allowing eviction of queue state.

- Stop host `doctor` probes and their descendants on interruption, preserving SIGINT/SIGTERM exit codes.
- Keep a safe connection diagnostic in CLI-agent timeout errors when the latest failure event reports a connection problem, without copying endpoint URLs or credentials.
- Fix Copilot account authentication when `config.json` stores the selected account token as an object with a `token` field, while retaining support for string tokens.
- Fix Kimi Code international account authentication with `kimiHarness({ authentication: "account", region: "global" })`: copy the region-scoped OAuth credential and device identifier, then provision the same region inside the sandbox. Account authentication defaults to `region: "global"` when omitted; Chinese accounts must select `region: "mainland-cn"` explicitly. Conflicting account endpoint overrides are rejected for both explicit and default regions.

## 6.0.1

- Rebuild the English and French Guide from scratch with focused explanations and short, directly usable snippets. Introduce a new page structure, task-based navigation and a dedicated responsive Guide layout.
- Cover setup, agent configuration, sandboxes, workflows, persistence, monitoring, operations and the experimental model engine across 60 pages per language. Preserve the Reference content and navigation.
- Redirect retired Guide URLs to their new destinations, including localized links and continuation anchors. Validate rendered links, search, navigation and examples in both languages.
- Replace workshop preparation generation with compilation of Guide snippets, offline execution of selected examples and real Docker/Podman checks of the documented command example. Public library contracts are unchanged.

## 6.0.0

Breaking changes, without compatibility aliases:

- Unify artifact, checkpoint, journal, resource activity and reservation persistence through Transport, with `localTransport()` for disk storage. Remove `fileArtifactStore`, `fileWorkflowCheckpointStore`, their option types, `logging.file` and `DispatchResult.log`; journals expose `logReference`. Default runtime objects live under `.outpost/storage`. Checkpoint and reservation crash recovery is explicit locally and remotely; old file layouts are not migrated. Git worktrees and execution staging remain filesystem operations. Local transports and inspection reads accept root-owned system links among ancestors, such as `/var` on macOS, and still reject links created by users.
- Rename `CustomHarness` to `Harness` and `CustomHarnessOptions` to `HarnessOptions`; the former `Harness` union becomes `AgentHarness` (`CliHarness | Harness`). Runtime behavior and discriminants are unchanged.
- Replace the `{ mode: "api-key" | "oauth-token" | "login", environment?, credentials? }` authentication shapes with `authentication: "account" | "usage" | { account: { file | key | variable } } | { usage: { key | variable } }` on every CLI harness, with the new `AccountCredential` and `UsageCredential` types. There is no automatic mode; unsupported forms fail when the agent is composed and list the accepted forms. `AgentAdapter.authenticate()` becomes `credentials(variables)`, returning a `CredentialPlan`.
- `outpost init --authentication` accepts `account`, `account-token` (Claude and Copilot) or `usage` and defaults to `account`; generated scripts no longer read credential files.
- Remove Gemini CLI, which no longer serves free, Google AI Pro and Ultra accounts: `geminiHarness()`, `GeminiSettings`, `agentVersions.gemini` and `doctor --agent gemini` are removed, and generated images no longer install `@google/gemini-cli`.

Unified CLI authentication:

- `account` copies the CLI's own host session into the private sandbox home: Claude `.credentials.json` (only `claudeAiOauth`), Codex `auth.json`, the Antigravity OAuth token file, the Copilot token stored in `config.json` (forwarded as `COPILOT_GITHUB_TOKEN`), and the Kimi Code credentials and device identifier followed by `kimi login` in the sandbox. `CLAUDE_CONFIG_DIR`, `CODEX_HOME`, `COPILOT_HOME` and `KIMI_CODE_HOME` relocate the host sources, and `account.file` selects a dedicated profile.
- `usage` forwards the CLI's standard API-key variable: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` followed by `codex login --with-api-key` in the sandbox, `GEMINI_API_KEY` with a generated Antigravity `settings.json`, or `KIMI_API_KEY` translated to Kimi's model variables with a required model. Codex with a custom `modelProvider` accepts only usage forms, applied to `apiKeyEnvironment`. Classic `ghp_` tokens are rejected for Copilot.
- Outpost reads only regular host files up to 1 MiB, never reads a system keychain, and installs credentials through one stdin-fed installer with 0700 directories and 0600 files. The local provider receives variables only: no file is written and no login command runs on the host.

New CLI harnesses:

- Add `antigravityHarness()`, `copilotHarness()` and `kimiHarness()` with `AntigravitySettings`, `CopilotSettings` and `KimiSettings`. They run fresh sessions without native capture, resume, fork or automatic response repairs, accept model names only and disable CLI auto-updates by default. Copilot and Kimi report no token usage. `doctor` accepts `antigravity`, `copilot` and `kimi`.
- Generated images, the published agent image lock and remote bootstrap pin GitHub Copilot CLI 1.0.88 and Kimi Code 2.1.1. Images install `agy` with the official Antigravity script into `/usr/local/bin`, and remote bootstrap runs the same script when `agy` is missing; `agy` is not version-pinned. Images set `XDG_CACHE_HOME=/tmp/.cache` so Copilot can load its native addon outside the noexec home.
- Protocols are covered by synthetic fixtures and help checks of the installed CLIs; live model runs of the three CLIs remain unvalidated.

## 5.0.0

Breaking changes, without compatibility aliases:

- Replace agent factories with `agent({ harness, model })` and the `codexHarness()`, `claudeHarness()` and `geminiHarness()` presets.
- Accept the model as a name or an `AgentModel` object with `reasoning` and `maxOutputTokens`; `agent.model` is now a normalized object. `reasoning` leaves `claudeHarness()` and `codexHarness()`, and `maxOutputTokens` leaves `anthropicModelProvider()`. The CLI harness or model provider rejects unsupported settings when the agent is composed: Claude Code maps them to `--effort` and `CLAUDE_CODE_MAX_OUTPUT_TOKENS`, Codex accepts reasoning only, Gemini CLI accepts neither, Anthropic requires an output limit and OpenAI forwards reasoning effort.
- Rename sandbox factories to `*SandboxProvider`, configuration to `sandboxProvider` and the CLI option to `--sandbox-provider`. Legacy resource records are reported as incompatible and are not deleted.
- Replace the experimental direct text client with `openaiModelProvider` and add `anthropicModelProvider`.

Experimental built-in harness engine:

- `harness({ modelProvider, instructions, tools, hooks, permissions, context, conversations, skills, limits, toolExecution, cache })` lets Outpost drive a model itself. The engine runs tools through the borrowed sandbox with input validation, read-only concurrency, per-call deadlines and ordered results, returns tool errors to the model and fails with the new `limit` error code on step, tool-call, token or output limits.
- Model providers exchange messages, tool calls, opaque reasoning replayed only to their provider identity and model, a normalized `stopReason`, system-prefix and history caching, and optional streaming through `stream()`, with `timeoutMs` measuring inactivity between chunks. Truncated or refused answers are reported instead of rejected.
- Add `defineHarnessTool()` (JSON Schema subset or Standard Schema inputs), `defineHarnessToolset()` and `defineHarnessInstructions()`.
- Add `defineHarnessHook()` for `session-start`, `before-model`, `after-model`, `before-tool`, `after-tool` and `stop`, and `defineHarnessPermissions()` for ordered allow/deny rules over tool names, commands and repository paths declared by a tool's `resources()`. Hook exceptions fail the turn.
- Add built-in toolsets: `harnessFileTools()`, `harnessEditTools()` with conflict-checked exact replacement, `harnessSearchTools()`, `harnessGitTools()` and `harnessShellTools()`.
- Record custom harness turns as append-only transcripts in `.outpost/conversations/harness/`, excluded from Git, with `harnessConversations()` by default or `transportConversations("harness", …)`. Custom harnesses support continuation, fork and response repairs. Add `defineHarnessContextStrategy()`, `truncateToolResults()` and `summarizeHistory()`.
- Add `defineHarnessSkill()` for instructions and tools loaded on demand through a reserved `load_skill` tool.
- Dispatch observers receive `step`, `tool-result`, `tool-denied`, `stop-prevented`, `compaction` and `text-delta` events; journals keep `text-delta` only in verbose mode.
- These APIs are tested with scripted providers, local simulated HTTP services and the local sandbox provider; no authenticated service campaign is implied.

Other changes:

- Add `workflow.start({ telemetry })` with an SDK-independent `WorkflowTelemetry` contract, independent custom observers and isolated callback errors. Preserve `observe: telemetry.observe` compatibility.
- Instrument complete dispatch operations with optional OpenTelemetry telemetry and add `createReporter()` with typed asynchronous handlers and explicit `flush()`.
- Share explicit CLI authentication preparation between library harnesses and generated workflows. Update package checks, examples and the English/French reference.

## 4.2.0

- Add experimental `openaiCompatible()` and typed model-provider contracts for direct, non-streaming Chat Completions or Responses calls without Codex. Bound requests and response sizes, support cancellation and optional reported usage, and reject incomplete or unsupported outputs. Tool execution and the agent harness remain planned for phase two; live service compatibility is unvalidated.
- Add a bilingual Model providers reference family with experimental icons and generated warning banners explaining the limitations. Add the same warning treatment to Firecracker and FirecrackerOptions.
- Add local/S3 object transports for artifacts, exclusively owned checkpoints, segmented journals, native conversation snapshots, verified recovery archives, shared storage reservations, resource activity and remote inventory/retention/quota operations. Preserve existing directory stores and local execution paths; AWS SDK loading remains optional. Remote ownership recovery is explicit and authenticated live storage campaigns remain outstanding.
- Add the optional `@elie-laloum/outpost/queues/bullmq` adapter for standalone Redis and BullMQ 5, preserving queue identity, lossless JSON results, fenced leases, cancellation and deadlines. Include asynchronous connection cleanup, real Redis integration tests and bilingual reference and operational guidance.

- Rebuild the bilingual documentation with separate Guide and Reference navigation, family overviews, contextual API descriptions, preserved symbol URLs and redirects for moved guides. Add complete runnable preparations and a schema-validation guide covering Zod, Valibot and JSON Schema.
- Group reference families under five fixed sections with short English labels in both locales, localized overview links with house icons, and keyboard-accessible desktop/mobile navigation. Group egress policies with sandbox providers.
- Avoid recreating filesystem roots when initializing local transports on Windows, and accept native short/case aliases during inspection without allowing symlink traversal. Preserve child transcripts when capturing Windows conversations, verify relocated paths as decoded JSON, and build the library before running documented Docker/Podman examples in CI.

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
