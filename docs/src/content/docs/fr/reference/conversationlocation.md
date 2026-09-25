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

| Nom      | Type                 | Présence | Rôle                                                                                |
| -------- | -------------------- | -------- | ----------------------------------------------------------------------------------- |
| `id`     | `string`             | Requis   | Identifiant de conversation native utilisé pour localiser ou poursuivre la session. |
| `file`   | `string`             | Requis   | Chemin hôte du fichier de transcript natif.                                         |
| `format` | `ConversationFormat` | Requis   | Organisation native des transcripts : claude ou codex.                              |

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
