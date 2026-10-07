---
title: "createRunObserver"
description: "createRunObserver — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createRunObserver } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un récepteur via transport pour un dispatch ou workflow sous un ID choisi. Les écritures conditionnelles refusent les doublons et bloquent les anciens écrivains. Les heartbeats cessent à la fin, à un échec de stockage ou à la fermeture. La reprise ajoute uniquement aux projections de workflows terminés ou suspendus avec un nouveau hub ; les fiches en cours exigent un nouvel ID après récupération explicite. Les erreurs d’observation restent isolées de l’exécution.

[Exemple complet et règles détaillées](../../guide/run-state/).

## Paramètres et propriétés

| Nom                      | Type                       | Présence  | Rôle                                                                                                                                              |
| ------------------------ | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `RunObserverOptions`       | Requis    | Transport, ID d’exécution, type de projection, politique de heartbeat et reprise optionnelle d’un workflow terminé ou suspendu.                   |
| `options.transporter`    | `Transport`                | Requis    | Transport des fiches et segments d’événements immuables ; l’appelant possède ses identifiants et son cycle de vie.                                |
| `options.id`             | `string`                   | Requis    | ID unique d’au plus 128 caractères dans un segment sûr de clé de transport.                                                                       |
| `options.kind`           | `"workflow" \| "dispatch"` | Requis    | Choisissez dispatch pour une requête ou workflow pour un graphe de tâches.                                                                        |
| `options.heartbeatMs`    | `number \| undefined`      | Optionnel | Période de heartbeat en millisecondes, 5000 par défaut ; positive et inférieure à abandonAfterMs.                                                 |
| `options.abandonAfterMs` | `number \| undefined`      | Optionnel | Délai d’abandon présumé en millisecondes, 30000 par défaut, strictement supérieur à heartbeatMs.                                                  |
| `options.resume`         | `boolean \| undefined`     | Optionnel | Ajoute explicitement à une fiche de workflow terminée ou suspendue avec un nouveau hub ; doublons et reprises de fiches en cours restent refusés. |

## Retour

`Promise<RunObserver>`

## Signature

```ts
export declare function createRunObserver(
  options: RunObserverOptions,
): Promise<RunObserver>;
```

## Contrats associés

- [RunObserver](../runobserver/)
- [RunObserverOptions](../runobserveroptions/)
