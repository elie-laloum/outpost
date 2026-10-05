---
title: "Follow a run and inspect failures"
description: "Choose live progress, stored journals or recovery tools for the information you need."
---

## While it runs, and after

Use live events to follow the work, journals to inspect it afterwards and recovery tools when it stops before completion. An observer only reports what happens; an error in its callback does not change the task’s outcome.

<!-- features -->

- [Follow progress](../progress/): Receive the events of one dispatch as they happen.
- [Observation hub and OpenTelemetry](../observability/): One stream for a whole run, exported as traces and metrics.
  - OpenTelemetry
- [Journals](../journals/): A durable record of each dispatch, read back after the run.
- [Replay without a model](../record-replay/): Reproduce a recorded run, event by event, with no model call.
  - replay
- [Recover work](../recovery/): Find, inspect and restore what a failed run left behind.
  - worktrees
- [Diagnostics](../diagnostics/): Check the host, engine, image and agent CLI before paying for a model call.

## Read a run back

Every dispatch writes a journal. `result.logReference` points at the finished one; `readJournal()` returns its events.

<!-- tabs -->

```ts title="record-journal.ts"
import { createLocalTransport, dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const transporter = createLocalTransport({
  directory: ".outpost/storage",
});
export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
```

```ts title="read-journal.ts"
import { reportValue } from "./reporter.ts";
import { result, transporter } from "./record-journal.ts";
import { readJournal } from "@elie-laloum/outpost";

if (result.logReference) {
  const events = await readJournal({
    transporter,
    reference: result.logReference,
  });
  reportValue(events.length);
  // Example output: 12
}
```

Without `logging`, the journal goes to a local transport under `<repository>/.outpost/storage`. Record the run with the replay options and the same journal becomes a deterministic test.

## What Outpost keeps after a failure

| What              | Where                                                | Kept when                                              |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| Worktree          | `.outpost/workspaces/`                               | The run failed, integration conflicted, or it is dirty |
| Remote transfer   | `.outpost/recovery/`                                 | Cloud changes could not be applied to your checkout    |
| Conversation      | `.outpost/conversations/` or the agent's own store   | After each turn and on failure                         |
| Workflow progress | `.outpost/storage/` or your [transport](../storage/) | After each finished task                               |

A retained worktree is an ordinary Git worktree on its branch: open it, commit what you keep, merge the branch.

## Limits

- Sink delivery is bounded and may report loss. It is a stream of observations, not a durable state registry; usage accounting stays independent of it.
- A journal shares the hub's bounded queue. A transport that fails or falls behind can leave events out, and `readJournal()` then returns only what was written before the failure.
- Journals hold prompts, agent messages and tool results, so they contain repository content. Store and share them like the code.
- A replay reproduces a recorded run only. A prompt, baseline or tree that differs throws `ReplayDivergence` instead of inventing events.
- Recovery is explicit. Outpost never discards a dirty or detached worktree as routine cleanup, and a cleanup timeout leaves resources pending.
- Digests and lineage give integrity, not authentication: they prove a file is unchanged, not who produced it.

API: [createObservationHub](../../reference/createobservationhub/) · [ObservationHub](../../reference/observationhub/) · [createOpenTelemetryObserver](../../reference/createopentelemetryobserver/) · [readJournal](../../reference/readjournal/) · [Logging](../../reference/logging/) · [createReplayAgent](../../reference/createreplayagent/) · [recoveryDetails](../../reference/recoverydetails/) · [inspectRecovery](../../reference/inspectrecovery/).
