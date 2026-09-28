---
title: "WorkflowDecisionVerifierOptions"
description: "WorkflowDecisionVerifierOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionVerifierOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom    | Type                                                                              | Présence | Rôle                                                                                                                                                        |
| ------ | --------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keys` | `() => readonly WorkflowApproverKey[] \| Promise<readonly WorkflowApproverKey[]>` | Requis   | Résout les associations acteur/clé publique à chaque vérification. Retirer une clé révoque les nouvelles preuves ; une erreur de source refuse la décision. |

## Signature

```ts
export interface WorkflowDecisionVerifierOptions {
  readonly keys: () =>
    readonly WorkflowApproverKey[] | Promise<readonly WorkflowApproverKey[]>;
}
```

## Contrats associés

- [WorkflowApproverKey](../workflowapproverkey/)
