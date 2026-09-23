# API reference

## Domain and ownership

`Workspace` owns a Git checkout and its lock. `Sandbox` owns a running environment attached to exactly one workspace. `dispatch` is one agent job, potentially containing several turns. `Task<T>` is one typed workflow node. A native conversation belongs to an agent and can outlive both workspace and sandbox.

| Entry point              | Lifetime                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `dispatch(options)`      | Creates and closes its own sandbox; closes its workspace unless supplied.              |
| `attach(options)`        | Opens a terminal session, synchronizes changes and closes owned resources.             |
| `createSandbox(options)` | Returns a warm handle with `dispatch`, `resume`, `fork`, `attach`, `command`, `close`. |
| `openWorkspace(options)` | Returns a workspace with `dispatch`, `sandbox`, `attach`, `integrate`, `close`.        |

Sandbox and workspace handles implement `Symbol.asyncDispose` for `await using`. Explicit `close()` is supported and idempotent. Close the sandbox before closing a separately owned workspace. A warm sandbox rejects overlapping operations. Separate workspaces hold separate locks; automatic merges hold a host-branch merge lock.

## WorkspaceOptions

| Field              | Type / default                        | Meaning                                                    |
| ------------------ | ------------------------------------- | ---------------------------------------------------------- |
| `repository`       | `string`, current directory           | Repository root or a directory inside it.                  |
| `branch`           | `BranchPolicy`, `{ mode: "current" }` | Checkout, named worktree, or temporary integration branch. |
| `copies`           | `readonly string[]`                   | Repository-relative inputs copied before workspace hooks.  |
| `limits.copyMs`    | `number`, 60000                       | Copy deadline.                                             |
| `limits.gitMs`     | `number`, 30000                       | Git setup operation deadline.                              |
| `limits.collectMs` | `number`, 30000                       | Commit collection deadline.                                |
| `limits.mergeMs`   | `number`, 30000                       | Host merge deadline.                                       |

Branch variants:

```ts
type BranchPolicy =
  | { mode: "current" }
  | { mode: "named"; name: string; from?: string }
  | { mode: "integrate"; from?: string };
```

`from` accepts a Git commit-ish and is resolved before branch creation. An existing named branch is reused. Managed worktrees live under `.outpost/workspaces`. A branch checked out outside its managed location is not moved. Integration requires an attached host branch and never switches the host checkout. Dirty worktrees survive close; `close({ preserve: true })` also retains clean ones. Inspect the returned `retainedDirectory`.

## SandboxOptions

Includes `WorkspaceOptions`, plus:

