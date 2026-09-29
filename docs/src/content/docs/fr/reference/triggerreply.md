---
title: "TriggerReply"
description: "TriggerReply — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerReply } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                           |
| ------------- | --------------------- | --------- | -------------------------------------------------------------- |
| `status`      | `number`              | Requis    | Statut HTTP renvoyé à l’émetteur.                              |
| `body`        | `string \| undefined` | Optionnel | Texte du corps de réponse ; la réponse est vide s’il est omis. |
| `contentType` | `string \| undefined` | Optionnel | Type de contenu du corps, lorsqu’il y en a un.                 |

## Signature

```ts
export interface TriggerReply {
  readonly status: number;
  readonly body?: string;
  readonly contentType?: string;
}
```
