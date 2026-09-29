---
title: "SlackRequestOptions"
description: "SlackRequestOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SlackRequestOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                          |
| --------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signingSecret` | `TriggerSecret`       | Requis    | Secret de signature de l’application Slack qui vérifie X-Slack-Signature. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes. |
| `toleranceMs`   | `number \| undefined` | Optionnel | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut.                                                                                                                                                    |

## Signature

```ts
export interface SlackRequestOptions {
  /** App signing secret verifying `X-Slack-Signature`. */
  readonly signingSecret: TriggerSecret;
  readonly toleranceMs?: number;
}
```

## Contrats associés

- [TriggerSecret](../triggersecret/)
