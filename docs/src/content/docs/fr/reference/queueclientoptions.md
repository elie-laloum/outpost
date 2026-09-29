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

| Nom         | Type                                          | Présence  | Rôle                                                                                                                                                                                                                  |
| ----------- | --------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`       | `string`                                      | Requis    | URL de base d’un serveur serveTaskQueue(), en http ou https, sans identifiants, requête ni fragment ; les requêtes partent vers &lt;url>/queue.                                                                       |
| `token`     | `string \| (() => string \| Promise<string>)` | Requis    | Jeton bearer, ou fonction appelée avant chaque requête, renouvellements de bail et finalisations compris, pour qu’un jeton renouvelé s’applique aussitôt. Chaque valeur doit compter 32 à 512 caractères sans espace. |
| `timeoutMs` | `number \| undefined`                         | Optionnel | Durée maximale de chaque requête HTTP en millisecondes, 10000 par défaut, comptée après la résolution du jeton.                                                                                                       |

## Signature

```ts
export interface QueueClientOptions {
  readonly url: string;
  readonly token: string | (() => string | Promise<string>);
  readonly timeoutMs?: number;
}
```
