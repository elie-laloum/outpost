---
title: "SpeculationOptions"
description: "SpeculationOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculationOptions**. Consultez le [guide exécution spéculative](../../workflows/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculationOptions } from "@elie-laloum/outpost";
```

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

## Contrats associés

- [SandboxOptions](../sandboxoptions/)
- [SpeculativeCandidate](../speculativecandidate/)
- [SpeculativeValidation](../speculativevalidation/)
- [WorkflowBudget](../workflowbudget/)
