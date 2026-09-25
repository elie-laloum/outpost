---
title: "ConversationRecord"
description: "ConversationRecord — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ConversationRecord**. Consultez le [guide conversations](../../guide/agents/conversations/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ConversationRecord } from "@elie-laloum/outpost";
```

## Rôle et comportement

Localiser, capturer, restaurer et déplacer les transcripts natifs séparément de l’authentification.

Le home de conversation vaut par défaut le home système. Une continuation froide exige un transcript restaurable avant allocation. Un fork ne copie pas un workspace.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                                             |
| -------- | -------- | -------- | -------------------------------------------------------------------------------- |
| `id`     | `string` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `file`   | `string` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `format` | `string` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface ConversationRecord {
  readonly id: string;
  readonly file: string;
  readonly format: string;
}
```
