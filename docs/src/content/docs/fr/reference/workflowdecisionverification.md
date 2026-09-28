---
title: "WorkflowDecisionVerification"
description: "WorkflowDecisionVerification — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionVerification } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type     | Présence | Rôle                                                              |
| ------------ | -------- | -------- | ----------------------------------------------------------------- |
| `keyId`      | `string` | Requis   | Identifiant de la clé de confiance ayant vérifié cette décision.  |
| `verifiedAt` | `string` | Requis   | Date à laquelle la preuve de décision a été vérifiée avec succès. |

## Signature

```ts
export interface WorkflowDecisionVerification {
  readonly keyId: string;
  readonly verifiedAt: string;
}
```
