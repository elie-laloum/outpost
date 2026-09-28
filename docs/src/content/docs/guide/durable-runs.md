---
title: "Durable runs"
description: "Persist workflow progress and authorize replay."
---

A checkpoint stores task records, outputs and cumulative usage under a stable run ID. Successful saved tasks can be restored without executing them again.

```ts
import {
  localTransport,
  task,
  workflow,
  workflowCheckpointStore,
} from "@elie-laloum/outpost";

const store = workflowCheckpointStore({
  transporter: localTransport({ directory: ".outpost/storage" }),
});
const scan = task({ key: "scan", perform: () => ({ files: 12 }) });
const result = await workflow("scan", [scan]).start({
  checkpoint: { store, runId: "scan-2026-09", version: "1" },
});
result.unwrap();
console.log(result.value(scan));
```

<!-- check:run -->

## Resume incomplete work

Use the same workflow definition, run ID and version. Add `resume: "retry-incomplete"` to checkpoint options to authorize replay of unfinished tasks and their side effects. Change `version` when task implementations or inputs change; it is part of checkpoint identity.

Tasks paused by a usage limit resume without this authorization when the run uses [quota pauses](../quota-pauses/).

Outputs must be lossless JSON or `undefined`. Dates, functions, cyclic objects and values that cannot round-trip as JSON must be converted or stored as artifacts. Persist small references for large payloads.

## Recover ownership

Checkpoint ownership does not expire automatically. After a crash, independently stop the old runner, inspect the stored revision, then call `recoverWorkflowCheckpoint({ transporter, runId, revision })`. A changed revision refuses recovery. Clearing ownership preserves progress and does not itself authorize replay.

API: [workflowCheckpointStore](../../reference/function-workflowcheckpointstore/) · [WorkflowCheckpointOptions](../../reference/workflowcheckpointoptions/) · [recoverWorkflowCheckpoint](../../reference/recoverworkflowcheckpoint/).
