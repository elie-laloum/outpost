---
title: "TriggerHttpRequest"
description: "TriggerHttpRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerHttpRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                            | Présence | Rôle                                                                                               |
| --------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `method`  | `string`                                        | Requis   | Méthode HTTP ; les routes ne reçoivent que POST.                                                   |
| `path`    | `string`                                        | Requis   | Chemin de la requête sans chaîne de requête.                                                       |
| `headers` | `Readonly<Record<string, string \| undefined>>` | Requis   | En-têtes de la requête aux noms en minuscules ; les en-têtes répétés sont joints par des virgules. |
| `body`    | `Uint8Array<ArrayBufferLike>`                   | Requis   | Octets bruts du corps, vérifiés avant toute analyse.                                               |

## Signature

```ts
export interface TriggerHttpRequest {
  readonly method: string;
  readonly path: string;
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly body: Uint8Array;
}
```
