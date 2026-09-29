---
title: "TriggerRoute"
description: "TriggerRoute — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerRoute } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                                                                                   | Présence | Rôle                                                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`   | `string`                                                                               | Requis   | Chemin exact de la requête, comme /github, unique parmi les routes ; il fait partie de chaque identifiant de job.                                                           |
| `source` | `TriggerSource`                                                                        | Requis   | Source qui vérifie et normalise les requêtes sur ce chemin.                                                                                                                 |
| `on`     | `(event: TriggerEvent) => TriggerJob \| undefined \| Promise<TriggerJob \| undefined>` | Requis   | Associe un événement vérifié à un job, ou renvoie undefined pour l’ignorer ; une erreur levée répond 500. Doit répondre vite, car les émetteurs abandonnent après un délai. |

## Signature

```ts
export interface TriggerRoute {
  /** Exact request path, such as `/github`; part of each job identifier. */
  readonly path: string;
  readonly source: TriggerSource;
  /** Maps a verified event to a job, or `undefined` to ignore it; must return promptly. */
  on(
    event: TriggerEvent,
  ): TriggerJob | undefined | Promise<TriggerJob | undefined>;
}
```

## Contrats associés

- [TriggerEvent](../triggerevent/)
- [TriggerJob](../triggerjob/)
- [TriggerSource](../triggersource/)
