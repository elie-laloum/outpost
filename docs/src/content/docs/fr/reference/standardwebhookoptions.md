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

| Nom           | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                                                      |
| ------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secret`      | `TriggerSecret`       | Requis    | Secret whsec_ qui vérifie webhook-signature, ou callback renvoyant chaque secret actuellement accepté (l’ancien et le nouveau pendant une rotation). Une chaîne vide lève une erreur à la création ; un callback en échec ou vide, ou un secret sans préfixe whsec_, refuse les requêtes. |
| `toleranceMs` | `number \| undefined` | Optionnel | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut. Une valeur qui n’est pas un entier positif lève une erreur à la création.                                                                                                      |
| `source`      | `string \| undefined` | Optionnel | Nom indiqué dans TriggerEvent.source ; standard par défaut.                                                                                                                                                                                                                               |

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
