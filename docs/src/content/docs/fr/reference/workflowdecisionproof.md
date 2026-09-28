---
title: "WorkflowDecisionProof"
description: "WorkflowDecisionProof — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionProof } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type     | Présence | Rôle                                                                          |
| ----------- | -------- | -------- | ----------------------------------------------------------------------------- |
| `keyId`     | `string` | Requis   | Identifiant de clé d’approbateur de confiance lié à la signature.             |
| `expiresAt` | `string` | Requis   | Date d’expiration signée ; la vérification refuse la preuve dès cet instant.  |
| `signature` | `string` | Requis   | Signature Ed25519 en base64url du contenu canonique versionné de la décision. |

## Signature

```ts
export interface WorkflowDecisionProof {
  readonly keyId: string;
  readonly expiresAt: string;
  readonly signature: string;
}
```
