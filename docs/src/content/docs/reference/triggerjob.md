---
title: "TriggerJob"
description: "TriggerJob — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerJob } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                        | Presence | Meaning                                                                                                                                              |
| --------- | --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handler` | `string`                    | Required | Registered queue worker handler, usually a defineWorkflowJob().                                                                                      |
| `runId`   | `string`                    | Required | Checkpoint run, 1 to 256 characters and not blank. Jobs with the same runId and input share one checkpoint; a different input makes it incompatible. |
| `input`   | `WorkflowJson \| undefined` | Optional | Lossless JSON input for the workflow; defaults to null.                                                                                              |

## Signature

```ts
export interface TriggerJob {
  /** Registered queue worker handler, usually a `defineWorkflowJob()`. */
  readonly handler: string;
  /** Checkpoint run identifier; events for the same run converge on one checkpoint. */
  readonly runId: string;
  readonly input?: WorkflowJson;
}
```

## Related contracts

- [WorkflowJson](../workflowjson/)
