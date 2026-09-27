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

Crée un distributeur d’événements à contexte explicite, avec une séquence partagée entre enfants, des files bornées indépendantes, un vidage par instantané et des erreurs de livraison isolées. Le transmettre par observation à un workflow ou dispatch ; le hub parent appartient à l’appelant. Il s’agit d’observation en direct, pas d’un registre d’état durable ni d’un relais de workers distants.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom                         | Type                                      | Présence  | Rôle                                                                                                                                                |
| --------------------------- | ----------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                   | `ObservationHubOptions \| undefined`      | Optionnel | Récepteurs, contexte initial, limites de livraison et activation des contenus modèle détaillés facultatifs.                                         |
| `options.sinks`             | `readonly ObservationSink[] \| undefined` | Optionnel | Récepteurs rattachés à cette racine et hérités par chaque enfant.                                                                                   |
| `options.scope`             | `ObservationScope \| undefined`           | Optionnel | Champs de corrélation initiaux ; les enfants ne remplacent que les champs explicitement fournis.                                                    |
| `options.capacity`          | `number \| undefined`                     | Optionnel | Maximum d’enveloppes en attente par récepteur asynchrone, 1024 par défaut ; les nouvelles livraisons sont perdues et comptées en cas de saturation. |
| `options.deliveryTimeoutMs` | `number \| undefined`                     | Optionnel | Attente maximale d’une livraison asynchrone ou du vidage d’un récepteur, 5000 ms par défaut ; un récepteur hors délai est désactivé.                |
| `options.verbose`           | `boolean \| undefined`                    | Optionnel | Autorise explicitement les événements de requête/réponse modèle complets. N’active pas à lui seul leur conservation dans le journal.                |

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
