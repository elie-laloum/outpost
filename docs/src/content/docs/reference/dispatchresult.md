---
title: "DispatchResult"
description: "DispatchResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **DispatchResult**. See the [dispatch guide](../../guide/agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import type { DispatchResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run an agent task and collect text, typed output, commits, usage and native conversation information.

One pass is the default. Process or response failures reject. An exhausted pass budget can instead return completed: false. Cold dispatch closes owned resources; warm dispatch retains its sandbox.

[Complete example and detailed rules](../../guide/agents/dispatch/).

## Parameters and properties

| Name                | Type                                                                             | Presence | Meaning                                                                        |
| ------------------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `branch`            | `string`                                                                         | Required | Git workspace policy or resulting branch identity, according to this contract. |
| `directory`         | `string`                                                                         | Required | Filesystem directory used by the owning operation; see path rules.             |
| `commits`           | `readonly Commit[]`                                                              | Required | Collected Git commit identities and subjects.                                  |
| `transcript`        | `string \| undefined`                                                            | Optional | Available host path to the captured transcript.                                |
| `log`               | `string \| undefined`                                                            | Optional | See the linked contract and this family's rules for its interpretation.        |
| `retainedDirectory` | `string \| undefined`                                                            | Optional | Workspace retained for inspection or recovery.                                 |
| `resume`            | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Required | See the linked contract and this family's rules for its interpretation.        |
| `fork`              | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Required | See the linked contract and this family's rules for its interpretation.        |
| `text`              | `string`                                                                         | Required | Text content; see the owning operation for its source.                         |
| `turns`             | `readonly Turn[]`                                                                | Required | See the linked contract and this family's rules for its interpretation.        |
| `usage`             | `Usage`                                                                          | Required | Reported usage counters; not a currency estimate.                              |
| `conversation`      | `string \| undefined`                                                            | Optional | Available native conversation identity.                                        |
| `value`             | `T`                                                                              | Required | Typed value produced or consumed by this contract.                             |
| `completed`         | `boolean`                                                                        | Required | Whether the configured completion marker matched.                              |
| `completion`        | `string \| undefined`                                                            | Optional | See the linked contract and this family's rules for its interpretation.        |

## Signature

```ts
export interface DispatchResult<T> extends Execution<T> {
  readonly branch: string;
  readonly directory: string;
  readonly commits: readonly Commit[];
  readonly transcript?: string;
  readonly log?: string;
  readonly retainedDirectory?: string;
  resume<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
  fork<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
}
```

## Related contracts

- [Commit](../commit/)
- [ContinuationOptions](../continuationoptions/)
- [Execution](../execution/)
