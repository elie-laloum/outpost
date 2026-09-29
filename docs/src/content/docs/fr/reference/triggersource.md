---
title: "TriggerSource"
description: "TriggerSource — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerSource } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                                                                     | Présence  | Rôle                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string`                                                                 | Requis    | Nom de la source indiqué dans TriggerEvent.source.                                                                                                                      |
| `verify` | `(request: TriggerHttpRequest, now: number) => Promise<TriggerEvent>`    | Requis    | Authentifie la requête et renvoie l’événement normalisé ; lever une erreur la refuse avec 401.                                                                          |
| `reply`  | `((outcome: TriggerOutcome, job?: string) => TriggerReply) \| undefined` | Optionnel | Remplace les réponses par défaut, 202 avec l’identifiant du job en JSON ou 204 pour un événement ignoré, pour les émetteurs qui attendent un autre statut, comme Slack. |

## Signature

```ts
export interface TriggerSource {
  readonly name: string;
  verify(request: TriggerHttpRequest, now: number): Promise<TriggerEvent>;
  /** Overrides the default 202/204 replies when the sender expects another status. */
  reply?(outcome: TriggerOutcome, job?: string): TriggerReply;
}
```

## Contrats associés

- [TriggerEvent](../triggerevent/)
- [TriggerHttpRequest](../triggerhttprequest/)
- [TriggerOutcome](../triggeroutcome/)
- [TriggerReply](../triggerreply/)
