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

| Nom      | Type            | Présence | Rôle                                                                                                                                                                                                                                                                |
| -------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secret` | `TriggerSecret` | Requis   | Secret du webhook qui vérifie X-Hub-Signature-256, ou callback renvoyant chaque secret actuellement accepté (l’ancien et le nouveau pendant une rotation). Une chaîne vide lève une erreur à la création ; un callback en échec ou sans secret refuse les requêtes. |

## Signature

```ts
export interface GithubWebhookOptions {
  /** Webhook secret verifying `X-Hub-Signature-256`. */
  readonly secret: TriggerSecret;
}
```

## Contrats associés

- [TriggerSecret](../triggersecret/)
