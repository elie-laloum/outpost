---
title: "GithubWebhookOptions"
description: "GithubWebhookOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GithubWebhookOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type            | Présence | Rôle                                                                                                                                                                                                                                          |
| -------- | --------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secret` | `TriggerSecret` | Requis   | Secret du webhook GitHub qui vérifie X-Hub-Signature-256. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes. |

## Signature

```ts
export interface GithubWebhookOptions {
  /** Webhook secret verifying `X-Hub-Signature-256`. */
  readonly secret: TriggerSecret;
}
```

## Contrats associés

- [TriggerSecret](../triggersecret/)
