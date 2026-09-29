---
title: "UsageCredential"
description: "UsageCredential — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { UsageCredential } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom        | Type     | Présence          | Rôle                                                                                                                                                                                                        |
| ---------- | -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`      | `string` | Selon la variante | Clé API littérale transmise dans la variable de clé API de la CLI : ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY ou KIMI_API_KEY. Préférez variable pour garder les secrets hors des fichiers sources. |
| `variable` | `string` | Selon la variante | Nom d’une variable résolue du workflow contenant la clé API ; sa valeur est transmise dans la variable de clé API standard de la CLI.                                                                       |

## Signature

```ts
export type UsageCredential =
  | {
      readonly key: string;
    }
  | {
      readonly variable: string;
    };
```
