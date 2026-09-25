---
title: "SpeculationOptions"
description: "SpeculationOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculationOptions**. See the [speculative execution guide](../../guide/advanced/speculation/) for behavior, defaults and examples.

## Import

```ts
import type { SpeculationOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Race bounded candidate branches and select the first one that passes explicit validation and cleanup.

Research prototype: at most eight candidates, default concurrency two. No automatic integration, push or durable race resumption. Observed usage is not a billing cap.

[Complete example and detailed rules](../../guide/advanced/speculation/).

## Parameters and properties

| Name          | Type                                                                                                                         | Presence | Meaning                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `repository`  | `string`                                                                                                                     | Required | Target host Git checkout.                                               |
| `provider`    | `import("../index.js").SandboxProvider`                                                                                      | Required | Execution environment backend.                                          |
| `candidates`  | `readonly SpeculativeCandidate<T>[]`                                                                                         | Required | See the linked contract and this family's rules for its interpretation. |
| `concurrency` | `number \| undefined`                                                                                                        | Optional | Maximum admitted concurrent tasks or candidates.                        |
| `budget`      | `WorkflowBudget`                                                                                                             | Required | Shared attempt and observed usage admission limits.                     |
| `signal`      | `AbortSignal \| undefined`                                                                                                   | Optional | Cooperative cancellation for this operation.                            |
| `sandbox`     | `Pick<SandboxOptions, "storageQuota" \| "limits" \| "hooks" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `validate`    | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface SpeculationOptions<T = undefined> {
  readonly repository: string;
  readonly provider: NonNullable<SandboxOptions["provider"]>;
  readonly candidates: readonly SpeculativeCandidate<T>[];
  readonly concurrency?: number;
  readonly budget: WorkflowBudget;
  readonly signal?: AbortSignal;
  readonly sandbox?: Pick<
    SandboxOptions,
    | "hooks"
    | "bootstrap"
    | "logging"
    | "limits"
    | "storageQuota"
    | "conversationHome"
  >;
  readonly validate: (
    candidate: SpeculativeValidation<T>,
  ) => boolean | Promise<boolean>;
}
```

## Related contracts

- [SandboxOptions](../sandboxoptions/)
- [SpeculativeCandidate](../speculativecandidate/)
- [SpeculativeValidation](../speculativevalidation/)
- [WorkflowBudget](../workflowbudget/)
