---
title: "createObservationHub"
description: "createObservationHub — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createObservationHub } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un hub racine qui numérote chaque événement dans une séquence partagée et en remet une copie à chaque sink via sa propre file bornée. Passez-le dans observation d’un workflow ou d’un dispatch : les exécutions émettent via des enfants scopés, et la racine vous appartient, à vous de la fermer. Les échecs et pertes des sinks sont collectés, jamais levés ; le hub ne stocke rien.

[Exemple complet et règles détaillées](../../guide/observability/).

## Paramètres et propriétés

| Nom                         | Type                                      | Présence  | Rôle                                                                                                                                                                                                              |
| --------------------------- | ----------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                   | `ObservationHubOptions \| undefined`      | Optionnel | Récepteurs, contexte initial, limites de livraison et activation des contenus modèle détaillés.                                                                                                                   |
| `options.redact`            | `readonly RegExp[] \| undefined`          | Optionnel | Expressions régulières appliquées récursivement aux chaînes et clés des événements et aux chaînes du scope avant livraison. Chaque règle remplace toutes les occurrences ; son lastIndex est préservé.            |
| `options.sinks`             | `readonly ObservationSink[] \| undefined` | Optionnel | Récepteurs rattachés à cette racine et hérités par chaque enfant.                                                                                                                                                 |
| `options.scope`             | `ObservationScope \| undefined`           | Optionnel | Champs de corrélation initiaux ; les enfants ne remplacent que les champs explicitement fournis.                                                                                                                  |
| `options.capacity`          | `number \| undefined`                     | Optionnel | Nombre maximal d’événements en attente par sink asynchrone, 1024 par défaut ; en cas de débordement, les plus récents sont abandonnés et comptés. Une valeur qui n’est pas un entier positif lève une erreur.     |
| `options.deliveryTimeoutMs` | `number \| undefined`                     | Optionnel | Attente maximale d’une livraison asynchrone ou du flush d’un sink, 5000 par défaut ; un sink qui la dépasse est désactivé pour toute la durée du hub. Une valeur qui n’est pas un entier positif lève une erreur. |
| `options.verbose`           | `boolean \| undefined`                    | Optionnel | Autorise explicitement les événements de requête/réponse modèle complets. N’active pas à lui seul leur conservation dans le journal.                                                                              |

## Retour

`ObservationHub`

## Signature

```ts
export declare function createObservationHub(
  options?: ObservationHubOptions,
): ObservationHub;
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [ObservationHubOptions](../observationhuboptions/)
