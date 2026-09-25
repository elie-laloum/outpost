---
title: "runQueueWorker"
description: "runQueueWorker — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { runQueueWorker } from "@elie-laloum/outpost";
```

## Rôle et comportement

Interroge la file pour les gestionnaires enregistrés, traite une tâche à la fois et renouvelle son bail pendant l’exécution. Enregistre résultats JSON et usage observé, respecte annulation et échéances et rejette les validations périmées ; des effets externes peuvent se répéter après perte du bail.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom                | Type                                     | Présence  | Rôle                                                                                        |
| ------------------ | ---------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `options`          | `QueueWorkerOptions`                     | Requis    | Client de file, identité du worker, registre de gestionnaires, durée de bail et annulation. |
| `options.queue`    | `TaskQueue`                              | Requis    | File de tâches utilisée pour envoyer, prendre en charge et persister l’état des travaux.    |
| `options.worker`   | `string`                                 | Requis    | Identité du worker prenant en charge ou possédant le bail du travail.                       |
| `options.handlers` | `Readonly<Record<string, QueueHandler>>` | Requis    | Registre associant noms de gestionnaires et callbacks d’exécution des travaux.              |
| `options.signal`   | `AbortSignal`                            | Requis    | Annulation coopérative de cette opération.                                                  |
| `options.leaseMs`  | `number \| undefined`                    | Optionnel | Durée du bail worker en millisecondes.                                                      |
| `options.pollMs`   | `number \| undefined`                    | Optionnel | Intervalle en millisecondes entre les interrogations de la file.                            |

## Retour

`Promise<void>`

## Signature

```ts
export declare function runQueueWorker(
  options: QueueWorkerOptions,
): Promise<void>;
```

## Contrats associés

- [QueueWorkerOptions](../queueworkeroptions/)
