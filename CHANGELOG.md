# Changelog

## 9.0.0

This major release renames public factories and declarations and removes the previous names, changes conversation and reporter contracts, and extends public event, fault and stop-reason unions. Replace previous names with their `create*`/`define*` equivalents, pass a store instead of a format name to `createTransportConversations()`, use each agent's native store instead of the format-keyed `conversations` helpers, and update exhaustive handling of `AgentEvent` (`fallback`, `steer`), `FaultCode` (`steering`) and stop reasons (`steered`). Firecracker is no longer experimental; speculation remains experimental. Live validation campaigns listed in the roadmap remain outstanding.

- Promote the Firecracker provider out of experimental: `createFirecrackerSandboxProvider()` and `FirecrackerOptions` no longer carry the experimental warning and icon. Host preparation, networking and the root supervisor of the jailer mode remain the operator's responsibility; control-plane resource accounting and adversarial validation remain open.
- Redraw the documentation navigation bar on the page grid: the logo cell lines up with the sidebar, search fills the centre, GitLab, the GitHub mirror and npm are linked beside the current version, and a single link switches between English and French. Narrow screens move the source links into the sidebar and menu footer.
- Give each built-in CLI agent its own `src/adapters/agents/<agent>/` folder and a descriptor in one agent catalog: its label, executable, pinned version, harness export, installer, image environment, doctor diagnostics, protocol fixtures and `outpost init` authentication choices. `agentVersions`, `DoctorAgent`, remote bootstrap, `outpost doctor`, the `outpost init` prompts and validation, the generated `run.ts`, the image recipe and the agent image lock check now derive from it, and a test checks every descriptor against the public exports and the image lock. Generated projects, images and bootstrap commands are unchanged. `agentVersions` entries are now typed as `string`, and Antigravity model errors use the `Antigravity` label.
- Open native conversation formats to any CLI harness. `createTranscriptConversations(layout)` builds a native store for CLIs that keep one JSONL transcript per conversation, and `createSessionBundleConversations(profile)` for CLIs that keep each session as a directory, with self-contained `validate`, `bucket` and `relocate` hooks that run inside the sandbox. `createClaudeConversations()`, `createCodexConversations()`, `createCopilotConversations()` and `createKimiConversations()` return the built-in stores, which implement the new `NativeConversationStore` contract with `directory()` and `destination()`. Built-in presets now set `storage` to their native store by default, and `AgentAdapter.conversations` is removed. Breaking: `createTransportConversations()` takes a base store instead of a format name, and the format-keyed helpers `conversations.native`, `locate`, `capture`, `restore`, `directory`, `destination` and `claudePath` are removed; use each agent's native store. `ConversationFormat` is now `string` and `StoredConversationFormat` is removed. Persisted format names, transport keys and bundle contents are unchanged.
- Rebuild the documentation layout: Guide, Reference and Project pages share one header, a sidebar for the current space and breadcrumbs, and every section places its code, contract or entries beside its prose. Reference pages list parameters and properties as rows beside a pinned signature, `/reference/` becomes a map of sections and families instead of redirecting to the first symbol, and the changelog and roadmap keep each heading beside its entries.
- Replace the documentation home with a landing page in English and French: the tagline with the install command and Get started, a code window with `run.ts`, `brief.md` and an example workflow, the agents and sandboxes with their conversation support, and a workflow walkthrough that highlights the code of each step. Its snippets are typechecked with the guide examples, and the documentation brand now shows the Outpost logo and links to this page.
- Name constructors `create*` and declarations `define*`. Functions that build runtime objects become `createAgent`, `createFallbackAgent`, `createReplayAgent`, `createHarness`, `createClaudeHarness`, `createCodexHarness`, `createAntigravityHarness`, `createCopilotHarness`, `createKimiHarness`, `createHarnessFileTools`, `createHarnessEditTools`, `createHarnessSearchTools`, `createHarnessGitTools`, `createHarnessShellTools`, `createDockerSandboxProvider`, `createPodmanSandboxProvider`, `createLocalSandboxProvider`, `createVercelSandboxProvider`, `createDaytonaSandboxProvider`, `createFirecrackerSandboxProvider`, `createMountedSandboxProvider`, `createRemoteSandboxProvider`, `createLocalTransport`, `createS3Transport`, `createArtifactStore`, `createWorkflowCheckpointStore`, `createTaskCacheStore`, `createTransportConversations`, `createHarnessConversations`, `createSqliteTaskQueue`, `createHttpTaskQueue`, `createBullMQTaskQueue`, `createOpenAIModelProvider`, `createAnthropicModelProvider`, `createEd25519DecisionVerifier` and `createOpenTelemetryObserver`. Workflow declarations become `defineWorkflow`, `defineTask`, `defineAgentTask`, `defineIsolatedTask`, `defineCommandTask`, `defineApprovalTask`, `definePauseTask`, `defineArtifactTask`, `defineQueuedTask`, `defineInteractiveAgentTask` and `defineLoopTask`; `response.text`/`response.json` become `defineTextResponse`/`defineJsonResponse`, and `artifact.json`/`artifact.binary` become `defineJsonArtifact`/`defineBinaryArtifact`. Breaking: the previous names, including the provider, OpenTelemetry, S3 and BullMQ subpath names and the `response` and `artifact` objects, are no longer exported; old reference URLs redirect to the new pages. Breaking: `createReporter()` now creates the terminal reporter formerly named `reporter()`, and the handler-based reporter becomes `createCustomReporter(handlers, options)`. Generated starters use the new names.
- Add triggers that start workflows through a queue. `createCronSchedule()` evaluates five-field cron expressions and macros in an IANA time zone, skipping times removed by daylight saving and firing repeated ones once; `runSchedules()` publishes one job per slot, keyed `schedule:<name>:<slot>` so replicas and restarts converge, and catches up only the latest slot within `maxLateMs`. `serveTriggers()` receives webhooks verified by `createGithubWebhook()`, `createGitlabWebhook()` (signing token, or an opt-in plain-text token), `createSlackSource()` (slash commands and interactions) and `createStandardWebhook()`, with rotating secrets and body limits, and publishes the job chosen by each route as `trigger:<path>:<delivery>`, so redeliveries add nothing. `labelAdded()` and `commandIssued()` read common payloads. `defineWorkflowJob()` runs each job's workflow under its `runId` checkpoint, with a version that includes an input digest, and reports status, pending gates and that version. Outpost does not call GitHub, GitLab or Slack APIs, gate approvals from these services are not provided, and tests use locally computed signatures.
- Add `createFallbackAgent([...agents], { on })`: an ordered list of agents or models that hands a dispatch to the next candidate when the current one fails with a listed `quota` or `unavailable` fault. Candidates run in the same sandbox and workspace from the original brief, are prepared only when tried, and keep captured conversations; `DispatchResult.fallback` and the new `fallback` agent event record the handover, and usage includes failed candidates. Continuations and `attach()` require a single agent. When every candidate hits a limit, the quota error reports the earliest reset known for all of them, `onQuota` pauses the task and the resumed attempt reruns the brief from the first candidate. `DispatchOptions.agent`, `SandboxOptions.agent` and `SpeculativeCandidate.agent` accept the new `DispatchAgent` union and `AgentEvent` gains `fallback`; update exhaustive consumers.
- Replay fallback handovers: a recorded turn followed by a `fallback` event is parsed as handed over, exposed through `ReplayTurn.handover` with its recorded usage, and `createReplayAgent` continues with the next candidate's turn in the same call. The replayed result reproduces the selected text, all commits and the combined usage, without `result.fallback`.
- Add `unavailableFault()` and `AgentAdapter.unavailable`. Terminal overloads, 5xx responses and connection failures from Claude Code, Codex, Copilot, Kimi and Antigravity, HTTP 408/5xx/529 and transport failures from model providers, and overloaded or server stream errors now set `details.unavailable` while keeping their `process` or `provider` code. Retry notices are ignored and quota classification keeps precedence. Classification relies on recorded protocol formats, not live outage campaigns.
- Add `createSteering()` and `DispatchOptions.steering` to send instructions to an agent while its dispatch runs. `send()` resolves with `{ mode }` once the agent receives the text. The built-in harness adds it to the next model request, or to the active built-in subagent; `send(text, { subagent })` addresses a subagent run id from its `subagent` event, or the main loop with `null`. Claude Code reads it from `--input-format stream-json` stdin. Codex runs as `codex app-server` for steered dispatches and receives it with `turn/steer`. Copilot, Kimi and Antigravity are stopped once their conversation is known and resumed with the instruction. Instructions sent after the agent answered resume the conversation in a new turn; undeliverable ones reject with the new `steering` fault code. Every built-in provider accepts live command input: local, Docker and Podman pipe stdin, Firecracker forwards it through SSH, and Vercel and Daytona feed framed chunks appended to a sandbox file. Replays reproduce steered runs turn by turn through `ReplayAgent.pendingSteering()` and `ReplayTurn.resumedBy`/`interrupted`. New `steer` agent event, `stopped` reason `steered`, `Turn.interrupted`, `AgentAdapter.liveInput` with `AgentLiveSession`, `AgentInput.liveInput`, `Command.input` and `SandboxLease.liveInput`. Update exhaustive handling of `AgentEvent`, `FaultCode` and stop reasons. Claude injection was checked live on the host, Daytona and Vercel; the Codex app-server handshake and failure handling were checked against Codex 0.155 without a live `turn/steer` run; Copilot, Kimi and Antigravity interruption is covered by simulated CLIs and a real Docker sandbox.
- Add `conversations` to `createClaudeHarness()`, `createCodexHarness()`, `createCopilotHarness()` and `createKimiHarness()` to capture, resume and fork sessions through any `ConversationStore`, such as `createTransportConversations()`, without the repository's local `.outpost` captures. `ConversationStore` gains an optional `format`, declared by the built-in stores: presets and `createHarness()` reject a store whose format differs from their own when they are created, and Claude and Codex reject `conversations` with `saveConversations: false`. `createAntigravityHarness()` rejects the option. Archived conversations are neither encrypted nor authenticated; live Kimi and Copilot runs through a Transport store were not performed.
- Fix sporadic `Inspection file changed` failures when the local transport read an object that a concurrent writer replaced, for example while parallel tasks listed resource activity. On Windows, a write that replaces an object a concurrent reader holds open now retries briefly instead of failing with `EPERM`, and a lock released by another writer no longer fails with `EPERM` while Windows finishes deleting its file.
- Add MCP servers with `mcpServers` on every CLI harness and on `createHarness()`. A server is a stdio `command` or a Streamable HTTP `url`; secrets are passed by name through `variables` or `bearerTokenVariable` and never written into arguments or files, and a missing declared variable fails before the agent starts. Claude Code, Codex and Copilot receive the servers as per-run arguments; Kimi and Antigravity merge them into their home configuration file, keeping other entries, including your own home with the local provider. The built-in harness starts the servers inside the sandbox for each turn, through a Node.js launcher and an in-sandbox HTTP bridge, and exposes their tools as `mcp__<server>__<tool>`; it requires a lease with `SandboxLease.liveInput`, which every built-in provider sets. `AgentAdapter.configuration` plans CLI configuration files, and Codex MCP tool events now use server-qualified names. The CLIs' use of the generated configuration has only been checked live for Copilot stdio servers.
- Extend MCP servers. `tools: { include, exclude }` filters a server's tools and `startupTimeoutMs` bounds its startup, using each CLI's native setting; an option a CLI cannot apply fails when the agent is composed. `oauth: "login"` copies the MCP OAuth login that Claude Code, Codex or Kimi stored on the host into the sandbox home, and `oauth: { clientIdVariable, clientSecretVariable, scopes }` lets the built-in harness request OAuth client credentials tokens from inside the sandbox. The built-in harness adds `mcp_list_resources`, `mcp_read_resource`, `mcp_list_prompts` and `mcp_get_prompt` for servers that offer resources or prompts, and `defineMcpPrompt()` renders a server prompt into the instructions; response repairs now start MCP servers too. `AgentConfiguration` gains `host` files, `ConfigurationFile.section` becomes optional and `HarnessInstructionContext` gains `mcp`. OAuth copies and client credentials were tested against local fixtures only.

