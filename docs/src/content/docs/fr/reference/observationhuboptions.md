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

| Nom                 | Type                                      | Présence  | Rôle                                                                                                                                                                                                              |
| ------------------- | ----------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `redact`            | `readonly RegExp[] \| undefined`          | Optionnel | Expressions régulières appliquées récursivement aux chaînes et clés des événements et aux chaînes du scope avant livraison. Chaque règle remplace toutes les occurrences ; son lastIndex est préservé.            |
| `sinks`             | `readonly ObservationSink[] \| undefined` | Optionnel | Récepteurs rattachés à cette racine et hérités par chaque enfant.                                                                                                                                                 |
| `scope`             | `ObservationScope \| undefined`           | Optionnel | Champs de corrélation initiaux ; les enfants ne remplacent que les champs explicitement fournis.                                                                                                                  |
| `capacity`          | `number \| undefined`                     | Optionnel | Nombre maximal d’événements en attente par sink asynchrone, 1024 par défaut ; en cas de débordement, les plus récents sont abandonnés et comptés. Une valeur qui n’est pas un entier positif lève une erreur.     |
| `deliveryTimeoutMs` | `number \| undefined`                     | Optionnel | Attente maximale d’une livraison asynchrone ou du flush d’un sink, 5000 par défaut ; un sink qui la dépasse est désactivé pour toute la durée du hub. Une valeur qui n’est pas un entier positif lève une erreur. |
| `verbose`           | `boolean \| undefined`                    | Optionnel | Autorise explicitement les événements de requête/réponse modèle complets. N’active pas à lui seul leur conservation dans le journal.                                                                              |

## Signature

```ts
export interface ObservationHubOptions {
  readonly redact?: readonly RegExp[];
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
