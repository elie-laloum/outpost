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

| Nom     | Type            | Présence | Rôle                                                                                                                                                                                                                                                            |
| ------- | --------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token` | `TriggerSecret` | Requis   | Jeton secret comparé en temps constant à X-Gitlab-Token, ou callback renvoyant chaque jeton actuellement accepté ; plus faible, car le corps n’est pas signé. Une chaîne vide lève une erreur à la création ; un callback en échec ou vide refuse les requêtes. |

## Signature

```ts
export interface GitlabTokenOptions {
  /** Plain-text `X-Gitlab-Token`; weaker, since the request body is not signed. */
  readonly token: TriggerSecret;
}
```

## Contrats associés

- [TriggerSecret](../triggersecret/)
