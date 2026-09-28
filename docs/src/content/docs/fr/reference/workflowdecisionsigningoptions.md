---
title: "WorkflowDecisionSigningOptions"
description: "WorkflowDecisionSigningOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionSigningOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                              | Présence | Rôle                                                                                                     |
| ------------ | --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `decision`   | `Omit<WorkflowDecision, "proof">` | Requis   | Exécution, demande en attente, tâche, acteur, action et motif exacts à signer, sans preuve préexistante. |
| `keyId`      | `string`                          | Requis   | Identifiant unique de la clé publique de confiance correspondante ; inclus dans le contenu signé.        |
| `privateKey` | `KeyObject`                       | Requis   | KeyObject privé Ed25519 appartenant à l’application ; jamais persisté par Outpost.                       |
| `expiresAt`  | `string`                          | Requis   | Date d’expiration future interprétable par Date.parse ; la chaîne exacte est signée.                     |

## Signature

```ts
import type { KeyObject } from "node:crypto";

export interface WorkflowDecisionSigningOptions {
  readonly decision: Omit<WorkflowDecision, "proof">;
  readonly keyId: string;
  readonly privateKey: KeyObject;
  readonly expiresAt: string;
}
```

## Contrats associés

- [WorkflowDecision](../workflowdecision/)
