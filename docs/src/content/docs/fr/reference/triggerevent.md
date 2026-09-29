---
title: "TriggerEvent"
description: "TriggerEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                  | Présence  | Rôle                                                                                                                                     |
| ------------ | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `source`     | `string`              | Requis    | Nom de la source, comme github, gitlab, slack ou standard.                                                                               |
| `delivery`   | `string`              | Requis    | Identifiant de livraison de l’émetteur, partagé par les nouvelles tentatives d’une livraison ; de 1 à 200 caractères ASCII visibles.     |
| `kind`       | `string`              | Requis    | Type d’événement : nom d’événement GitHub, object_kind GitLab, command ou type d’interaction Slack, ou type de charge Standard Webhooks. |
| `action`     | `string \| undefined` | Optionnel | Sous-action lorsque l’émetteur en fournit une, comme labeled, update ou le nom de la commande Slack.                                     |
| `actor`      | `string \| undefined` | Optionnel | Identité authentifiée par l’émetteur, comme github:octocat, gitlab:user ou slack:U123 ; pas un acteur de gate Outpost.                   |
| `payload`    | `WorkflowJson`        | Requis    | Charge de la requête analysée ; lisez-la avec les helpers ou affinez son type avant usage.                                               |
| `receivedAt` | `string`              | Requis    | Heure ISO à laquelle le serveur a vérifié la requête.                                                                                    |

## Signature

```ts
export interface TriggerEvent {
  readonly source: string;
  /** Sender delivery identifier; retries of one delivery share it. */
  readonly delivery: string;
  readonly kind: string;
  readonly action?: string;
  /** Sender-authenticated identity such as `github:octocat`; not an Outpost actor. */
  readonly actor?: string;
  readonly payload: WorkflowJson;
  readonly receivedAt: string;
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
