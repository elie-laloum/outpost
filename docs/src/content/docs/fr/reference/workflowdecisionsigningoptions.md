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

| Nom          | Type                              | Présence | Rôle                                                                                                                                               |
| ------------ | --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `decision`   | `Omit<WorkflowDecision, "proof">` | Requis   | Exécution, demande en attente, tâche, acteur, action et motif exacts à signer, sans preuve préexistante.                                           |
| `keyId`      | `string`                          | Requis   | Identifiant de la clé publique de confiance correspondante, non vide et d’au plus 512 caractères ; signé avec la décision et copié dans la preuve. |
| `privateKey` | `KeyObject`                       | Requis   | KeyObject privé Ed25519 appartenant à votre application ; tout autre type de clé lève une erreur. Outpost ne le stocke jamais.                     |
| `expiresAt`  | `string`                          | Requis   | Expiration de la preuve, interprétable par Date.parse et postérieure à maintenant ; la chaîne exacte est signée.                                   |

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
