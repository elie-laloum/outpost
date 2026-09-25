---
title: "HarnessInput"
description: "HarnessInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessInput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                                                                   |
| -------- | -------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `prompt` | `string` | Requis   | Prompt préparé pour cette passe, avec les valeurs du brief et les instructions de réponse configurées. |

## Signature

```ts
export interface HarnessInput {
  readonly prompt: string;
}
```
