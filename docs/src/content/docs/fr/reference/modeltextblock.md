---
title: "ModelTextBlock"
description: "ModelTextBlock — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer avant publication.
:::

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
