---
title: "WorkflowCheckpointValue"
description: "WorkflowCheckpointValue — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowCheckpointValue } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name    | Type                    | Presence          | Meaning                                                                                                                              |
| ------- | ----------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `kind`  | `"undefined" \| "json"` | Required          | undefined when the task returned undefined, json otherwise.                                                                          |
| `value` | `WorkflowJson`          | Variant-dependent | Task output as lossless JSON: plain objects, dense arrays, strings, booleans, null and finite numbers other than -0, with no cycles. |

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
