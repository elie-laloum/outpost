---
title: "HarnessToolResultView"
description: "HarnessToolResultView — Outpost API"
sidebar:
  order: 20
---

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
