---
title: "WorkflowGateOptions"
description: "WorkflowGateOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowGateOptions**. See the [approval and pause gates guide](../../guide/advanced/approvals/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowGateOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist a pending decision and block dependent work until a trusted caller submits it.

Actor names are trusted metadata, not authentication. Paused runs need no timer. Rejection is final for that run. Invalid decision batches fail before applying any decision.

[Complete example and detailed rules](../../guide/advanced/approvals/).

## Parameters and properties

| Name     | Type                                    | Presence | Meaning                                                     |
| -------- | --------------------------------------- | -------- | ----------------------------------------------------------- |
| `key`    | `string`                                | Required | Stable task or cache key within its owning contract.        |
| `after`  | `readonly Task<unknown>[] \| undefined` | Optional | Declared task dependencies whose values may be read.        |
| `prompt` | `string`                                | Required | Human-readable instruction presented at this boundary.      |
| `actors` | `readonly string[]`                     | Required | Trusted actor identifiers, not an authentication mechanism. |

## Signature

```ts
export interface WorkflowGateOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}
```

## Related contracts

- [Task](../task/)
