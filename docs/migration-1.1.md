# Migrating to 1.1

Version 1.1 completes the issue campaign layer and corrects execution contracts. Review these observable changes when upgrading from 1.0.

| Area              | 1.1 behavior                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cold loops        | Each pass acquires a fresh sandbox. Use an explicit `createSandbox()` for warm multi-pass execution.                                             |
| Environment       | Only `.outpost/.env` is loaded. Nonempty file values win; empty declarations inherit the process. Declare every key needed inside a sandbox.     |
| Prompt files      | Relative paths resolve from the caller's working directory, even if `repository` points elsewhere.                                               |
| Hooks             | `workspaceReady` runs at workspace creation. Host hooks are sequential; sandbox hooks run concurrently.                                          |
| Optional inputs   | Missing `copies` entries are skipped. Other copy errors still fail.                                                                              |
| Remote input      | Only commits are seeded by default. `includeUncommitted: true` opts into patch/untracked transfer. Selected `copies` are always explicit inputs. |
| Remote default    | An omitted branch policy creates an integration workspace.                                                                                       |
| Claude usage      | `input` contains uncached input; `cached` and `cacheCreated` remain separate counters.                                                           |
| Observations      | Every public event has `pass` and `at`. Raw lines accompany normalized events. New phase, summary, result and warning events are available.      |
| Journals          | Explicit files append across runs. `logging: "stdout"` renders human-readable progress.                                                          |
| Continuations     | Cold result methods accept branch/provider/hook overrides. Warm result methods retain their existing sandbox and reject sandbox reconfiguration. |
| Structured output | Opening tags and repair capability are checked before provisioning. JSON can use a Markdown code fence inside its tag.                           |

The default completion marker remains `<outpost>done</outpost>`. Native adapters remain Codex and Claude Code.

## Campaigns

Regenerate starters in a new directory or manually adopt `campaign`; `init` never overwrites existing files. Campaigns use `Backlog.list/get/close`, refresh the backlog every cycle and close issues only after their commits reach the host branch. The GitHub connector paginates and applies its configured label. Beads runs on the host and must be installed there; its generated container recipe also includes `bd`.

Set `cycles`, `concurrency`, `implementationPasses` and `reviewPasses` in the starter. `planner: false` takes ready issues in order. `reviewer: false` skips review. Set separate adapters for `planner`, `reviewer` and `merger` to choose different models.

## Recovery and observability

`recoveryDetails(error)` returns available branch, directory, commits, transcript and log information. It preserves cancellation reason identity. A preparation failure removes a clean owned workspace; changed workspaces and failed remote recovery files survive. Successful remote transfer staging is cleaned at close.

`reporter({ label, verbose, quiet, write })` creates a public observation callback. `idleWarningMs` controls periodic inactivity messages; `diagnostic` receives estimated token sizes of prompt command expansions. Estimates are not billing counts.

## Extension ports

Custom agents can provide `storage: ConversationStore`, `resumable`, and `transcriptUsage`. `conversations` exposes native path, search, capture, restore and selective rewrite helpers. Per-turn results expose their own `transcript` path.

Transfers accept optional `{ signal, deadlineMs }`. `limits.copyMs` bounds orchestration transfers. A custom provider must honor cancellation itself to prevent background side effects. `Command.terminal` accepts caller-owned input/output/error streams; `attach.ask` supplies missing file-prompt variables without a TTY.
