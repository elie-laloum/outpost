---
title: "WorkflowCheckpointValue"
description: "WorkflowCheckpointValue — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowCheckpointValue**. See the [workflow checkpoints guide](../../guide/advanced/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowCheckpointValue } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist lossless task results and explicitly reopen the same graph across process restarts.

Completed outputs are not replayed. Interrupted ordinary tasks require retry-incomplete authorization. Outputs must be lossless JSON; full dispatch results contain functions and cannot be checkpointed directly.

[Complete example and detailed rules](../../guide/advanced/checkpoints/).

## Parameters and properties

| Name   | Type                    | Presence | Meaning                                                                 |
| ------ | ----------------------- | -------- | ----------------------------------------------------------------------- |
| `kind` | `"undefined" \| "json"` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export type WorkflowCheckpointValue =
  | {
      readonly kind: "undefined";
    }
  | {
      readonly kind: "json";
      readonly value: WorkflowJson;
    };
```

## Related contracts

- [WorkflowJson](../workflowjson/)
