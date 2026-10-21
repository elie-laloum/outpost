---
title: "createObservation"
description: "createObservation — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createObservation } from "@elie-laloum/outpost/core";
```

## Rôle et comportement

Crée un client d’observation réutilisable avec persistance optionnelle et sorties empruntées. Les moteurs de dispatch et de workflow ouvrent des suivis indépendants et les ferment à stabilisation ; le client expose readRun et watchRun sur le même transport. La construction n’écrit rien et ne lance aucune exécution. Les suivis ont des séquences distinctes et les reprises conservent les curseurs persistants. close() attend les suivis actifs sans annuler le travail. Les hubs et lecteurs indépendants restent compatibles.

[Exemple complet et règles détaillées](../../guide/run-state/).

## Paramètres et propriétés

| Nom                         | Type                                      | Présence  | Rôle                                                                                                                                                                                                                                                                |
| --------------------------- | ----------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                   | `ObservationOptions \| undefined`         | Optionnel | Réglages optionnels de livraison, masquage, sorties et persistance. Sans transport, seule l’observation en mémoire est active. Sorties et transport sont empruntés ; la construction ne démarre aucune exécution.                                                   |
| `options.transporter`       | `Transport \| undefined`                  | Optionnel | Transport optionnel appartenant à l’appelant, contenant états et événements sous runs/&lt;id>/. Les moteurs enregistrent et ferment les suivis ; construire ou consulter le client ne crée aucun enregistrement. Sans lui, readRun et watchRun refusent la lecture. |
| `options.heartbeatMs`       | `number \| undefined`                     | Optionnel | Intervalle du heartbeat en millisecondes, 5000 par défaut, entier sûr positif dans la plage des minuteurs. Concerne seulement les exécutions actives enregistrées.                                                                                                  |
| `options.abandonAfterMs`    | `number \| undefined`                     | Optionnel | Délai d’expiration du heartbeat en millisecondes, 30000 par défaut ; doit dépasser heartbeatMs. L’expiration signale un abandon suspecté à la lecture, sans autoriser de récupération.                                                                              |
| `options.redact`            | `readonly RegExp[] \| undefined`          | Optionnel | Expressions régulières appliquées récursivement aux chaînes et clés des événements et aux chaînes du scope avant livraison. Chaque règle remplace toutes les occurrences ; son lastIndex est préservé.                                                              |
| `options.sinks`             | `readonly ObservationSink[] \| undefined` | Optionnel | Récepteurs rattachés à cette racine et hérités par chaque enfant.                                                                                                                                                                                                   |
| `options.scope`             | `ObservationScope \| undefined`           | Optionnel | Champs de corrélation initiaux ; les enfants ne remplacent que les champs explicitement fournis.                                                                                                                                                                    |
| `options.capacity`          | `number \| undefined`                     | Optionnel | Nombre maximal d’événements en attente par sink asynchrone, 1024 par défaut ; en cas de débordement, les plus récents sont abandonnés et comptés. Une valeur qui n’est pas un entier positif lève une erreur.                                                       |
| `options.deliveryTimeoutMs` | `number \| undefined`                     | Optionnel | Attente maximale d’une livraison asynchrone ou du flush d’un sink, 5000 par défaut ; un sink qui la dépasse est désactivé pour toute la durée du hub. Une valeur qui n’est pas un entier positif lève une erreur.                                                   |
| `options.verbose`           | `boolean \| undefined`                    | Optionnel | Autorise explicitement les événements de requête/réponse modèle complets. N’active pas à lui seul leur conservation dans le journal.                                                                                                                                |

## Retour

`ObservationClient`

## Signature

```ts
export declare function createObservation(
  options?: ObservationOptions,
): ObservationClient;
```

## Contrats associés

- [ObservationClient](../observationclient/)
- [ObservationOptions](../observationoptions/)
