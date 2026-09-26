---
title: "Error handling"
description: "Distinguish execution failures, command results and workflow status."
---

Dispatch and allocation failures reject their promises. Commands return an exit status. Workflow `start()` returns a structured result; call `unwrap()` when a non-successful run should throw.

```ts
import { OutpostError, recoveryDetails } from "@elie-laloum/outpost";

function reportFailure(error: unknown) {
  if (error instanceof OutpostError) console.error(error.code, error.message);
  console.error(recoveryDetails(error));
}
```

## Common failures

| Symptom                            | Check                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Missing account file               | File credential storage or explicit token on the harness.               |
| Unsupported setting                | The selected harness’s model and authentication forms.                  |
| Engine or executable unavailable   | Image contents and `outpost doctor`.                                    |
| Response parsing fails             | Last complete tag, valid JSON and schema.                               |
| Sandbox already busy               | Await the active operation or allocate another sandbox.                 |
| Synchronization refuses host state | Concurrent edits and retained recovery data.                            |
| Checkpoint owned                   | Stop the old runner, inspect revision and recover ownership explicitly. |

## Retry deliberately

Retry transient failures only when their effects can safely repeat. Preserve recovery paths before reporting an error to another process. A timeout is not evidence that every external effect was rolled back.

Log failure codes and relevant context without dumping credentials or private transcripts. See [Recovering changes](../failure-recovery/) for retained work.

API: [OutpostError](../../reference/outposterror/) · [recoveryDetails](../../reference/recoverydetails/) · [WorkflowResult](../../reference/workflowresult/).