## 8.0.0

This major release adds required workflow result fields, extends public status, event, fault and speculation unions, and reclassifies model-provider rate limits. Result producers and test doubles must provide `WorkflowResult.inputRequests`; update exhaustive handling of `TaskStatus`, `WorkflowResult.status`, `WorkflowEvent.type`, `FaultCode`, `ObservationEvent`, `Agent`, `StorageCategoryName` and speculation statuses, and handlers that matched `provider` for HTTP 429. Existing entry points remain available. Live limit campaigns and authenticated model campaigns for these additions remain outstanding.

- Add opt-in task result caching with `task({ cache: { store, version, key, maxAgeMs, mode } })`, `taskCacheStore({ transporter })` and `repositoryFingerprint()`. A hit restores the stored lossless JSON result without an attempt, usage or replayed side effects; `loopTask` accepts `cache`, while gates, interactions, `agentTask` and `isolatedTask` reject it. Store errors and invalid entries degrade to a miss without changing the task outcome. `TaskRecord` gains `cacheHit`, `WorkflowEvent` gains the `cache` type with `cache` and `error`, `StorageCategoryName` gains `task-cache` and retention policies accept the `task-cache` scope; update exhaustive consumers. Entries are not authenticated.
- Add opt-in quota pauses with `workflow.start({ onQuota: { action: "pause", maxWaitMs } })`. A quota error pauses the task durably instead of retrying or failing it; a known reset within `maxWaitMs` is awaited in process, otherwise a later start with the same checkpoint resumes it. `TaskRecord` gains `quota` and `WorkflowEvent` gains the `quota` type and `resetAt`; update exhaustive consumers. Human-readable reset times are not parsed, and reruns start a new agent dispatch.
- Continue the conversation interrupted by a quota pause: `TaskContext.quota` exposes the captured conversation and retained branch to the first attempt after the pause. `agentTask` and `isolatedTask` resume it with a short instruction unless `quotaResume: "restart"`, integrated isolated workspaces start from the interrupted branch, and interactive tasks continue the interrupted turn. Agents without resume or capture start a new conversation.
- Carry quota failures across queues: `QueueResult.quota` reports the handler's limit and `queuedTask` rejects with code `quota`. The first attempt after a pause publishes a new job, `<key>:quota:<attempt>`, and `QueueRequest.idempotencyKey` keeps the handler's effect key stable.
- Report candidates stopped by a limit with speculation status `quota` and `SpeculationResult.quota`; `SpeculativeCandidateResult.status` and `SpeculationResult.status` gain `quota`, so update exhaustive consumers. A durable race finished on quota reruns only those candidates as new attempts from the baseline, without continuing their conversation.
- Add the `quota` fault code, the `quota` agent event, `AgentAdapter.quota` and `quotaFault()`. Claude Code, Codex, Copilot, Kimi and Antigravity limit signals reclassify failed turns from `process` to `quota`, with the reset time when Claude reports it. HTTP 429 and quota stream errors from OpenAI and Anthropic model providers now use code `quota` instead of `provider`, keep `retryAfterMs` and add `resetAt`; update handlers that matched `provider` for rate limits. Classification is based on recorded protocol formats, not live limit campaigns.
- Add `replayAgent()` to replay a dispatch journal without calling a model: it re-emits the recorded events and usage turn by turn, rebuilds the recorded commits inside the sandbox with their original identities, rethrows recorded turn failures and reports prompt, baseline, tree, exhausted and unrecorded differences through `ReplayDivergence` (or warnings with `divergence: "warn"`). `logging.replayable` records each sandbox dispatch's linear commits as verified binary patches; journals then contain repository content. `Agent` gains the `ReplayAgent` variant, `FaultCode` gains `replay`, `ObservationEvent` gains `workspace-commits` and `dispatch-finished` gains an optional `error`; update exhaustive consumers.
- Add `interactiveAgentTask()` with durable question/answer turns for the Outpost harness and portable CLI conversations, preserved worktrees, actor validation, cumulative usage and explicit interrupted-turn replay. Antigravity and disabled capture are rejected. Pending questions release the sandbox; in-tool suspension, signed answers and question expiry remain future work.
- Extend `TaskStatus` and `WorkflowResult.status` with `waiting-input`, and `WorkflowEvent.type` with `input-request`/`input-answer`. Result producers must now provide `inputRequests`; consumers with exhaustive status handling must account for these additions.
- Add `loopTask` for bounded attempt/check cycles with feedback, durable phase recovery, cumulative budgets, phase-specific idempotency keys and `LoopTaskExhausted`. `WorkflowEvent.type` gains `loop`; update exhaustive consumers. Callback errors require explicit resume; loop checkpoints require JSON outputs.

