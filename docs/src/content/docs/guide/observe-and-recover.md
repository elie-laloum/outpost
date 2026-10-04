---
title: "Observe and recover"
description: "See what a run is doing, keep a durable record of it, export traces, replay it without a model, and find the work Outpost kept when it failed."
---

## While it runs, and after

Observation is read-only: a sink that throws never changes a task's outcome. Recovery is the other half, for the runs that stop badly.

<!-- features -->

- [Follow progress](../progress/): Receive the events of one dispatch as they happen.
  - `observe`
  - `createReporter()`
- [Observation hub and OpenTelemetry](../observability/): One stream for a whole run, exported as traces and metrics.
  - `createObservationHub()`
  - OpenTelemetry
- [Journals](../journals/): A durable record of each dispatch, read back after the run.
  - `readJournal()`
  - `logReference`
- [Replay without a model](../record-replay/): Reproduce a recorded run, event by event, with no model call.
  - `createReplayAgent()`
  - replay
- [Recover work](../recovery/): Find, inspect and restore what a failed run left behind.
  - `inspectRecovery()`
  - worktrees
- [Diagnostics](../diagnostics/): Check the host, engine, image and agent CLI before paying for a model call.
  - `doctor`
  - `diagnoseSandbox()`

## Read a run back

Every dispatch writes a journal. `result.logReference` points at the finished one; `readJournal()` returns its events.

```ts
import {
  createLocalTransport,
  dispatch,
  readJournal,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
if (result.logReference) {
  const events = await readJournal({
    transporter,
    reference: result.logReference,
  });
  console.log(events.length);
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
