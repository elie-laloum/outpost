---
title: "httpTaskQueue"
description: "httpTaskQueue — Outpost API"
sidebar:
  order: 10
---

Contrat public de **httpTaskQueue**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { httpTaskQueue } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom                 | Type                  | Présence  | Rôle                                                                                          |
| ------------------- | --------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`           | `QueueClientOptions`  | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.url`       | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.token`     | `string`              | Requis    | Identifiant de transport explicite ; jamais dans une URL.                                     |
| `options.timeoutMs` | `number \| undefined` | Optionnel | Délai en millisecondes pour l’opération concernée.                                            |

## Retour

`TaskQueue`

## Signature

```ts
export declare function httpTaskQueue(options: QueueClientOptions): TaskQueue;
```

## Contrats associés

- [QueueClientOptions](../queueclientoptions/)
- [TaskQueue](../taskqueue/)
