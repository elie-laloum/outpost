---
title: "SpeculationOptions"
description: "SpeculationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculationOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                                                                                                         | Presence | Meaning                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `observation`     | `import("../domain/observation.types.ts").ObservationHub \| undefined`                                                       | Optional | Parent hub used to correlate candidate allocation, agent events, validation, selection and cleanup by candidate key. |
| `repository`      | `string`                                                                                                                     | Required | Target host Git checkout.                                                                                            |
| `sandboxProvider` | `import("../index.js").SandboxProvider`                                                                                      | Required | Execution environment backend.                                                                                       |
| `candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Required | Agent requests to race on separate branches; at most eight candidates.                                               |
| `concurrency`     | `number \| undefined`                                                                                                        | Optional | Maximum candidates running concurrently; defaults to two.                                                            |
| `budget`          | `WorkflowBudget`                                                                                                             | Required | Shared attempt and observed usage admission limits.                                                                  |
| `signal`          | `AbortSignal \| undefined`                                                                                                   | Optional | Cooperative cancellation for this operation.                                                                         |
| `sandbox`         | `Pick<SandboxOptions, "hooks" \| "storageQuota" \| "limits" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optional | Shared lifecycle, logging and storage settings applied when allocating each candidate sandbox.                       |
| `validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Required | Predicate run with a candidate’s live sandbox and output; true accepts that candidate as a possible winner.          |

## Signature

```ts
export interface SpeculationOptions<T = undefined> {
  readonly observation?: ObservationHub;
  readonly repository: string;
  readonly sandboxProvider: NonNullable<SandboxOptions["sandboxProvider"]>;
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
