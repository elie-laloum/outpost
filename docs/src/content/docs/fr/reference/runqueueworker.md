---
title: "runQueueWorker"
description: "runQueueWorker — Outpost API"
sidebar:
  order: 10
---

Contrat public de **runQueueWorker**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { runQueueWorker } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom                | Type                                     | Présence  | Rôle                                                                                          |
| ------------------ | ---------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`          | `QueueWorkerOptions`                     | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.queue`    | `TaskQueue`                              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.worker`   | `string`                                 | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.handlers` | `Readonly<Record<string, QueueHandler>>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.signal`   | `AbortSignal`                            | Requis    | Annulation coopérative de cette opération.                                                    |
| `options.leaseMs`  | `number \| undefined`                    | Optionnel | Durée du bail worker en millisecondes.                                                        |
| `options.pollMs`   | `number \| undefined`                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

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
