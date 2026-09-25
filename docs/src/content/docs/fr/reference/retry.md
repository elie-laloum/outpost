---
title: "Retry"
description: "Retry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Retry**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Retry } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom        | Type                                                          | Présence  | Rôle                                                                             |
| ---------- | ------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `attempts` | `number`                                                      | Requis    | Nombre de tentatives ou limite d’admission selon le contrat.                     |
| `delayMs`  | `number \| undefined`                                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `accepts`  | `((error: unknown, attempt: number) => boolean) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface Retry {
  readonly attempts: number;
  readonly delayMs?: number;
  readonly accepts?: (error: unknown, attempt: number) => boolean;
}
```
