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

| Name    | Type                    | Presence          | Meaning                                                                    |
| ------- | ----------------------- | ----------------- | -------------------------------------------------------------------------- |
| `kind`  | `"undefined" \| "json"` | Required          | Distinguishes an undefined task output from a lossless JSON value.         |
| `value` | `WorkflowJson`          | Variant-dependent | Lossless JSON representation of a completed task output when kind is json. |

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
