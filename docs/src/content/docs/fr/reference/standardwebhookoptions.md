---
title: "StandardWebhookOptions"
description: "StandardWebhookOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StandardWebhookOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                                                                                                                                                             |
| ------------- | --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secret`      | `TriggerSecret`       | Requis    | Secret whsec_ qui vérifie webhook-signature. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes. |
| `toleranceMs` | `number \| undefined` | Optionnel | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut.                                                                                                                       |
| `source`      | `string \| undefined` | Optionnel | Nom indiqué dans TriggerEvent.source ; standard par défaut.                                                                                                                                                                      |

## Signature

```ts
export interface StandardWebhookOptions {
  /** `whsec_` secret verifying Standard Webhooks signatures. */
  readonly secret: TriggerSecret;
  readonly toleranceMs?: number;
  /** Event source name; defaults to `standard`. */
  readonly source?: string;
}
```

## Contrats associés

- [TriggerSecret](../triggersecret/)
