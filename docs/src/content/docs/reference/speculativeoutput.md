---
title: "SpeculativeOutput"
description: "SpeculativeOutput — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculativeOutput**. See the [speculative execution guide](../../guide/advanced/speculation/) for behavior, defaults and examples.

## Import

```ts
import type { SpeculativeOutput } from "@elie-laloum/outpost";
```

## Purpose and behavior

Race bounded candidate branches and select the first one that passes explicit validation and cleanup.

Research prototype: at most eight candidates, default concurrency two. No automatic integration, push or durable race resumption. Observed usage is not a billing cap.

[Complete example and detailed rules](../../guide/advanced/speculation/).

## Parameters and properties

| Name                | Type                  | Presence | Meaning                                                                        |
| ------------------- | --------------------- | -------- | ------------------------------------------------------------------------------ |
| `text`              | `string`              | Required | Text content; see the owning operation for its source.                         |
| `conversation`      | `string \| undefined` | Optional | Available native conversation identity.                                        |
| `usage`             | `Usage`               | Required | Reported usage counters; not a currency estimate.                              |
| `branch`            | `string`              | Required | Git workspace policy or resulting branch identity, according to this contract. |
| `directory`         | `string`              | Required | Filesystem directory used by the owning operation; see path rules.             |
| `commits`           | `readonly Commit[]`   | Required | Collected Git commit identities and subjects.                                  |
| `transcript`        | `string \| undefined` | Optional | Available host path to the captured transcript.                                |
| `log`               | `string \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.        |
| `retainedDirectory` | `string \| undefined` | Optional | Workspace retained for inspection or recovery.                                 |
| `turns`             | `readonly Turn[]`     | Required | See the linked contract and this family's rules for its interpretation.        |
| `value`             | `T`                   | Required | Typed value produced or consumed by this contract.                             |
| `completed`         | `boolean`             | Required | Whether the configured completion marker matched.                              |
| `completion`        | `string \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.        |

## Signature

```ts
export type SpeculativeOutput<T> = Omit<
  WarmDispatchResult<T>,
  "resume" | "fork"
>;
```

## Related contracts

- [WarmDispatchResult](../warmdispatchresult/)
