---
title: "Recover a workflow after a crash"
description: "Release stopped checkpoint ownership before authorizing interrupted work to run again."
---

Start from [Save and resume a workflow](../durable-runs/) and its configuration. Release stopped checkpoint ownership before authorizing interrupted work to run again.

## Recover a run after a crash

While `start()` is running, the process owns the checkpoint. A normal return releases that ownership. If the process dies, the ownership record remains and prevents another run from starting under the same `runId` until you recover it explicitly.

1. Stop the old runner and confirm it has exited. A missing local PID does not prove that a remote runner stopped.
2. Read the checkpoint's current revision, then pass it to `recoverWorkflowCheckpoint()`. Recovery keeps progress and refuses a changed revision.
3. Start the same workflow and checkpoint with `resume: "retry-incomplete"` to explicitly authorize replay of interrupted tasks.

```ts
import { createHash } from "node:crypto";
import {
  createLocalTransport,
  recoverWorkflowCheckpoint,
} from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const runId = "scan-2026-09";
const digest = createHash("sha256").update(runId).digest("hex");
const saved = await transporter.read(`checkpoints/${digest}.json`);
if (saved)
  await recoverWorkflowCheckpoint({
    transporter,
    runId,
    revision: saved.revision,
  });
```

The checkpoint's key is `checkpoints/` followed by the SHA-256 of the `runId`. Progress stays intact; start the run again with `resume: "retry-incomplete"`.
