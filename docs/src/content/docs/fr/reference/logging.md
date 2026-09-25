---
title: "Logging"
description: "Logging — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Logging } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom       | Type                   | Présence          | Rôle                                                                     |
| --------- | ---------------------- | ----------------- | ------------------------------------------------------------------------ |
| `file`    | `string \| undefined`  | Selon la variante | Chemin de destination du journal du dispatch.                            |
| `verbose` | `boolean \| undefined` | Selon la variante | Inclut les observations brutes du protocole dans le journal du dispatch. |

## Signature

```ts
export type Logging =
  | false
  | "stdout"
  | {
      readonly file?: string;
      readonly verbose?: boolean;
    };
```
