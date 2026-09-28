---
title: "WorkflowApproverKey"
description: "WorkflowApproverKey — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowApproverKey } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type        | Présence | Rôle                                                                                                           |
| ----------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `keyId`     | `string`    | Requis   | Identifiant unique dans l’ensemble courant des clés de confiance ; les doublons font échouer la vérification.  |
| `actor`     | `string`    | Requis   | Seul acteur autorisé à signer des décisions avec cette clé publique.                                           |
| `publicKey` | `KeyObject` | Requis   | KeyObject public Ed25519 utilisé pour vérifier la preuve ; le vérificateur n’a jamais besoin de la clé privée. |

## Signature

```ts
import type { KeyObject } from "node:crypto";

export interface WorkflowApproverKey {
  readonly keyId: string;
  readonly actor: string;
  readonly publicKey: KeyObject;
}
```
