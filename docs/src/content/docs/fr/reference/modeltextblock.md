---
title: "ModelTextBlock"
description: "ModelTextBlock — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelTextBlock } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom    | Type     | Présence | Rôle                                                                           |
| ------ | -------- | -------- | ------------------------------------------------------------------------------ |
| `type` | `"text"` | Requis   | Discriminant du bloc : text.                                                   |
| `text` | `string` | Requis   | Texte brut du bloc ; les blocs de texte vides ne sont pas envoyés à Anthropic. |

## Signature

```ts
export interface ModelTextBlock {
  readonly type: "text";
  readonly text: string;
}
```
