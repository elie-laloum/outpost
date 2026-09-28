---
title: "ObservationHubOptions"
description: "ObservationHubOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationHubOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                      | Présence  | Rôle                                                                                                                                                |
| ------------------- | ----------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sinks`             | `readonly ObservationSink[] \| undefined` | Optionnel | Récepteurs rattachés à cette racine et hérités par chaque enfant.                                                                                   |
| `scope`             | `ObservationScope \| undefined`           | Optionnel | Champs de corrélation initiaux ; les enfants ne remplacent que les champs explicitement fournis.                                                    |
| `capacity`          | `number \| undefined`                     | Optionnel | Maximum d’enveloppes en attente par récepteur asynchrone, 1024 par défaut ; les nouvelles livraisons sont perdues et comptées en cas de saturation. |
| `deliveryTimeoutMs` | `number \| undefined`                     | Optionnel | Attente maximale d’une livraison asynchrone ou du vidage d’un récepteur, 5000 ms par défaut ; un récepteur hors délai est désactivé.                |
| `verbose`           | `boolean \| undefined`                    | Optionnel | Autorise explicitement les événements de requête/réponse modèle complets. N’active pas à lui seul leur conservation dans le journal.                |

## Signature

```ts
export interface ObservationHubOptions {
  readonly sinks?: readonly ObservationSink[];
  readonly scope?: ObservationScope;
  readonly capacity?: number;
  readonly deliveryTimeoutMs?: number;
  readonly verbose?: boolean;
}
```

## Contrats associés

- [ObservationScope](../observationscope/)
- [ObservationSink](../observationsink/)
