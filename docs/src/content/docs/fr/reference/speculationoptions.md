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

## Paramètres et propriétés

| Nom               | Type                                                                                                                         | Présence  | Rôle                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `repository`      | `string`                                                                                                                     | Requis    | Checkout Git hôte ciblé.                                                                                     |
| `sandboxProvider` | `import("../index.js").SandboxProvider`                                                                                      | Requis    | Backend de l’environnement d’exécution.                                                                      |
| `candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Requis    | Requêtes d’agent mises en concurrence sur des branches distinctes ; huit candidats au maximum.               |
| `concurrency`     | `number \| undefined`                                                                                                        | Optionnel | Nombre maximal de candidats exécutés simultanément ; deux par défaut.                                        |
| `budget`          | `WorkflowBudget`                                                                                                             | Requis    | Limites partagées de tentatives et d’usage observé.                                                          |
| `signal`          | `AbortSignal \| undefined`                                                                                                   | Optionnel | Annulation coopérative de cette opération.                                                                   |
| `sandbox`         | `Pick<SandboxOptions, "storageQuota" \| "limits" \| "hooks" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optionnel | Réglages communs de cycle de vie, journaux et stockage appliqués à l’allocation de chaque sandbox candidate. |
| `validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Requis    | Prédicat exécuté avec la sandbox active et la sortie d’un candidat ; true l’accepte comme gagnant possible.  |

## Signature

```ts
export interface SpeculationOptions<T = undefined> {
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

## Contrats associés

- [SandboxOptions](../sandboxoptions/)
- [SpeculativeCandidate](../speculativecandidate/)
- [SpeculativeValidation](../speculativevalidation/)
- [WorkflowBudget](../workflowbudget/)
