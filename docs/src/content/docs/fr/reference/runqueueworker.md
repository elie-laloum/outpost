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

Prend en charge les jobs des handlers enregistrés et les exécute un par un jusqu’à l’interruption de signal, en renouvelant chaque bail à chaque tiers de leaseMs. Une erreur levée ou un résultat avec error marque le job failed ; un bail perdu ou une annulation interrompt le signal du handler et rien n’est enregistré. Se résout quand signal s’interrompt et rejette quand une opération de file échoue.

[Exemple complet et règles détaillées](../../guide/job-queues/).

## Paramètres et propriétés

| Nom                | Type                                     | Présence  | Rôle                                                                                                                                               |
| ------------------ | ---------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`          | `QueueWorkerOptions`                     | Requis    | File, nom du worker, handlers, signal d’arrêt, ainsi que durées de bail et d’interrogation.                                                        |
| `options.queue`    | `TaskQueue`                              | Requis    | File où le worker prend les jobs et enregistre leurs résultats.                                                                                    |
| `options.worker`   | `string`                                 | Requis    | Nom du worker enregistré sur chaque job pris en charge, de 1 à 512 caractères ; donnez-en un distinct à chaque processus.                          |
| `options.handlers` | `Readonly<Record<string, QueueHandler>>` | Requis    | Handlers par nom, de 1 à 100 ; le worker ne prend en charge que les jobs dont le handler figure ici.                                               |
| `options.signal`   | `AbortSignal`                            | Requis    | Arrête le worker : runQueueWorker() se résout et le signal du handler en cours s’interrompt. Ce job reste active jusqu’à l’expiration de son bail. |
| `options.leaseMs`  | `number \| undefined`                    | Optionnel | Durée du bail en millisecondes, 30000 par défaut, de 30 à 300000 ; renouvelé à chaque tiers de cette durée.                                        |
| `options.pollMs`   | `number \| undefined`                    | Optionnel | Attente en millisecondes quand aucun job n’est éligible, 250 par défaut ; doit être positive.                                                      |

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
