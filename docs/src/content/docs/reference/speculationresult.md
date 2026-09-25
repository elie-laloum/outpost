---
title: "SpeculationResult"
description: "SpeculationResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculationResult**. See the [speculative execution guide](../../guide/advanced/speculation/) for behavior, defaults and examples.

## Import

```ts
import type { SpeculationResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Race bounded candidate branches and select the first one that passes explicit validation and cleanup.

Research prototype: at most eight candidates, default concurrency two. No automatic integration, push or durable race resumption. Observed usage is not a billing cap.

[Complete example and detailed rules](../../guide/advanced/speculation/).

## Parameters and properties

| Name         | Type                                                                                                                                           | Presence | Meaning                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                       | Required | See the linked contract and this family's rules for its interpretation. |
| `baseline`   | `string`                                                                                                                                       | Required | See the linked contract and this family's rules for its interpretation. |
| `host`       | `{ readonly before: SpeculativeHostSnapshot; readonly after?: SpeculativeHostSnapshot; readonly changed: boolean; readonly error?: unknown; }` | Required | See the linked contract and this family's rules for its interpretation. |
| `status`     | `"aborted" \| "winner" \| "no-winner" \| "budget-exhausted"`                                                                                   | Required | Recorded process or lifecycle outcome; inspect its declared type.       |
| `winner`     | `SpeculativeCandidateResult<T> \| undefined`                                                                                                   | Optional | See the linked contract and this family's rules for its interpretation. |
| `candidates` | `readonly SpeculativeCandidateResult<T>[]`                                                                                                     | Required | See the linked contract and this family's rules for its interpretation. |
| `usage`      | `WorkflowUsage`                                                                                                                                | Required | Reported usage counters; not a currency estimate.                       |
| `error`      | `unknown`                                                                                                                                      | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface SpeculationResult<T = undefined> {
  readonly id: string;
  readonly baseline: string;
  readonly host: {
    readonly before: SpeculativeHostSnapshot;
    readonly after?: SpeculativeHostSnapshot;
    readonly changed: boolean;
    readonly error?: unknown;
  };
  readonly status: "winner" | "no-winner" | "aborted" | "budget-exhausted";
  readonly winner?: SpeculativeCandidateResult<T>;
  readonly candidates: readonly SpeculativeCandidateResult<T>[];
  readonly usage: WorkflowUsage;
  readonly error?: unknown;
}
```

## Related contracts

- [SpeculativeCandidateResult](../speculativecandidateresult/)
- [SpeculativeHostSnapshot](../speculativehostsnapshot/)
- [WorkflowUsage](../workflowusage/)