## 7.0.0

This major release extends public event and conversation unions and adds required context fields. Update exhaustive handling of `AgentEvent`, `WorkflowEvent.type`, `ModelStreamEvent`, `ConversationFormat` and `StoredConversationFormat`; custom context producers and test doubles must provide `TaskContext.idempotencyKey` and `QueueHandlerContext.idempotencyKey`. Existing entry points remain available. Redis queues now require `maxmemory-policy=noeviction`, and token-only workflow budgets reject incomplete usage. Firecracker and speculation remain experimental; 7.0.0 does not complete every roadmap direction.

- Add opt-in durable speculation through Transport with fenced ownership, explicit crash recovery, cumulative budgets, preserved attempts, bounded cleanup and Git merge preflight. Mounted Docker/Podman support resource reconciliation; unsupported providers reject durable mode. Speculation remains experimental.
- Add confirmed Daytona egress policies with explicit rejection of unsupported rules and account capabilities; snapshot Vercel native firewall configuration against caller mutation. Add opt-in network probes and bilingual capability/ownership documentation. Container allowlists remain unsupported.
- Add opt-in signed approval/pause gates with rotating Ed25519 approver keys, per-request HTTP queue credential rotation and stable task/worker idempotency keys. Document persistent effect deduplication and multi-worker recovery; queues still do not guarantee exactly-once external effects.
- Add opt-in capped exponential task retries and full jitter, preserve HTTP model Retry-After minimum waits, and expose selected retry delays. Add cooperative workflow.start({ timeoutMs }) deadlines renewed on resume, preserving checkpoint compatibility and explicit replay authorization.

- Stabilize the built-in harness and OpenAI/Anthropic model contracts, with authenticated delegation validated for both integrations. Add `defineHarnessSubagent()` with serialized shared-sandbox execution, separate captured histories, inherited permissions, bounded depth and cumulative ancestor token budgets. Count final responses and context summaries toward token ceilings, reject incomplete accounting and correlate child lifecycle/usage events. Add deterministic container CI and an opt-in, budgeted live campaign.
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
