---
title: "SpeculativeCandidateResult"
description: "SpeculativeCandidateResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculativeCandidateResult**. See the [speculative execution guide](../../guide/advanced/speculation/) for behavior, defaults and examples.

## Import

```ts
import type { SpeculativeCandidateResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Race bounded candidate branches and select the first one that passes explicit validation and cleanup.

Research prototype: at most eight candidates, default concurrency two. No automatic integration, push or durable race resumption. Observed usage is not a billing cap.

[Complete example and detailed rules](../../guide/advanced/speculation/).

## Parameters and properties

| Name                | Type                                                             | Presence | Meaning                                                                        |
| ------------------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `key`               | `string`                                                         | Required | Stable task or cache key within its owning contract.                           |
| `branch`            | `string`                                                         | Required | Git workspace policy or resulting branch identity, according to this contract. |
| `status`            | `"skipped" \| "failed" \| "cancelled" \| "rejected" \| "winner"` | Required | Recorded process or lifecycle outcome; inspect its declared type.              |
| `directory`         | `string \| undefined`                                            | Optional | Filesystem directory used by the owning operation; see path rules.             |
| `retainedDirectory` | `string \| undefined`                                            | Optional | Workspace retained for inspection or recovery.                                 |
| `result`            | `SpeculativeOutput<T> \| undefined`                              | Optional | See the linked contract and this family's rules for its interpretation.        |
| `error`             | `unknown`                                                        | Optional | See the linked contract and this family's rules for its interpretation.        |

## Signature

```ts
export interface SpeculativeCandidateResult<T = undefined> {
  readonly key: string;
  readonly branch: string;
  readonly status: "winner" | "rejected" | "failed" | "cancelled" | "skipped";
  readonly directory?: string;
  readonly retainedDirectory?: string;
  readonly result?: SpeculativeOutput<T>;
  readonly error?: unknown;
}
```

## Related contracts

- [SpeculativeOutput](../speculativeoutput/)
