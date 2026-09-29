---
title: "speculate"
description: "speculate — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Speculation is experimental: its options and result can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import { speculate } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run bounded candidates from a pinned repository baseline, validate them in their live sandboxes and select one winner after its cleanup. Durable mode persists ownership, attempts, usage and outputs through Transport and requires explicit recovery/replay after a crash. Return preserved recovery locations and a Git merge preflight without integrating the branch.

[Complete example and detailed rules](../../guide/speculation/).

## Parameters and properties

| Name                      | Type                                                                                                                         | Presence | Meaning                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `SpeculationOptions<T>`                                                                                                      | Required | Repository, provider, bounded candidates, admission budget and winner-validation callback.                                                      |
| `options.durability`      | `SpeculationDurability \| undefined`                                                                                         | Optional | Persist this race through Transport; requires provider recovery support. Omit for an in-memory race.                                            |
| `options.cleanupMs`       | `number \| undefined`                                                                                                        | Optional | Maximum wait in milliseconds for each close/recovery and for workers after cancellation; defaults to 30000. Unsettled resources remain pending. |
| `options.observation`     | `ObservationHub \| undefined`                                                                                                | Optional | Parent hub used to correlate candidate allocation, agent events, validation, selection and cleanup by candidate key.                            |
| `options.repository`      | `string`                                                                                                                     | Required | Target host Git checkout.                                                                                                                       |
| `options.sandboxProvider` | `SandboxProvider`                                                                                                            | Required | Execution environment backend.                                                                                                                  |
| `options.candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Required | Agent requests to race on separate branches; at most eight candidates.                                                                          |
| `options.concurrency`     | `number \| undefined`                                                                                                        | Optional | Maximum candidates running concurrently; defaults to two.                                                                                       |
| `options.budget`          | `WorkflowBudget`                                                                                                             | Required | Shared attempt and observed usage admission limits.                                                                                             |
| `options.signal`          | `AbortSignal \| undefined`                                                                                                   | Optional | Cooperative cancellation for this operation.                                                                                                    |
| `options.sandbox`         | `Pick<SandboxOptions, "hooks" \| "storageQuota" \| "limits" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optional | Shared lifecycle, logging and storage settings applied when allocating each candidate sandbox.                                                  |
| `options.validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Required | Predicate run with a candidate’s live sandbox and output; true accepts that candidate as a possible winner.                                     |

## Returns

`Promise<SpeculationResult<T>>`

## Signature

```ts
export declare function speculate<T = undefined>(
  options: SpeculationOptions<T>,
): Promise<SpeculationResult<T>>;
```

## Related contracts

- [SpeculationOptions](../speculationoptions/)
- [SpeculationResult](../speculationresult/)
