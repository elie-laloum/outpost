---
title: "speculate"
description: "speculate — Outpost API"
sidebar:
  order: 10
---

Public contract for **speculate**. See the [speculative execution guide](../../guide/advanced/speculation/) for behavior, defaults and examples.

## Import

```ts
import { speculate } from "@elie-laloum/outpost";
```

## Purpose and behavior

Race bounded candidate branches and select the first one that passes explicit validation and cleanup.

Research prototype: at most eight candidates, default concurrency two. No automatic integration, push or durable race resumption. Observed usage is not a billing cap.

[Complete example and detailed rules](../../guide/advanced/speculation/).

## Parameters and properties

| Name                  | Type                                                                                                                         | Presence | Meaning                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`             | `SpeculationOptions<T>`                                                                                                      | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.repository`  | `string`                                                                                                                     | Required | Target host Git checkout.                                                                |
| `options.provider`    | `import("../index.js").SandboxProvider`                                                                                      | Required | Execution environment backend.                                                           |
| `options.candidates`  | `readonly SpeculativeCandidate<T>[]`                                                                                         | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.concurrency` | `number \| undefined`                                                                                                        | Optional | Maximum admitted concurrent tasks or candidates.                                         |
| `options.budget`      | `WorkflowBudget`                                                                                                             | Required | Shared attempt and observed usage admission limits.                                      |
| `options.signal`      | `AbortSignal \| undefined`                                                                                                   | Optional | Cooperative cancellation for this operation.                                             |
| `options.sandbox`     | `Pick<SandboxOptions, "storageQuota" \| "limits" \| "hooks" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.validate`    | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Required | See the linked contract and this family's rules for its interpretation.                  |

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
