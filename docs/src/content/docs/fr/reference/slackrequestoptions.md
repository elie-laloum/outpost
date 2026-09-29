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

| Nom             | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                                                |
| --------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signingSecret` | `TriggerSecret`       | Requis    | Secret de signature de l’application Slack qui vérifie X-Slack-Signature, ou callback renvoyant chaque secret actuellement accepté (l’ancien et le nouveau pendant une rotation). Une chaîne vide lève une erreur à la création ; un callback en échec ou vide refuse les requêtes. |
| `toleranceMs`   | `number \| undefined` | Optionnel | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut. Une valeur qui n’est pas un entier positif lève une erreur à la création.                                                                                                |

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
