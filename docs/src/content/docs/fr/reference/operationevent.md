---
title: "OperationEvent"
description: "OperationEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OperationEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                  | Présence  | Rôle                                                                                             |
| ------------ | ------------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `kind`       | `"operation"`                         | Requis    | Discriminant d’une opération du cycle de vie Outpost.                                            |
| `id`         | `string`                              | Requis    | Identifiant unique partagé par le début et l’événement terminal de cette opération.              |
| `name`       | `string`                              | Requis    | Nom stable de l’opération, sans arguments de commande, identifiants d’accès ni contenu du dépôt. |
| `status`     | `"finished" \| "failed" \| "started"` | Requis    | Démarrée, terminée avec succès ou en échec ; les événements terminaux portent la durée écoulée.  |
| `durationMs` | `number \| undefined`                 | Optionnel | Durée monotone écoulée en millisecondes sur les événements finished ou failed.                   |

## Signature

```ts
export interface OperationEvent {
  readonly kind: "operation";
  readonly id: string;
  readonly name: string;
  readonly status: "started" | "finished" | "failed";
  readonly durationMs?: number;
}
```
