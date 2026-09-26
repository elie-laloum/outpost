---
title: "HarnessToolResultView"
description: "HarnessToolResultView — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessToolResultView } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type      | Présence | Rôle                                          |
| --------- | --------- | -------- | --------------------------------------------- |
| `content` | `string`  | Requis   | Texte qui sera envoyé au modèle pour l’appel. |
| `isError` | `boolean` | Requis   | Indique si l’appel est signalé en échec.      |

## Signature

```ts
export interface HarnessToolResultView {
  readonly content: string;
  readonly isError: boolean;
}
```
