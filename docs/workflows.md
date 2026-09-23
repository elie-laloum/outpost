# Workflows

Tasks form a directed acyclic graph. Each task declares its dependencies with `after`, and can only read successful values from those dependencies. Declaration order does not affect scheduling. A workflow validates duplicate keys, missing dependencies and cycles before any task runs.

```ts
import { task, workflow } from "@elie-laloum/outpost";

const analyze = task({
  key: "analyze",
  perform: async () => ({ needed: true }),
});
const change = task({
  key: "change",
  after: [analyze],
  condition: (context) => context.value(analyze).needed,
  timeoutMs: 300_000,
  retry: {
    attempts: 3,
    delayMs: 500,
    accepts: (error) => error instanceof Error,
  },
  perform: async (context) => {
    context.signal.throwIfAborted();
    return "changed";
  },
});

const delivery = workflow("delivery", [analyze, change]);
console.log(delivery.diagram());
const result = await delivery.start({ concurrency: 2, stopOnError: true });
result.unwrap();
console.log(result.value(change));
```

`TaskContext` includes `signal`, one-based `attempt`, `executionId`, and typed `value(task)`. A condition runs before the first attempt. False conditions skip the task and its descendants. Retries occur only on failure, within the declared attempt budget, and can be filtered with `accepts`. Delays respect cancellation.

Task deadlines are **cooperative**: task code must honor `context.signal`. The scheduler waits for active work to clean up, preventing abandoned work from mutating resources after a workflow returns. Sandbox operations honor the signal. Arbitrary callbacks that ignore it cannot be forcibly stopped by JavaScript.

`stopOnError` defaults to true and aborts active siblings after the first failure. Set false to let independent branches finish. Failed/skipped dependencies skip descendants. External cancellation returns a cancelled workflow. Observers receive start/task/retry/finish events and cannot change outcomes; their exceptions are collected in `observerErrors`.

`WorkflowResult` contains immutable task records, errors, observer errors, status, execution ID, typed value access and `unwrap()`. `unwrap` throws `WorkflowFailure` for failed/cancelled results. The error retains the full result.

## Sandbox tasks

- `agentTask({ key, sandbox, request })` dispatches through an existing sandbox. `request(context)` produces the prompt/options.
- `commandTask({ key, sandbox, command })` executes a command and fails the task on nonzero status. The command may be a function of context.
- `isolatedTask({ key, request })` owns a one-shot sandbox/workspace for that task. `request(context)` supplies the complete dispatch configuration.

Use dependencies to serialize tasks sharing a sandbox. Use `isolatedTask` with distinct named workspaces for fanout. Parallel temporary integration branches serialize their host merge stage, but semantically conflicting changes still require human resolution.

## Issue campaigns

`campaign` is the application-level orchestration service for issue delivery. A `Backlog` supplies `list(signal)`, `get(id, signal)` and `close(id, signal)`. Each issue has an id, title, optional body and optional `blockedBy` ids. Blocked issues are excluded while their dependencies remain open.

```ts
import { campaign, codex, claude, githubBacklog } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const result = await campaign({
  agent: codex(),
  planner: claude(),
  reviewer: codex(),
  merger: codex(),
  provider: docker(),
  backlog: githubBacklog({ label: "outpost-ready" }),
  cycles: 10,
  concurrency: 3,
  implementationPasses: 100,
  reviewPasses: 1,
  standards:
    "Follow repository conventions, test behavior and keep comments brief.",
  observe: (event) => console.log(event.phase, event.cycle, event.issue),
});
console.log(result.reason, result.issues);
```

Each cycle refreshes the backlog. The planner returns validated assignments with unique issue ids and new branch names. Unknown issues, invalid branches and duplicate assignments fail before implementation. `planner: false` takes ready issues in order, up to the concurrency limit.

Each issue owns a named workspace and one sandbox. Implementation and optional review share that sandbox; review inspects the full diff against the cycle's base commit. An implementation without commits skips review and closure. A failed issue is recorded while independent issues finish. `reviewer: false` disables review.

Completed branches enter a separate integration sandbox, even when only one branch completed. The merger resolves conflicts, validates the result and commits corrections. Outpost verifies that the original issue commits are ancestors of the integrated result and rejects uncommitted leftovers. Only after integration into the host branch does it close the issues. Merge failure retains the workspace; tracker closure failure is reported after integration and requires reconciliation before rerunning.

The campaign stops on an empty or blocked backlog, no progress, cancellation, or the cycle limit. The result distinguishes `empty`, `blocked`, `no-progress` and `limit`, and records each issue as `empty`, `failed` or `merged`. Positive integer limits are validated before work starts.

## Starter templates

| Template      | Structure                                                                          |
| ------------- | ---------------------------------------------------------------------------------- |
| `blank`       | One dispatch with a configurable objective.                                        |
| `iterate`     | Sequential campaign; reloads the tracker each cycle.                               |
| `review`      | Sequential implementation and conditional warm review per issue.                   |
| `plan`        | Typed plan, separate issue branches, bounded concurrent execution and integration. |
| `plan-review` | Planned parallel execution with a warm review for each changed issue.              |

Without a tracker, a campaign starter wraps the command-line objective as one in-memory issue. With `--tracker github`, `beads` or `custom`, the tracker supplies the workload. Limits and role adapters are editable at the top level of the generated call; standards live in `.outpost/STANDARDS.md`.

GitHub uses authenticated host `gh`, paginates all issue pages, excludes pull requests and applies the configured label. `--label NAME` creates/updates the label and configures filtering. Declare `GH_TOKEN` in `.outpost/.env` or authenticate `gh` directly. The connector follows the official [GitHub CLI pagination contract](https://cli.github.com/manual/gh_api).

Beads uses host `bd ready --json --limit 0`, `bd show` and `bd close`. Install and initialize [Beads](https://github.com/gastownhall/beads) on the host before running. Selecting Beads also installs its pinned CLI in the generated container image.

The custom starter implements three HTTP operations: GET `issues?state=open`, GET `issues/:id`, POST `issues/:id/close`. Set `OUTPOST_TRACKER_URL` on the host and adapt authentication/pagination in `tickets.ts` or `tickets.mts`. `.outpost/TRACKER.md` documents the contract. Keep tracker mutation in the host connector so agents do not close issues before integration.
