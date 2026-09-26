---
title: "PermissionDecision"
description: "PermissionDecision — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { PermissionDecision } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom       | Type            | Présence          | Rôle                                |
| --------- | --------------- | ----------------- | ----------------------------------- |
| `allowed` | `true \| false` | Requis            | Indique si l’appel peut s’exécuter. |
| `reason`  | `string`        | Selon la variante | Pourquoi l’appel a été refusé.      |

## Signature

```ts
export type PermissionDecision =
  | {
      readonly allowed: true;
    }
  | {
      readonly allowed: false;
      readonly reason: string;
    };
```
