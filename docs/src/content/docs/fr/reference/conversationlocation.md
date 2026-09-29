---
title: "ConversationLocation"
description: "ConversationLocation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConversationLocation } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                                                |
| -------- | -------- | -------- | ----------------------------------------------------------------------------------- |
| `id`     | `string` | Requis   | Identifiant de conversation native utilisé pour localiser ou poursuivre la session. |
| `file`   | `string` | Requis   | Chemin sur l’hôte du transcript ou du bundle de session capturé.                    |
| `format` | `string` | Requis   | Nom de format persisté, par exemple claude, codex, copilot, kimi ou harness.        |

## Signature

```ts
export interface ConversationLocation {
  readonly id: string;
  readonly file: string;
  readonly format: ConversationFormat;
}
```

## Contrats associés

- [ConversationFormat](../conversationformat/)
