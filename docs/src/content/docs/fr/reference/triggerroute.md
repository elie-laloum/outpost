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

| Nom      | Type                                                                                   | Présence | Rôle                                                                                                                                                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`   | `string`                                                                               | Requis   | Chemin exact de la requête commençant par /, comme /github, d’au plus 128 lettres, chiffres, points, tirets bas, tildes, barres obliques ou tirets. Unique parmi les routes et intégré à chaque identifiant de job.                                                                   |
| `source` | `TriggerSource`                                                                        | Requis   | Source qui vérifie et normalise les requêtes sur ce chemin.                                                                                                                                                                                                                           |
| `on`     | `(event: TriggerEvent) => TriggerJob \| undefined \| Promise<TriggerJob \| undefined>` | Requis   | Associe un événement vérifié à un job, ou renvoie undefined pour l’ignorer (204) ; une erreur levée ou un job invalide répond 500. Répondez vite et de façon déterministe : les émetteurs abandonnent après un délai, et la file refuse un autre job pour une livraison connue (503). |

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
