---
title: "QueueClientOptions"
description: "QueueClientOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueClientOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                          | Présence  | Rôle                                                                                                                         |
| ----------- | --------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `url`       | `string`                                      | Requis    | URL HTTP de base du serveur de file de tâches.                                                                               |
| `token`     | `string \| (() => string \| Promise<string>)` | Requis    | Jeton bearer fixe ou callback résolvant le jeton courant à chaque requête, y compris renouvellement du bail et finalisation. |
| `timeoutMs` | `number \| undefined`                         | Optionnel | Durée maximale en millisecondes de chaque requête HTTP à la file.                                                            |

## Signature

```ts
export interface QueueClientOptions {
  readonly url: string;
  readonly token: string | (() => string | Promise<string>);
  readonly timeoutMs?: number;
}
```