| Field              | Meaning                                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent`            | Default `AgentAdapter` for warm operations; optional on `createSandbox`, required on one-shot `dispatch`/`attach`. Use `codex()` or `claude()`. |
| `provider`         | `SandboxProvider`; defaults to `docker()`.                                                                                                      |
| `workspace`        | Existing workspace. Cannot be combined with `repository`, `branch` or `copies`.                                                                 |
| `hooks`            | `workspaceReady`, `hostReady`, `sandboxReady` command arrays.                                                                                   |
| `signal`           | Cancels provisioning. In one-shot calls, also cancels execution.                                                                                |
| `logging`          | `false`, `"stdout"`, or `{ file?, verbose? }`; default generated JSONL file.                                                                    |
| `bootstrap`        | Remote agent installation when absent; defaults to `true`.                                                                                      |
| `conversationHome` | Host directory containing `.claude`/`.codex`; defaults to OS home.                                                                              |

Hook order is copies → `workspaceReady` on host → provider acquisition/synchronization → concurrent `hostReady` and `sandboxReady`. Each group runs its commands sequentially. Commands may choose a directory, environment and timeout. Sandbox commands can request `elevated: true` on providers supporting elevation. Host execution does not elevate privileges.

## DispatchOptions

| Field          | Default / meaning                                                                             |
| -------------- | --------------------------------------------------------------------------------------------- |
| `brief`        | Required `{ text }` or `{ file, values? }`.                                                   |
| `agent`        | Overrides the warm sandbox's default adapter for this job, including its model and variables. |
| `logging`      | Overrides the sandbox's logging policy for this job.                                          |
| `label`        | Optional label included in journal records and generated log filenames.                       |
| `passes`       | Positive integer, default 1. Maximum agent turns when no response validator is supplied.      |
| `until`        | String or strings; default `<outpost>done</outpost>`. Empty array disables markers.           |
| `idleMs`       | 600000; maximum silence before completion. Any output refreshes it.                           |
| `settleMs`     | 60000; grace period after completion, refreshed by output.                                    |
| `deadlineMs`   | 3600000; hard deadline for each agent command.                                                |
| `expansionMs`  | 30000; deadline for each embedded prompt command.                                             |
| `signal`       | Cancels this operation, preserving a warm sandbox.                                            |
| `continuation` | `{ id, fork? }`; native resume or conversation fork.                                          |
| `response`     | A `ResponseSpec<T>` produced by `response.text/json`.                                         |
| `observe`      | Receives normalized events; exceptions cannot fail the job.                                   |
| `warn`         | Receives nonfatal warnings; exceptions cannot fail the job.                                   |

Resume and structured output require `passes: 1`. A one-shot continuation validates the host transcript before allocating an environment. Warm continuations reuse sessions already present, otherwise importing the host transcript.

`DispatchResult<T>` contains `text`, `value`, `turns`, `usage`, `completed`, optional `completion`, `conversation`, `transcript`, `log`, `branch`, `directory`, `commits`, optional `retainedDirectory`, and `resume`/`fork` methods. `value` is inferred from the response validator. Without a validator it is `undefined`. Usage contains raw `input`, `cached` and `output` token counts. Costs are not estimated.

Each turn contains `text`, `status`, `durationMs`, `usage`, and optional `conversation`. Commits contain their original `oid` and `subject`. A budget exhausted without a completion marker returns `completed: false`; process failures throw.

## Agent settings

```ts
codex({
  model: "your-model",
  reasoning: "high",
  approvalReviewer: "auto_review",
  saveConversations: true,
  variables: {},
});

claude({
  model: "sonnet",
  reasoning: "high",
  permissions: "acceptEdits",
  saveConversations: true,
  variables: {},
});
```

Model is optional; the installed CLI chooses its default. Codex reasoning accepts `low`, `medium`, `high`, `xhigh`. Claude also accepts `max`. Actual model support is determined by the CLI/provider. Claude permission modes are `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`.

Noninteractive defaults avoid permission prompts because the outer sandbox is responsible for isolation. Codex can instead use the auto-review approval reviewer. Interactive commands use native terminal behavior and native session resume/fork commands.

Events are a discriminated union with `kind`: `prompt`, `text`, `tool`, `conversation`, `usage`, `failure`, `finished`, `raw`. Protocol noise is retained as `raw`. Adapters implement `request(input): Command` and `events(line): AgentEvent[]`; a custom adapter can omit native conversation support.

## Command and attachment

```ts
const result = await sandbox.command({
  executable: "npm",
  arguments: ["test"],
  directory: "/workspace",
  variables: { CI: "true" },
  deadlineMs: 120_000,
  retain: 65_536,
  observe(channel, text) {
    process.stdout.write(text);
  },
});
```

Arguments are passed directly, without implicit shell expansion. For shell syntax, explicitly invoke `sh -c` (inside Linux sandboxes) or the host shell. Default directory is the sandbox workspace. `stdin` supplies a string. `interactive` inherits terminal input/output. `retain` bounds the captured tail of each stream; observers receive all output. `CommandResult` contains `status`, `stdout`, `stderr`.

`attach({ agent?, brief?, continuation?, signal? })` uses the adapter's terminal mode. Docker, Podman and host support it. Remote cloud adapters reject it explicitly. Both warm and one-shot results include commits, branch and workspace directory. The top-level result additionally returns disposal information.

## Errors and recovery

`OutpostError` has a machine-readable `code`, frozen `details`, and optional `cause`. Codes: `configuration`, `process`, `timeout`, `aborted`, `workspace`, `conflict`, `prompt`, `response`, `session`, `provider`. Multiple failures can surface as `AggregateError` without losing the original causes.

`ResponseError` adds `tag`, optional `raw` and `recovery`. Recovery records include the conversation and workspace; after collection they also include commits, transcript and log. Native main-transcript capture failure fails the dispatch. Child transcript capture errors only warn.

Remote recovery directories contain Git bundles, binary patches and copied untracked files. A failed synchronization reports its recovery path. Do not delete it before inspecting the failure. See [Operations](operations.md).
