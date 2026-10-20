---
title: "ObservationOptions"
description: "ObservationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                      | Présence  | Rôle                                                                                                                                                                                                                                                                |
| ------------------- | ----------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter`       | `Transport \| undefined`                  | Optionnel | Transport optionnel appartenant à l’appelant, contenant états et événements sous runs/&lt;id>/. Les moteurs enregistrent et ferment les suivis ; construire ou consulter le client ne crée aucun enregistrement. Sans lui, readRun et watchRun refusent la lecture. |
| `heartbeatMs`       | `number \| undefined`                     | Optionnel | Intervalle du heartbeat en millisecondes, 5000 par défaut, entier sûr positif dans la plage des minuteurs. Concerne seulement les exécutions actives enregistrées.                                                                                                  |
| `abandonAfterMs`    | `number \| undefined`                     | Optionnel | Délai d’expiration du heartbeat en millisecondes, 30000 par défaut ; doit dépasser heartbeatMs. L’expiration signale un abandon suspecté à la lecture, sans autoriser de récupération.                                                                              |
| `redact`            | `readonly RegExp[] \| undefined`          | Optionnel | Expressions régulières appliquées récursivement aux chaînes et clés des événements et aux chaînes du scope avant livraison. Chaque règle remplace toutes les occurrences ; son lastIndex est préservé.                                                              |
| `sinks`             | `readonly ObservationSink[] \| undefined` | Optionnel | Récepteurs rattachés à cette racine et hérités par chaque enfant.                                                                                                                                                                                                   |
| `scope`             | `ObservationScope \| undefined`           | Optionnel | Champs de corrélation initiaux ; les enfants ne remplacent que les champs explicitement fournis.                                                                                                                                                                    |
| `capacity`          | `number \| undefined`                     | Optionnel | Nombre maximal d’événements en attente par sink asynchrone, 1024 par défaut ; en cas de débordement, les plus récents sont abandonnés et comptés. Une valeur qui n’est pas un entier positif lève une erreur.                                                       |
| `deliveryTimeoutMs` | `number \| undefined`                     | Optionnel | Attente maximale d’une livraison asynchrone ou du flush d’un sink, 5000 par défaut ; un sink qui la dépasse est désactivé pour toute la durée du hub. Une valeur qui n’est pas un entier positif lève une erreur.                                                   |
| `verbose`           | `boolean \| undefined`                    | Optionnel | Autorise explicitement les événements de requête/réponse modèle complets. N’active pas à lui seul leur conservation dans le journal.                                                                                                                                |

## Signature

```ts
export interface ObservationOptions extends ObservationHubOptions {
  readonly transporter?: Transport;
  readonly heartbeatMs?: number;
  readonly abandonAfterMs?: number;
}
```

## Contrats associés

- [ObservationHubOptions](../observationhuboptions/)
- [Transport](../transport/)
