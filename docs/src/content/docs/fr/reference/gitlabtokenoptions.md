---
title: "GitlabTokenOptions"
description: "GitlabTokenOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GitlabTokenOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type            | Présence | Rôle                                                                                                                                                                                                                                                                  |
| ------- | --------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token` | `TriggerSecret` | Requis   | Jeton secret comparé à X-Gitlab-Token ; plus faible car le corps n’est pas signé. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes. |

## Signature

```ts
export interface GitlabTokenOptions {
  /** Plain-text `X-Gitlab-Token`; weaker, since the request body is not signed. */
  readonly token: TriggerSecret;
}
```

## Contrats associés

- [TriggerSecret](../triggersecret/)
