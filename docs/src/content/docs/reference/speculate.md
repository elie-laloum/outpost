---
title: "speculate"
description: "speculate — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { speculate } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run bounded agent candidates on separate branches from one baseline and retain the first candidate accepted by validate after cleanup. Cancel losing candidates and report host changes and cumulative usage. This opt-in prototype neither integrates nor pushes the winner automatically.

[Complete example and detailed rules](../../guide/advanced/speculation/).

## Parameters and properties

| Name                      | Type                                                                                                                         | Presence | Meaning                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `options`                 | `SpeculationOptions<T>`                                                                                                      | Required | Repository, provider, bounded candidates, admission budget and winner-validation callback.                  |
| `options.repository`      | `string`                                                                                                                     | Required | Target host Git checkout.                                                                                   |
| `options.sandboxProvider` | `import("../index.js").SandboxProvider`                                                                                      | Required | Execution environment backend.                                                                              |
| `options.candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Required | Agent requests to race on separate branches; at most eight candidates.                                      |
| `options.concurrency`     | `number \| undefined`                                                                                                        | Optional | Maximum candidates running concurrently; defaults to two.                                                   |
| `options.budget`          | `WorkflowBudget`                                                                                                             | Required | Shared attempt and observed usage admission limits.                                                         |
| `options.signal`          | `AbortSignal \| undefined`                                                                                                   | Optional | Cooperative cancellation for this operation.                                                                |
| `options.sandbox`         | `Pick<SandboxOptions, "storageQuota" \| "limits" \| "hooks" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optional | Shared lifecycle, logging and storage settings applied when allocating each candidate sandbox.              |
| `options.validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Required | Predicate run with a candidate’s live sandbox and output; true accepts that candidate as a possible winner. |

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
