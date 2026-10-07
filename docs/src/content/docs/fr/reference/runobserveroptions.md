---
title: "RunObserverOptions"
description: "RunObserverOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunObserverOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                       | Présence  | Rôle                                                                                                                                              |
| ---------------- | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter`    | `Transport`                | Requis    | Transport des fiches et segments d’événements immuables ; l’appelant possède ses identifiants et son cycle de vie.                                |
| `id`             | `string`                   | Requis    | ID unique d’au plus 128 caractères dans un segment sûr de clé de transport.                                                                       |
| `kind`           | `"workflow" \| "dispatch"` | Requis    | Choisissez dispatch pour une requête ou workflow pour un graphe de tâches.                                                                        |
| `heartbeatMs`    | `number \| undefined`      | Optionnel | Période de heartbeat en millisecondes, 5000 par défaut ; positive et inférieure à abandonAfterMs.                                                 |
| `abandonAfterMs` | `number \| undefined`      | Optionnel | Délai d’abandon présumé en millisecondes, 30000 par défaut, strictement supérieur à heartbeatMs.                                                  |
| `resume`         | `boolean \| undefined`     | Optionnel | Ajoute explicitement à une fiche de workflow terminée ou suspendue avec un nouveau hub ; doublons et reprises de fiches en cours restent refusés. |

## Signature

```ts
export interface RunObserverOptions {
  readonly transporter: Transport;
  readonly id: string;
  readonly kind: "dispatch" | "workflow";
  readonly heartbeatMs?: number;
  readonly abandonAfterMs?: number;
  readonly resume?: boolean;
}
```

## Contrats associés

- [Transport](../transport/)
