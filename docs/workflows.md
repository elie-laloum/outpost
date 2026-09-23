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

## Starter templates

| Template      | Structure                                                             |
| ------------- | --------------------------------------------------------------------- |
| `blank`       | One dispatch and a configurable objective.                            |
| `iterate`     | Completion-driven loop with a finite pass budget.                     |
| `review`      | Implementation followed by review in a warm sandbox.                  |
| `plan`        | Three independent planning perspectives, then an implementation task. |
| `plan-review` | Parallel planning, implementation, then review.                       |

Scaffold tracker connectors with `--tracker github`, `beads`, or `custom`. GitHub requires authenticated `gh`, Beads requires `bd`, and the custom connector reads `OUTPOST_TRACKER_URL`. The starter uses returned issues as its objective unless you supply a command-line objective. Issue mutation remains explicit in your workflow. Custom connectors include `.outpost/TRACKER.md` setup instructions. `--label NAME` can create/update the GitHub label during initialization.
